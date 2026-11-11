# Sanctuary (온라인 산사) photoreal assets — sources & licenses

Fetched and converted 2026-11-09 (KST). Raw downloads (zips, OBJ, 8K JPG) are kept outside the repo in
`coding/_downloads/sanctuary-photoreal/` and are not committed. Conversion scripts are in
`coding/_downloads/sanctuary-photoreal/tools/` (`build.mjs`, `bigobj.mjs`).

## Where they appear

`src/components/sanctuary/HeritageModels.tsx` (temple scene). The hall and pagoda stand in the courtyard; the
pavilion stands at the back right, and its roof (cut above the walls) also caps the bell pavilion. The attribution
lines below are shown in the page footnote (`heritage` key in `src/components/sanctuary/copy.ts`, six languages).

## Attribution lines (show these wherever the models appear)

- 3D models (hall, pagoda, pavilion): **출처: 국가유산청, 공공누리 제1유형** (Korea Heritage Service, KOGL Type 1 — attribution required, commercial use and modification allowed)
- HDRI and PBR textures: **Poly Haven, CC0** (no attribution required; credited as a courtesy)

## Models — `public/models/sanctuary/`

All three: glTF 2.0 binary, **Y-up, metres (1 unit = 1 m)**, origin centred on X/Z with the lowest point at Y=0
(`center --pivot below`). Each model is a photogrammetry diorama: the building plus its stone platform/ground
slab, so the footprint is larger than the building itself. Materials: unlit-style photo albedo only
(baseColor), metallic 0, roughness 0.9, normals recomputed. Extensions required:
`EXT_meshopt_compression`, `KHR_mesh_quantization`, `EXT_texture_webp` → load with `GLTFLoader` +
`setMeshoptDecoder(MeshoptDecoder)`.

| File | Asset | Source | License (as shown on page, 이용허락범위) | Original download | Output | Triangles (orig → out) | Size (W×H×D m) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `hall.glb` | 창덕궁 영화당 실측모델링 (Yeonghwadang Hall, Changdeokgung) | https://www.data.go.kr/data/15114633/fileData.do — `국가유산청_창덕궁 영화당 실측모델링_20230601` | 공공저작물 : 출처표시 (제 1유형) | `yeonghwadang.zip` 52,131,396 B (OBJ 34.0 MB + 2× 8192² JPG 27.9/14.4 MB + MTL) | 2,429,660 B | 284,804 → **56,950** | 21.56 × 11.15 × 19.18 |
| `pagoda.glb` | 경주 불국사 다보탑 3D 모델링 (Dabotap, Bulguksa) | https://www.data.go.kr/data/15150537/fileData.do — `국가유산청_경주 불국사 다보탑 3D 모델링_20241231` | 공공저작물 : 출처표시 (제 1유형) | `dabotap.zip` 292,040,564 B (OBJ 1,482,156,301 B + 8192² JPG 19.8 MB + MTL) | 845,356 B | 10,718,098 → **23,933** | 18.87 × 10.89 × 18.80 |
| `pavilion.glb` | 창덕궁 사정기비각 실측모델링 (Sajeonggibigak stele pavilion, Changdeokgung) | https://www.data.go.kr/data/15114612/fileData.do — `국가유산청_창덕궁 사정기비각 실측모델링_20230601` | 공공저작물 : 출처표시 (제 1유형) | `sajeonggibigak.zip` 61,660,423 B (OBJ 18.9 MB + 8192² JPG 18.2 MB + MTL; also contains a nested `창덕궁 관광청 실측모델링.zip`, unused) | 1,144,776 B | 240,462 → **31,236** | 8.40 × 6.76 × 8.34 |

Provider for all three: 국가유산청 (기획조정관실 디지털정보담당관실), data.go.kr file data, free (무료).

### Axis / scale notes

- **hall**, **pavilion**: source OBJ (ZBrush export) was already Y-up in metres; only re-centred.
- **pagoda**: source OBJ (Geomagic export) was **Z-up in millimetres** (bbox 18,875 × 18,796 × 10,889 mm).
  Converted with scale ×0.001 and Z-up → Y-up (x, y, z) → (x, z, −y). Height 10.89 m includes the ground slab;
  the documented height of Dabotap is about 10.3 m.

