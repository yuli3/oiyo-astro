// 출생지 검색 계약. 이 모듈이 깨지면 조용히 틀린 경도가 사주·natal 계산에 들어간다.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  __resetCityBundleCache, loadCityBundle, normalize, parseSynthesizedId,
  searchCities, searchRows, synthesizeId,
} from './city-search';

type Row = [string, string, string, number, number, string, string];
const ROWS: Row[] = [
  ['Seoul', '', 'KR', 37.5665, 126.978, 'Asia/Seoul', '서울|ソウル|首尔'],
  ['Bogotá', 'Bogota', 'CO', 4.6097, -74.0817, 'America/Bogota', ''],
  // GeoNames 는 김해를 옛 로마자 "Kimhae" 로 적는다. 한글 별칭이 없으면
  // 한국 사용자가 김해로도 Gimhae 로도 찾지 못한다.
  ['Kimhae', '', 'KR', 35.2342, 128.8811, 'Asia/Seoul', '김해'],
  ['New Seoul Town', '', 'US', 40.0, -75.0, 'America/New_York', ''],
];
const bundle = (cities: Row[] = ROWS) => vi.fn(async () => ({
  ok: true, status: 200,
  json: async () => ({ schema: 'oiyo.geonames-cities', schemaVersion: 2, cities }),
})) as unknown as typeof fetch;

beforeEach(() => __resetCityBundleCache());

describe('normalize', () => {
  it('발음 구별 부호를 지워 Bogotá 를 bogota 로 찾게 한다', () => {
    expect(normalize('Bogotá')).toBe('bogota');
    expect(normalize('  SÉOUL ')).toBe('seoul');
  });
});

describe('synthesized id', () => {
  it('좌표를 담아 왕복한다 — 저장된 프로필을 번들 없이 되살리기 위해서다', () => {
    const id = synthesizeId(ROWS[0]);
    expect(id).toBe('gn:37.5665,126.978');
    expect(parseSynthesizedId(id)).toEqual({ lat: 37.5665, lon: 126.978 });
  });
  it('기존 CITIES id 형식과 섞이지 않는다', () => {
    expect(parseSynthesizedId('seoul')).toBeNull();
    expect(parseSynthesizedId('gn:abc,def')).toBeNull();
  });
  it('범위 밖 좌표는 거부한다 — 조용히 통과하면 계산이 틀린다', () => {
    expect(parseSynthesizedId('gn:91,0')).toBeNull();
    expect(parseSynthesizedId('gn:0,181')).toBeNull();
  });
});

describe('searchRows', () => {
  it('한 글자로는 검색하지 않는다 — 34,128행 전수 순회를 막는다', () => {
    expect(searchRows(ROWS, 's')).toEqual([]);
  });
  it('앞부분 일치를 포함 일치보다 먼저 준다', () => {
    const hits = searchRows(ROWS, 'seoul');
    expect(hits[0][0]).toBe('Seoul');
    expect(hits.map((r) => r[0])).toContain('New Seoul Town');
    expect(hits.indexOf(hits.find((r) => r[0] === 'New Seoul Town')!))
      .toBeGreaterThan(hits.indexOf(hits.find((r) => r[0] === 'Seoul')!));
  });
  it('한글로 찾는다 — GeoNames primary name 이 옛 로마자라 이것 없이는 못 찾는다', () => {
    expect(searchRows(ROWS, '김해').map((r) => r[0])).toContain('Kimhae');
    expect(searchRows(ROWS, '서울').map((r) => r[0])).toContain('Seoul');
  });
  it('가나·한자로도 찾는다', () => {
    expect(searchRows(ROWS, 'ソウル').map((r) => r[0])).toContain('Seoul');
    expect(searchRows(ROWS, '首尔').map((r) => r[0])).toContain('Seoul');
  });
  it('발음 구별 부호 없이 찾는다', () => {
    expect(searchRows(ROWS, 'bogota').map((r) => r[0])).toContain('Bogotá');
  });
});

describe('searchCities', () => {
  it('경도·시간대를 그대로 실어 준다 — 이 값이 진태양시 계산으로 간다', async () => {
    const hits = await searchCities('seoul', 20, bundle());
    const seoul = hits.find((h) => h.city.label.ko === 'Seoul')!;
    expect(seoul.city.lon).toBe(126.978);
    expect(seoul.city.zoneId).toBe('Asia/Seoul');
    expect(seoul.countryCode).toBe('KR');
  });

  it('6 로케일 라벨이 모두 같은 값이고 번역을 지어내지 않는다', async () => {
    const [hit] = await searchCities('bogota', 1, bundle());
    const labels = Object.values(hit.city.label);
    expect(labels).toHaveLength(6);
    expect(new Set(labels).size).toBe(1);
    expect(hit.untranslated).toBe(true);
  });

  it('tz 숫자 오프셋을 추정하지 않는다 — DST 때문에 고정값은 틀린다', async () => {
    const [hit] = await searchCities('seoul', 1, bundle());
    expect(hit.city.tz).toBe(0);
    expect(hit.city.zoneId).toBe('Asia/Seoul');
  });

  it('번들을 한 번만 받는다', async () => {
    const f = bundle();
    await Promise.all([searchCities('seoul', 5, f), searchCities('bogota', 5, f)]);
    await searchCities('seoul', 5, f);
    expect((f as unknown as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(1);
  });

  it('스키마·버전이 다르면 조용히 넘어가지 않고 실패한다', async () => {
    const noSchema = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ cities: [] }) })) as unknown as typeof fetch;
    await expect(loadCityBundle(noSchema)).rejects.toThrow(/schema/);
    __resetCityBundleCache();
    // v1 은 nativeNames 가 없어 한글 검색이 조용히 실패한다. 버전을 확인한다.
    const v1 = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ schema: 'oiyo.geonames-cities', schemaVersion: 1, cities: [] }) })) as unknown as typeof fetch;
    await expect(loadCityBundle(v1)).rejects.toThrow(/schema/);
  });

  it('네트워크 실패를 삼키지 않는다', async () => {
    const bad = vi.fn(async () => ({ ok: false, status: 404, json: async () => ({}) })) as unknown as typeof fetch;
    await expect(loadCityBundle(bad)).rejects.toThrow(/404/);
  });
});
