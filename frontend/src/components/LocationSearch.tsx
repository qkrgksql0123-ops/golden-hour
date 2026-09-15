import { useEffect, useRef, useState } from "react";
import type { Coords } from "../hooks/useGeolocation";

interface Place {
  id: string;
  name: string;
  address: string;
  coords: Coords;
}

interface Props {
  ready: boolean;
  onPick: (coords: Coords, label: string) => void;
  onClose: () => void;
}

/**
 * 주소·장소 검색 (카카오 로컬).
 * 위치 권한을 거부한 사용자가 서비스를 쓸 수 있는 유일한 경로라 반드시 필요하다 해.
 */
export function LocationSearch({ ready, onPick, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [state, setState] = useState<"idle" | "searching" | "empty">("idle");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function search(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || !ready) return;

    setState("searching");
    const places = new window.kakao.maps.services.Places();
    places.keywordSearch(query, (data: any[], status: string) => {
      if (status !== window.kakao.maps.services.Status.OK) {
        setResults([]);
        setState("empty");
        return;
      }
      setResults(
        data.slice(0, 8).map((d) => ({
          id: d.id,
          name: d.place_name,
          address: d.road_address_name || d.address_name,
          coords: { lat: Number(d.y), lng: Number(d.x) },
        })),
      );
      setState("idle");
    });
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="위치 검색">
      <div className="modal__box">
        <div className="modal__head">
          <h2 className="modal__title">위치 변경</h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="닫기">✕</button>
        </div>

        {!ready && (
          <p className="modal__warn">
            지도 키가 없어 검색을 사용할 수 없습니다. <code>.env</code> 에 <code>VITE_KAKAO_JS_KEY</code> 를 넣어 주세요.
          </p>
        )}

        <form className="modal__form" onSubmit={search}>
          <input
            ref={inputRef}
            className="modal__input"
            placeholder="주소나 건물 이름 (예: 강남역)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={!ready}
          />
          <button type="submit" className="btn" disabled={!ready}>검색</button>
        </form>

        {state === "searching" && <p className="modal__hint">검색 중…</p>}
        {state === "empty" && <p className="modal__hint">검색 결과가 없습니다. 다른 이름으로 찾아보세요.</p>}

        <ul className="modal__list">
          {results.map((p) => (
            <li key={p.id}>
              <button type="button" className="modal__result" onClick={() => onPick(p.coords, p.name)}>
                <span className="modal__result-name">{p.name}</span>
                <span className="modal__result-addr">{p.address}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