### Pipeline

1. OBJ → GLB: `obj2gltf` 3.2.0 (hall, pavilion). The 1.48 GB pagoda OBJ was stream-parsed by a custom script
   (`bigobj.mjs`): weld corners by (position, UV) 10.7M tris / 5.54M verts → 4×4×4 spatial grid (28 non-empty chunks) simplified with
   meshoptimizer (`LockBorder`+`Permissive`, UV-weighted) → 428,922 tris intermediate.
2. `weld` → meshoptimizer `simplifyWithAttributes` with `Permissive` + `Prune` flags and UV weight 1
   (needed because the ZBrush exports have UV seams on nearly every triangle; the plain `simplify` stalls at
   ~77k for the hall). Relative errors reached: hall 0.20 %, pavilion 0.45 %, pagoda 0.10 %.
3. `normals` (recomputed) → `weld` → `center(pivot: below)`.
4. Textures → WebP (sharp): max 1024², except the hall's main atlas `YHDTex1_L` at **2048²** (q72), kept because
   the 1024² version visibly lost window lattice / 단청 / paving detail in a close-up comparison.
5. `dedup` → `prune` → `meshopt` (level high, includes quantization).

Visual check: each output was rendered in three.js r185 (GLTFLoader + MeshoptDecoder) next to the raw
conversion; silhouettes and texture mapping hold. Faceting on roof tiles and lattices is present in the
heritage service's own low-poly ("저용량") source meshes.

## Textures — `public/textures/sanctuary/`

| File(s) | Poly Haven asset id | Type | Author (Poly Haven) | License | Original (1k JPG / HDR) | Output |
| --- | --- | --- | --- | --- | --- | --- |
| `moonlit_golf_1k.hdr`, `moonlit_golf_2k.hdr` | `moonlit_golf` — https://polyhaven.com/a/moonlit_golf | HDRI, night with moon disk, clear sky, low treeline horizon | Greg Zaal | CC0 | 1,725,527 B / 6,981,963 B | unchanged (.hdr, RGBE) |
| `granite_tile_04_{diff,nor_gl,arm}_1k.webp` | `granite_tile_04` — https://polyhaven.com/a/granite_tile_04 | Weathered granite square pavers, real-world 2.0 × 2.0 m per tile | Amal Kumar | CC0 | 918,404 / 677,810 / 930,251 B | 301,478 / 192,958 / 198,252 B |
| `gravelly_sand_{diff,nor_gl,arm}_1k.webp` | `gravelly_sand` — https://polyhaven.com/a/gravelly_sand | Gravelly sand (마당 마사토 stand-in), 2.48 × 2.48 m | Dario Barresi | CC0 | 1,062,525 / 1,387,739 / 826,170 B | 347,260 / 618,796 / 140,038 B |
| `plaster_grey_04_{diff,nor_gl,arm}_1k.webp` | `plaster_grey_04` — https://polyhaven.com/a/plaster_grey_04 | Rough grey plaster wall, 1.5 × 1.5 m | Rob Tuytel | CC0 | 456,938 / 983,244 / 178,374 B | 188,482 / 450,142 / 113,158 B |

**Shipped in the repo (2026-11-09 scene pass):** `granite_tile_04_{diff,nor_gl,arm}` (retaining walls cut from the
scan skirts) and `gravelly_sand_diff` (courtyard ground). The HDRIs, `plaster_grey_04` and the sand normal/ARM maps
were not needed by the scene and were left out to keep the page light; re-fetch them from the links above if a later
pass uses them.

Map conventions: `diff` = sRGB albedo; `nor_gl` = OpenGL (+Y) tangent-space normal (three.js default);
`arm` = packed AO (R) / roughness (G) / metalness (B), same layout as glTF `occlusionRoughnessMetallic`
→ use the same texture for `aoMap`, `roughnessMap`, `metalnessMap`. WebP quality 85 (normals 92).

