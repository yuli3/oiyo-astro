import { describe, it, expect } from 'vitest';
import { sanctuaryCopy } from './copy';
import { LOCALES } from '../../i18n';
describe('sanctuary six-language surface',()=>{
  it('has equal complete UI keys and explicit privacy/audio disclosures',()=>{
    for(const locale of LOCALES){
      const t=sanctuaryCopy[locale];
      expect(Object.keys(t).sort()).toEqual(Object.keys(sanctuaryCopy.en).sort());
      expect(Object.keys(t.statuses).sort()).toEqual(Object.keys(sanctuaryCopy.en.statuses).sort());
      expect(t.scenes).toHaveLength(9);
      for(const key of ['privacy','soundNote','art','art3d','heritage','help','fireworksdesc','cosmosdesc','raindesc','snowdesc','firefliesdesc','dawndesc'] as const)expect(t[key].length).toBeGreaterThan(10);
    }
  });
  it('names all four walking spots and explains the hall interior in every language',()=>{
    for(const locale of LOCALES){expect(sanctuaryCopy[locale].spots).toHaveLength(4);expect(sanctuaryCopy[locale].hallNote.length).toBeGreaterThan(10);}
  });
  it('credits the Korea Heritage Service scans (KOGL Type 1) in every language',()=>{
    for(const locale of LOCALES)expect(sanctuaryCopy[locale].heritage).toMatch(/KOGL|공공누리|公共ヌリ|公共Nuri/);
  });
});
