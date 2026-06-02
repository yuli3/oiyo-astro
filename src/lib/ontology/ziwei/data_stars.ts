/**
 * Zi Wei Dou Shu - Extended Star Data
 * Full 108+ Star system coordinates
 */

import { Element, Polarity, Star, StarQuality } from "./types";

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
  Gap: { tai_yang: "Ji", tian_ji: "Quan", wu_qu: "Ke", zi_wei: "Lu" },
  Gi: { tan_lang: "Quan", tian_liang: "Ke", wen_qu: "Ji", wu_qu: "Lu" },
  Gye: { ju_men: "Quan", po_jun: "Lu", tai_yin: "Ke", tan_lang: "Ji" },
  Gyeong: { tai_yang: "Lu", tai_yin: "Ke", tian_tong: "Ji", wu_qu: "Quan" },
  Im: { tian_liang: "Lu", wu_qu: "Ji", zi_wei: "Quan", zuo_fu: "Ke" },
  Jeong: { ju_men: "Ji", tai_yin: "Lu", tian_ji: "Ke", tian_tong: "Quan" },
  Mu: { tai_yang: "Quan", tan_lang: "Lu", tian_ji: "Ji", wu_qu: "Ke" },
  Sin: { ju_men: "Lu", tai_yang: "Quan", wen_chang: "Ji", wen_qu: "Ke" },
};