Alternative HDRI considered: `clarens_night_02` (mountain horizon, but reads as daylight at default exposure).

## Buddha statue — `buddha.glb` (added 2026-11-10)

Replaces the procedural Buddha in the Buddha hall. Same attribution line as the other models:
**출처: 국가유산청, 공공누리 제1유형**.

| Field | Value |
| --- | --- |
| Asset | 석조비로자나불좌상 (stone seated Vairocana Buddha, Unified Silla, provenance unknown, Gyeongsang region presumed; 지권인 mudra) |
| Owner / provider | 국가유산청 (Korea Heritage Service) |
| Source | 국가유산 디지털 서비스 › 3D 에셋 › 천년 신라 왕경 — https://digital.khs.go.kr/heritage/catalogDetail.do?order=4&index=1&id=13984209407124256885&type=4 (data page: https://digital.khs.go.kr/record/recordDetail3D.do?ichDataUid=13984209407124256885&type=4) |
| Project | 서라벌 천년 시간여행 (2024). Described on the page as a 재현·복원 3D model built from 국가유산청 3D scan data (not a raw scan) |
| License | 공공누리 제1유형 : 출처 표시 (KOGL Type 1 — attribution required, commercial use and modification allowed) |
| Original download | `서라벌_천년왕경_석조비로자나불좌상.zip` 800,807,067 B (downloaded by the owner after sign-in): `SM_24RE0056_high.fbx` 637 MB, `SM_24RE0056_high.obj` 805 MB (no UVs, unused), `T_24RE0056_{C,N,P}.png` 4096² |
| Documented size | 높이 278.8 cm, 불신 높이 116.3 cm |
| Output | `buddha.glb` 2,011,552 B |
| Triangles (orig → out) | 24,591,360 → **295,083** |
| Size (W×H×D m) | 1.24 × 2.92 × 1.24 (pedestal and halo included) |
| Orientation | **Y-up, metres, face looks toward +Z**; halo behind at −Z. Origin centred on X/Z, base at Y=0 |

Pipeline (script `coding/_downloads/sanctuary-photoreal/tools/buddha.mjs`; raw zip not committed):

1. FBX → GLB with assimp 6.0 (`assimp export … -fglb2`): one mesh with NORMAL, POSITION, TEXCOORD_0; source units cm.
2. Material rebuilt (the FBX material only wired two maps): `C` → baseColor, `N` → normal (DirectX → OpenGL,
   green channel flipped), `P` → packed ORM (R AO, G roughness, B metallic = 0) used for both
   `occlusionTexture` and `metallicRoughnessTexture`. All resized to 1024².
3. Root scale ×0.01 (cm → m) → `weld` → meshoptimizer `simplify` ratio 0.012 → `prune` → `dedup` →
   WebP q80 1024² → `reorder` → `quantize` → `EXT_meshopt_compression` (filter).
4. Visual check in three.js r170 (GLTFLoader + MeshoptDecoder): front (+Z) and side (+X) views and a normal-map
   on/off close-up; silhouette, face, hands and pedestal carvings hold. A lighter 147,532-triangle build
   (1,285,740 B, ratio 0.006) was also made and can replace this file if the hall needs a lighter mesh.

### buddha.glb

**OVERVIEW**

| key                | value                                                                                                          |
| ---                | ---                                                                                                            |
| version            | 2.0                                                                                                            |
| generator          | glTF-Transform v4.5.1                                                                                          |
| extensionsUsed     | EXT_meshopt_compression, EXT_texture_webp, KHR_materials_specular, KHR_materials_volume, KHR_mesh_quantization |
| extensionsRequired | EXT_meshopt_compression, EXT_texture_webp, KHR_mesh_quantization                                               |

**SCENES**

| #   | name | rootName | bboxMin                    | bboxMax                   | renderVertexCount¹ | uploadVertexCount | uploadNaiveVertexCount |
| --- | ---  | ---      | ---                        | ---                       | ---                | ---               | ---                    |
| 0   |      | RootNode | -0.6198, -0.00039, -0.6198 | 0.61993, 2.91682, 0.61993 | 885,249            | 149,552           | 149,552                |

