import { describe, it, expect } from 'vitest';
import { sanctuaryCopy } from './copy';
import { LOCALES } from '../../i18n';
describe('sanctuary six-language surface',()=>{
  it('has equal complete UI keys and explicit privacy/audio disclosures',()=>{
    for(const locale of LOCALES){
      const t=sanctuaryCopy[locale];
      expect(Object.keys(t).sort()).toEqual(Object.keys(sanctuaryCopy.en).sort());
      expect(Object.keys(t.statuses).sort()).toEqual(Object.keys(sanctuaryCopy.en.statuses).sort());
      expect(t.scenes).toHaveLength(3);
      for(const key of ['privacy','soundNote','art','help'] as const)expect(t[key].length).toBeGreaterThan(10);
    }
  });
});
