package com.codeblue.goldenhour.service;

import com.codeblue.goldenhour.dto.FacilityResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import tools.jackson.databind.JsonNode;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 내 위치 주변에서 지금 문 연 약국을 조회한다 해.
 *
 * 1순위: 공공데이터 getParmacyLcinfoInqire (오늘 영업 시작/종료 시각 제공 → 영업 중인 곳만 반환)
 * 대체: 카카오 로컬 API 카테고리 검색 PM9. 영업시간이 없어서 closesAt 은 null 이고 화면은 "시간 미제공"으로 표시한다 해.
 */
@Slf4j
@Service
public class FacilityService {

	private static final String PUBLIC_URL =
			"http://apis.data.go.kr/B552657/ErmctInsttInfoInqireService/getParmacyLcinfoInqire";
	private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");
	private static final String URL = "https://dapi.kakao.com/v2/local/search/category.json";
	private static final int RADIUS_M = 3000;
	private static final int PAGE_SIZE = 15;
	private static final int MAX_PAGES = 3;
	private static final long CACHE_MS = 60_000;

	private record Cached(long at, List<FacilityResponse> items) {}

	private final Map<String, Cached> cache = new ConcurrentHashMap<>();
	private final RestClient rest = RestClient.create();

	@Value("${external.kakao.rest-api-key:}")
	private String restApiKey;

	@Value("${external.ncmc.service-key:}")
	private String ncmcKey;

	/**
	 * 지금 문 연 약국. 공공데이터 API(오늘 영업시간 제공)를 우선 쓰고, 키가 없거나 실패하면 카카오 검색으로 대체한다 해.
	 */
	public List<FacilityResponse> findNearbyPharmacies(double lat, double lng) {
		if (!ncmcKey.isBlank()) {
			String key = String.format("P:%.3f,%.3f", lat, lng);
			Cached hit = cache.get(key);
			if (hit != null && System.currentTimeMillis() - hit.at() < CACHE_MS) {
				return hit.items();
			}
			try {
				List<FacilityResponse> open = findOpenViaPublicApi(lat, lng);
				cache.put(key, new Cached(System.currentTimeMillis(), open));
				return open;
			} catch (Exception e) {
				log.warn("공공데이터 약국 조회 실패, 카카오로 대체: {}", e.getMessage());
			}
		}
		return findViaKakao(lat, lng);
	}

	private List<FacilityResponse> findOpenViaPublicApi(double lat, double lng) throws Exception {
		String key = ncmcKey.contains("%") ? ncmcKey : URLEncoder.encode(ncmcKey, StandardCharsets.UTF_8);
		URI uri = URI.create(PUBLIC_URL + "?serviceKey=" + key + "&WGS84_LON=" + lng + "&WGS84_LAT=" + lat
				+ "&pageNo=1&numOfRows=100");
		byte[] body = rest.get().uri(uri).retrieve().body(byte[].class);
		if (body == null) {
			throw new IllegalStateException("빈 응답");
		}
		var doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(new ByteArrayInputStream(body));
		String code = doc.getElementsByTagName("resultCode").item(0).getTextContent();
		if (!"00".equals(code)) {
			throw new IllegalStateException("resultCode=" + code);
		}

		int nowMin = LocalTime.now(SEOUL).getHour() * 60 + LocalTime.now(SEOUL).getMinute();
		NodeList items = doc.getElementsByTagName("item");
		List<FacilityResponse> result = new ArrayList<>();
		for (int i = 0; i < items.getLength(); i++) {
			Element it = (Element) items.item(i);
			double km = parseDouble(text(it, "distance"), Double.NaN);
			Integer start = toMinutes(text(it, "startTime"));
			Integer end = toMinutes(text(it, "endTime"));
			if (Double.isNaN(km) || km * 1000 > RADIUS_M || start == null || end == null) {
				continue;
			}
			if (!isOpen(start, end, nowMin)) {
				continue;
			}
			String hhmm = text(it, "endTime");
			result.add(new FacilityResponse(
					(long) Math.abs(text(it, "hpid").hashCode()),
					text(it, "dutyName"),
					"PHARMACY",
					text(it, "dutyAddr") == null ? "" : text(it, "dutyAddr"),
					text(it, "dutyTel1") == null ? "" : text(it, "dutyTel1"),
					parseDouble(text(it, "latitude"), 0),
					parseDouble(text(it, "longitude"), 0),
					km * 1000,
					hhmm.substring(0, 2) + ":" + hhmm.substring(2)
			));
		}
		return result;
	}

