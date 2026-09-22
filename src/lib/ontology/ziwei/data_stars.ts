/**
 * Zi Wei Dou Shu - Extended Star Data
 * Full 108+ Star system coordinates
 */

import type { Element, Polarity, Star, StarQuality } from "./types";

export const AUXILIARY_STARS: Partial<Star>[] = [
  // 6 Lucky Stars (Liu Ji)
  { element: "Earth", id: "zuo_fu", quality: "Auxiliary" },
  { element: "Water", id: "you_bi", quality: "Auxiliary" },
  { element: "Metal", id: "wen_chang", quality: "Auxiliary" },
  { element: "Water", id: "wen_qu", quality: "Auxiliary" },
  { element: "Fire", id: "tian_kui", quality: "Auxiliary" },
  { element: "Fire", id: "tian_yue", quality: "Auxiliary" },

  // 6 Harmful Stars (Liu Sha)
  { element: "Metal", id: "qing_yang", quality: "Auxiliary" },
  { element: "Metal", id: "tuo_luo", quality: "Auxiliary" },
  { element: "Fire", id: "huo_xing", quality: "Auxiliary" },
  { element: "Fire", id: "ling_xing", quality: "Auxiliary" },
  { element: "Fire", id: "di_kong", quality: "Auxiliary" },
  { element: "Fire", id: "di_jie", quality: "Auxiliary" },

  // Other Major Auxiliary
  { element: "Earth", id: "lu_cun", quality: "Auxiliary" },
  { element: "Fire", id: "tian_ma", quality: "Auxiliary" },
];

export const SHAR_DYNAMICS = {
  Byeong: {
    lian_zhen: "Ji",
    tian_ji: "Quan",
    tian_tong: "Lu",
    wen_chang: "Ke",
  },
  Eul: { tai_yin: "Ji", tian_ji: "Lu", tian_liang: "Quan", zi_wei: "Ke" },
  // Sihua (Four Transformations) per Year Stem
  // 甲: 廉貞祿 破軍權 武曲科 太陽忌 (예전 표는 紫微祿·天機權으로 틀려 있었다)
  Gap: { lian_zhen: "Lu", po_jun: "Quan", wu_qu: "Ke", tai_yang: "Ji" },
  Gi: { tan_lang: "Quan", tian_liang: "Ke", wen_qu: "Ji", wu_qu: "Lu" },
  Gye: { ju_men: "Quan", po_jun: "Lu", tai_yin: "Ke", tan_lang: "Ji" },
  Gyeong: { tai_yang: "Lu", tai_yin: "Ke", tian_tong: "Ji", wu_qu: "Quan" },
  Im: { tian_liang: "Lu", wu_qu: "Ji", zi_wei: "Quan", zuo_fu: "Ke" },
  Jeong: { ju_men: "Ji", tai_yin: "Lu", tian_ji: "Ke", tian_tong: "Quan" },
  // 戊: 貪狼祿 太陰權 右弼科 天機忌 (右弼科 대신 太陽科를 쓰는 유파도 있다)
  Mu: { tan_lang: "Lu", tai_yin: "Quan", you_bi: "Ke", tian_ji: "Ji" },
  Sin: { ju_men: "Lu", tai_yang: "Quan", wen_chang: "Ji", wen_qu: "Ke" },
};