**MESHES**

| #   | name             | mode      | meshPrimitives | glPrimitives | vertices | indices | attributes                                             | instances | size¹   |
| --- | ---              | ---       | ---            | ---          | ---      | ---     | ---                                                    | ---       | ---     |
| 0   | SM_24RE0056_high | TRIANGLES | 1              | 295,083      | 149,552  | u32     | NORMAL:i8_norm, POSITION:i16_norm, TEXCOORD_0:u16_norm | 1         | 5.49 MB |

**MATERIALS**

| #   | name            | instances | textures                                                                    | alphaMode | doubleSided |
| --- | ---             | ---       | ---                                                                         | ---       | ---         |
| 0   | stone_vairocana | 1         | baseColorTexture, normalTexture, occlusionTexture, metallicRoughnessTexture | OPAQUE    |             |

**TEXTURES**

| #   | name      | uri | slots                                      | instances | mimeType   | compression | resolution | size      | gpuSize⁵ |
| --- | ---       | --- | ---                                        | ---       | ---        | ---         | ---        | ---       | ---      |
| 0   | basecolor |     | baseColorTexture                           | 1         | image/webp |             | 1024x1024  | 64.63 KB  | 5.59 MB  |
| 1   | normal    |     | normalTexture                              | 1         | image/webp |             | 1024x1024  | 275.8 KB  | 5.59 MB  |
| 2   | orm       |     | occlusionTexture, metallicRoughnessTexture | 1         | image/webp |             | 1024x1024  | 133.99 KB | 5.59 MB  |

## `gltf-transform inspect` output


### hall.glb

**OVERVIEW**

| key                | value                                                            |
| ---                | ---                                                              |
| version            | 2.0                                                              |
| generator          | glTF-Transform v4.5.1                                            |
| extensionsUsed     | EXT_meshopt_compression, EXT_texture_webp, KHR_mesh_quantization |
| extensionsRequired | EXT_meshopt_compression, EXT_texture_webp, KHR_mesh_quantization |

**SCENES**

| #   | name | rootName | bboxMin                     | bboxMax                   | renderVertexCount¹ | uploadVertexCount | uploadNaiveVertexCount |
| --- | ---  | ---      | ---                         | ---                       | ---                | ---               | ---                    |
| 0   |      | obj0     | -10.77887, -0.00039, -9.592 | 10.77887, 11.15382, 9.592 | 170,850            | 170,649           | 170,649                |

**MESHES**

| #   | name   | mode      | meshPrimitives | glPrimitives | vertices | indices | attributes                                             | instances | size¹     |
| --- | ---    | ---       | ---            | ---          | ---      | ---     | ---                                                    | ---       | ---       |
| 0   | obj0_1 | TRIANGLES | 1              | 48,510       | 145,528  | u32     | NORMAL:i8_norm, POSITION:i16_norm, TEXCOORD_0:u16_norm | 1         | 2.47 MB   |
| 1   | obj1_1 | TRIANGLES | 1              | 8,440        | 25,121   | u16     | NORMAL:i8_norm, POSITION:i16_norm, TEXCOORD_0:u16_norm | 1         | 377.21 KB |

**MATERIALS**

| #   | name | instances | textures         | alphaMode | doubleSided |
| --- | ---  | ---       | ---              | ---       | ---         |
| 0   | mat0 | 1         | baseColorTexture | OPAQUE    |             |
| 1   | mat1 | 1         | baseColorTexture | OPAQUE    |             |

**TEXTURES**

| #   | name      | uri | slots            | instances | mimeType   | compression | resolution | size      | gpuSize⁵ |
| --- | ---       | --- | ---              | ---       | ---        | ---         | ---        | ---       | ---      |
| 0   | YHDTex1_L |     | baseColorTexture | 1         | image/webp |             | 2048x2048  | 573.38 KB | 22.37 MB |
| 1   | YHDTex2_L |     | baseColorTexture | 1         | image/webp |             | 1024x1024  | 104.9 KB  | 5.59 MB  |

