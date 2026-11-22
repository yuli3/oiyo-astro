import { describe, expect, it } from 'vitest';
import { JP_SPOTS, KR_SPOTS, firstSunrise, sunriseNoaa, sunriseTable } from './sunrise-2027';

const at = (spots: typeof KR_SPOTS, id: string, year = 2027) => sunriseTable(spots, year).find((r) => r.id === id)!;

describe('sunrise-2027', () => {
  it('matches officially published 2026 first-sunrise times (KASI, NAOJ)', () => {
    expect(at(KR_SPOTS, 'seoul', 2026).sunrise).toBe('07:47');
    expect(at(KR_SPOTS, 'dokdo', 2026).sunrise).toBe('07:26');
    expect(at(KR_SPOTS, 'ganjeolgot', 2026).sunrise).toBe('07:31');
    expect(at(JP_SPOTS, 'tokyo', 2026).sunrise).toBe('06:51');
    expect(at(JP_SPOTS, 'inubozaki', 2026).sunrise).toBe('06:46');
  });

  it('2027 values: Dokdo earliest in Korea, Ganjeolgot earliest on the mainland', () => {
    const kr = sunriseTable(KR_SPOTS).sort((a, b) => a.sunriseMs - b.sunriseMs);
    expect(kr[0].id).toBe('dokdo');
    expect(kr.find((r) => !['dokdo', 'ulleungdo'].includes(r.id))!.id).toBe('ganjeolgot');
    expect(at(KR_SPOTS, 'seoul').sunrise).toBe('07:47');
    expect(at(KR_SPOTS, 'dokdo').sunrise).toBe('07:26');
  });

  it('Minamitorishima is earliest in Japan', () => {
    const jp = sunriseTable(JP_SPOTS).sort((a, b) => a.sunriseMs - b.sunriseMs);
    expect(jp[0].id).toBe('minamitorishima');
    expect(at(JP_SPOTS, 'tokyo').sunrise).toBe('06:51');
  });

  it('civil dawn comes about 25-40 minutes before sunrise', () => {
    for (const r of sunriseTable([...KR_SPOTS, ...JP_SPOTS])) {
      const [sh, sm] = r.sunrise.split(':').map(Number);
      const [dh, dm] = r.dawn.split(':').map(Number);
      const gap = sh * 60 + sm - (dh * 60 + dm);
      expect(gap).toBeGreaterThan(22);
      expect(gap).toBeLessThan(40);
    }
  });

  it('browser NOAA formula stays within 1 minute of astronomy-engine', () => {
    for (const s of [...KR_SPOTS, ...JP_SPOTS]) {
      const ref = firstSunrise(s).sunrise;
      // 1월 1일 일출(UTC+9)은 UTC 1월 1일 0시 이전이라 음수 분으로 나온다
      const noaa = sunriseNoaa(s.lat, s.lon, 2027, 1, 1)!;
      const refMin = (ref.getTime() - Date.UTC(2027, 0, 1)) / 60_000;
      expect(Math.abs(noaa - refMin)).toBeLessThan(1);
    }
  });
});
