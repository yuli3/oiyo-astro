import {describe,it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import JoseonTwoLenses from '../../components/ontology/JoseonTwoLenses';
const scores={dongin:8,seoin:0,namin:0,bukin:0,noron:0,soron:0};
describe('public comparison view without a birth record',()=>{
 for(const [locale,title] of [['ko','생년의 상징'],['en','Birth symbolism'],['ja','生年月日の象徴'],['zh','出生象征'],['fr','Symboles de naissance'],['es','Símbolos de nacimiento']]) it(`${locale}: localized comparison, numeric meters and no replacement input form`,()=>{
  const html=renderToStaticMarkup(<JoseonTwoLenses locale={locale} scores={scores}/>);
  expect(html).toContain(title);expect(html.match(/role="meter"/g)).toHaveLength(3);
  expect(html).toContain('aria-valuemin="-100"');expect(html).toContain('aria-valuemax="100"');
  expect(html).not.toContain('<input');expect(html).not.toContain('undefined');
  expect(html).toContain(`/${locale}/saju/calculator/`);
  if(locale!=='ko') expect(html).not.toMatch(/[가-힣]/);
 });
 it('does not render a completed comparison from zero or absent answer scores',()=>{
  expect(renderToStaticMarkup(<JoseonTwoLenses locale="en" scores={{}}/>)).toBe('');
 });
});