	/** 종료 시각이 시작보다 이르거나 같으면 자정을 넘겨 영업하는 것으로 본다 해 (예: 2200~0200, 0000~2400). */
	private static boolean isOpen(int start, int end, int now) {
		if (end > start) {
			return now >= start && now < end;
		}
		return now >= start || now < end;
	}

	private static Integer toMinutes(String hhmm) {
		if (hhmm == null || hhmm.length() != 4) {
			return null;
		}
		try {
			return Integer.parseInt(hhmm.substring(0, 2)) * 60 + Integer.parseInt(hhmm.substring(2));
		} catch (NumberFormatException e) {
			return null;
		}
	}

	private static double parseDouble(String v, double fallback) {
		try {
			return v == null ? fallback : Double.parseDouble(v);
		} catch (NumberFormatException e) {
			return fallback;
		}
	}

	private static String text(Element parent, String tag) {
		NodeList n = parent.getElementsByTagName(tag);
		if (n.getLength() == 0) {
			return null;
		}
		String v = n.item(0).getTextContent().trim();
		return v.isEmpty() ? null : v;
	}

	private List<FacilityResponse> findViaKakao(double lat, double lng) {
		if (restApiKey.isBlank()) {
			return List.of();
		}
		String key = String.format("%.3f,%.3f", lat, lng);
		Cached hit = cache.get(key);
		if (hit != null && System.currentTimeMillis() - hit.at() < CACHE_MS) {
			return hit.items();
		}

		List<FacilityResponse> result = new ArrayList<>();
		try {
			for (int page = 1; page <= MAX_PAGES; page++) {
				JsonNode body = fetchPage(lat, lng, page);
				if (body == null) {
					break;
				}
				for (JsonNode d : body.path("documents")) {
					result.add(toResponse(d));
				}
				if (body.path("meta").path("is_end").asBoolean(true)) {
					break;
				}
			}
		} catch (Exception e) {
			log.warn("카카오 약국 검색 실패: {}", e.getMessage());
			return hit != null ? hit.items() : List.of();
		}
		cache.put(key, new Cached(System.currentTimeMillis(), result));
		return result;
	}

	private JsonNode fetchPage(double lat, double lng, int page) {
		var uri = UriComponentsBuilder.fromUriString(URL)
				.queryParam("category_group_code", "PM9")
				.queryParam("x", lng)
				.queryParam("y", lat)
				.queryParam("radius", RADIUS_M)
				.queryParam("sort", "distance")
				.queryParam("size", PAGE_SIZE)
				.queryParam("page", page)
				.build().toUri();
		return rest.get().uri(uri)
				.header("Authorization", "KakaoAK " + restApiKey)
				.retrieve()
				.body(JsonNode.class);
	}

	private FacilityResponse toResponse(JsonNode d) {
		String road = d.path("road_address_name").asText("");
		String address = road.isBlank() ? d.path("address_name").asText("") : road;
		String distance = d.path("distance").asText("");
		return new FacilityResponse(
				d.path("id").asLong(),
				d.path("place_name").asText(),
				"PHARMACY",
				address,
				d.path("phone").asText(""),
				d.path("y").asDouble(),
				d.path("x").asDouble(),
				distance.isBlank() ? null : Double.valueOf(distance),
				null
		);
	}
}
