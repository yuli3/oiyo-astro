import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
const manifest=JSON.parse(readFileSync('public/images/grok-20261106/manifest.json','utf8'));
let pages=0;
for(const asset of manifest.assets){
 const data=readFileSync(`public${asset.path}`);
 assert.equal(createHash('sha256').update(data).digest('hex'),asset.sha256);
 assert(!JSON.stringify(asset).includes('/Users/'),'public manifest must not leak workstation paths');
 if(asset.type==='og'){
  const source=readFileSync('src/data/generated-art.ts','utf8');
  const map=JSON.parse(source.match(/GENERATED_OG[^=]*= ([\s\S]*?);/)[1]);
  const route=Object.keys(map).find(key=>map[key]===asset.path);assert(route);
  for(const lang of ['ko','en','ja','zh','fr','es']){
   const file=`dist/${lang}${route}/index.html`;
   if(!existsSync(file))continue;
   assert(readFileSync(file,'utf8').includes(asset.path),`${file}: missing OG`);pages++;
  }
 }
 if(asset.type==='illustration'){
  const symbol=asset.id.replace('oiyo-illustration-dream-','');
  for(const lang of ['ko','en','ja','zh','fr','es']){
   const file=`dist/${lang}/dream/${symbol}/index.html`;
   assert(readFileSync(file,'utf8').includes(`src="${asset.path}"`),file);pages++;
  }
 }
}
assert.equal(manifest.assets.length,171);
console.log(`PASS: 171 hashes; ${pages} generated HTML references; no local paths in public manifest`);
