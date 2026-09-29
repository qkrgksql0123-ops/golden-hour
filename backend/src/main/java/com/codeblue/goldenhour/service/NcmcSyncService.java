package com.codeblue.goldenhour.service;

import com.codeblue.goldenhour.domain.Hospital;
import com.codeblue.goldenhour.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

/**
 * 국립중앙의료원 응급의료정보 API에서 병원 목록과 실시간 병상을 가져와 hospital 테이블에 upsert한다 해.
 *
 * - 기관 목록(getEgytListInfoInqire): 이름/주소/전화/좌표. 처음 한 번 + 매일 새벽.
 * - 실시간 병상(getEmrrmRltmUsefulSckbdInfoInqire): 1분마다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NcmcSyncService {

	private static final String BASE = "http://apis.data.go.kr/B552657/ErmctInfoInqireService/";
	private static final DateTimeFormatter HVIDATE = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

	@Value("${external.ncmc.service-key:}")
	private String serviceKey;

	private final HospitalRepository hospitalRepository;
	private final RestClient rest = RestClient.create();

	private volatile boolean mastersLoaded = false;

	@Scheduled(fixedDelay = 60_000)
	public void syncBeds() {
		if (serviceKey.isBlank()) {
			return;
		}
		try {
			if (!mastersLoaded) {
				syncMasters();
			}
			doSyncBeds();
		} catch (Exception e) {
			log.warn("병상 동기화 실패: {}", e.getMessage());
		}
	}

	@Scheduled(cron = "0 0 4 * * *")
	public void syncMastersDaily() {
		if (serviceKey.isBlank()) {
			return;
		}
		try {
			syncMasters();
		} catch (Exception e) {
			log.warn("병원 목록 동기화 실패: {}", e.getMessage());
		}
	}

	void syncMasters() throws Exception {
		List<Element> items = fetchItems("getEgytListInfoInqire");
		Map<String, Hospital> byHpid = existingByHpid();
		List<Hospital> toSave = new ArrayList<>();

		for (Element it : items) {
			String hpid = text(it, "hpid");
			String lat = text(it, "wgs84Lat");
			String lng = text(it, "wgs84Lon");
			String name = text(it, "dutyName");
			if (hpid == null || lat == null || lng == null || name == null) {
				continue;
			}
			Hospital h = byHpid.get(hpid);
			if (h == null) {
				h = Hospital.builder().hpid(hpid).createdAt(LocalDateTime.now()).build();
				byHpid.put(hpid, h);
			}
			h.setName(name);
			h.setAddress(text(it, "dutyAddr") == null ? "" : text(it, "dutyAddr"));
			h.setPhone(text(it, "dutyTel3") != null ? text(it, "dutyTel3") : text(it, "dutyTel1"));
			h.setHospitalType(text(it, "dutyEmclsName"));
			h.setLat(new BigDecimal(lat).setScale(6, java.math.RoundingMode.HALF_UP));
			h.setLng(new BigDecimal(lng).setScale(6, java.math.RoundingMode.HALF_UP));
			toSave.add(h);
		}
		hospitalRepository.saveAll(toSave);
		mastersLoaded = !toSave.isEmpty();
		log.info("병원 목록 동기화 완료: {}건", toSave.size());
	}

	private void doSyncBeds() throws Exception {
		List<Element> items = fetchItems("getEmrrmRltmUsefulSckbdInfoInqire");
		Map<String, Hospital> byHpid = existingByHpid();
		List<Hospital> toSave = new ArrayList<>();

		for (Element it : items) {
			Hospital h = byHpid.get(text(it, "hpid"));
			if (h == null) {
				continue;
			}
			h.setLatestGeneralBeds(intOrNull(it, "hvec"));
			h.setLatestPediatricBeds(intOrNull(it, "hv28"));
			h.setLatestIcuBeds(intOrNull(it, "hvicc"));
			h.setBedsUpdatedAt(parseTime(text(it, "hvidate")));
			toSave.add(h);
		}
		hospitalRepository.saveAll(toSave);
		log.info("병상 동기화 완료: {}건", toSave.size());
	}

	private Map<String, Hospital> existingByHpid() {
		Map<String, Hospital> map = new HashMap<>();
		for (Hospital h : hospitalRepository.findAll()) {
			if (h.getHpid() != null) {
				map.put(h.getHpid(), h);
			}
		}
		return map;
	}

	private List<Element> fetchItems(String operation) throws Exception {
		// 포털에서 복사한 인코딩 키(%2F 등)는 그대로, 디코딩 키(+,/,=)면 인코딩해서 이중 인코딩을 피한다 해.
		String key = serviceKey.contains("%") ? serviceKey : URLEncoder.encode(serviceKey, StandardCharsets.UTF_8);
		URI uri = URI.create(BASE + operation + "?serviceKey=" + key + "&pageNo=1&numOfRows=1000");
		byte[] body = rest.get().uri(uri).retrieve().body(byte[].class);
		if (body == null) {
			throw new IllegalStateException("빈 응답: " + operation);
		}
		var doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(new ByteArrayInputStream(body));
		String code = doc.getElementsByTagName("resultCode").item(0).getTextContent();
		if (!"00".equals(code)) {
			throw new IllegalStateException(operation + " resultCode=" + code);
		}
		NodeList nodes = doc.getElementsByTagName("item");
		List<Element> items = new ArrayList<>();
		for (int i = 0; i < nodes.getLength(); i++) {
			items.add((Element) nodes.item(i));
		}
		return items;
	}

	private static String text(Element parent, String tag) {
		NodeList n = parent.getElementsByTagName(tag);
		if (n.getLength() == 0) {
			return null;
		}
		String v = n.item(0).getTextContent().trim();
		return v.isEmpty() ? null : v;
	}

	private static Integer intOrNull(Element parent, String tag) {
		String v = text(parent, tag);
		if (v == null) {
			return null;
		}
		try {
			return Integer.valueOf(v);
		} catch (NumberFormatException e) {
			return null;
		}
	}

	private static LocalDateTime parseTime(String v) {
		if (v == null) {
			return LocalDateTime.now();
		}
		try {
			return LocalDateTime.parse(v, HVIDATE);
		} catch (Exception e) {
			return LocalDateTime.now();
		}
	}
}