### pagoda.glb

**OVERVIEW**

| key                | value                                                            |
| ---                | ---                                                              |
| version            | 2.0                                                              |
| generator          | glTF-Transform v4.5.1                                            |
| extensionsUsed     | EXT_meshopt_compression, EXT_texture_webp, KHR_mesh_quantization |
| extensionsRequired | EXT_meshopt_compression, EXT_texture_webp, KHR_mesh_quantization |

**SCENES**

| #   | name | rootName | bboxMin                   | bboxMax                   | renderVertexCount¹ | uploadVertexCount | uploadNaiveVertexCount |
| --- | ---  | ---      | ---                       | ---                       | ---                | ---               | ---                    |
| 0   |      | dabotap  | -9.4363, 0.0004, -9.39828 | 9.4363, 10.88726, 9.39828 | 71,799             | 71,753            | 71,753                 |

**MESHES**

| #   | name    | mode      | meshPrimitives | glPrimitives | vertices | indices | attributes                                             | instances | size¹   |
| --- | ---     | ---       | ---            | ---          | ---      | ---     | ---                                                    | ---       | ---     |
| 0   | dabotap | TRIANGLES | 1              | 23,933       | 71,753   | u32     | NORMAL:i8_norm, POSITION:i16_norm, TEXCOORD_0:u16_norm | 1         | 1.22 MB |

**MATERIALS**

| #   | name    | instances | textures         | alphaMode | doubleSided |
| --- | ---     | ---       | ---              | ---       | ---         |
| 0   | dabotap | 1         | baseColorTexture | OPAQUE    |             |

**TEXTURES**

| #   | name           | uri | slots            | instances | mimeType   | compression | resolution | size      | gpuSize⁵ |
| --- | ---            | --- | ---              | ---       | ---        | ---         | ---        | ---       | ---      |
| 0   | dabotap_albedo |     | baseColorTexture | 1         | image/webp |             | 1024x1024  | 185.28 KB | 5.59 MB  |

### pavilion.glb

**OVERVIEW**

| key                | value                                                            |
| ---                | ---                                                              |
| version            | 2.0                                                              |
| generator          | glTF-Transform v4.5.1                                            |
| extensionsUsed     | EXT_meshopt_compression, EXT_texture_webp, KHR_mesh_quantization |
| extensionsRequired | EXT_meshopt_compression, EXT_texture_webp, KHR_mesh_quantization |

**SCENES**

| #   | name | rootName | bboxMin                      | bboxMax                   | renderVertexCount¹ | uploadVertexCount | uploadNaiveVertexCount |
| --- | ---  | ---      | ---                          | ---                       | ---                | ---               | ---                    |
| 0   |      | default  | -4.19974, -0.00004, -4.16846 | 4.19974, 6.76091, 4.16846 | 93,708             | 93,708            | 93,708                 |

**MESHES**

| #   | name      | mode      | meshPrimitives | glPrimitives | vertices | indices | attributes                                             | instances | size¹   |
| --- | ---       | ---       | ---            | ---          | ---      | ---     | ---                                                    | ---       | ---     |
| 0   | default_1 | TRIANGLES | 1              | 31,236       | 93,708   | u32     | NORMAL:i8_norm, POSITION:i16_norm, TEXCOORD_0:u16_norm | 1         | 1.59 MB |

**MATERIALS**

| #   | name       | instances | textures         | alphaMode | doubleSided |
| --- | ---        | ---       | ---              | ---       | ---         |
| 0   | defaultMat | 1         | baseColorTexture | OPAQUE    |             |

**TEXTURES**

| #   | name        | uri | slots            | instances | mimeType   | compression | resolution | size      | gpuSize⁵ |
| --- | ---         | --- | ---              | ---       | ---        | ---         | ---        | ---       | ---      |
| 0   | SJGBGTex1_L |     | baseColorTexture | 1         | image/webp |             | 1024x1024  | 152.74 KB | 5.59 MB  |
