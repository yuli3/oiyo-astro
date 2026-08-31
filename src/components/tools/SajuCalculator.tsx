import { parseSajuInputState, parseSajuTime, type SajuInputState } from '../../lib/ontology/saju/input-contract';
import { getYearStem, getYearBranch, getMonthBranch, getMonthStem, getDayStem, getDayBranch, getHourBranch, getHourStem } from '../../lib/ontology/saju/calculator-civil';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useProfilePrefill } from '../../lib/user/useProfilePrefill';
import { BirthDateField, ProfileGenderField, ProfileTimeField } from '../shared/BirthDateField';
import { analyzeLifeCategories } from '../../lib/ontology/saju/categories';
import { birthCivilToInstant } from '../../lib/ontology/kernel/time';
import { STEM_ORDER } from '../../manifest/data/saju/stems';
import { BRANCH_ORDER } from '../../manifest/data/saju/branches';
import type { SajuResult, HeavenlyStem, EarthlyBranch } from '../../lib/ontology/saju/types';
import YongsinSection from './saju/YongsinSection';
import LifeCategoriesSection from './saju/LifeCategoriesSection';
import FiveElementsOrbit from './saju/FiveElementsOrbit';
import { decodeResult, writeResultHash } from '../../lib/result-permalink';
import { gaEvent } from '../../lib/analytics/ga-event';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';

type Locale = 'ko' | 'en' | 'ja' | 'fr' | 'es' | 'zh';

// T6/#32 permalink tool id — must stay stable, it is embedded in shared URLs.
const PERMALINK_TOOL_ID = 'saju-calculator';
// Birth date/time/gender fully determine the result (see `result`/`analysis`
// useMemo below), so that is all the permalink needs to encode.


const SHARE_LABELS: Record<Locale, { share: string; shareCopied: string; privacyNote: string; imageShare: string; imageSharing: string; imagePrivacy: string; actions: string }> = {
  ko: { share: '결과 링크 공유', shareCopied: '링크를 복사했어요!', privacyNote: '이 링크에는 입력한 생년월일시 정보가 포함됩니다.', imageShare: '사주 이미지 저장·공유', imageSharing: '이미지를 준비하고 있어요…', imagePrivacy: '출생정보는 이미지에 포함되지 않습니다.', actions: '결과 저장과 공유' },
  en: { share: 'Share result link', shareCopied: 'Link copied!', privacyNote: 'This link contains the birth date/time you entered.', imageShare: 'Save or share result image', imageSharing: 'Preparing image…', imagePrivacy: 'Your birth details are not included in the image.', actions: 'Save and share your result' },
  ja: { share: '結果リンクを共有', shareCopied: 'リンクをコピーしました!', privacyNote: 'このリンクには入力した生年月日時の情報が含まれます。', imageShare: '結果画像を保存・共有', imageSharing: '画像を準備中…', imagePrivacy: '生年月日時は画像に含まれません。', actions: '結果の保存と共有' },
  fr: { share: 'Partager le lien du résultat', shareCopied: 'Lien copié !', privacyNote: 'Ce lien contient la date/heure de naissance saisie.', imageShare: "Enregistrer ou partager l’image", imageSharing: 'Préparation de l’image…', imagePrivacy: "Les données de naissance ne figurent pas dans l’image.", actions: 'Enregistrer et partager le résultat' },
  es: { share: 'Compartir enlace del resultado', shareCopied: '¡Enlace copiado!', privacyNote: 'Este enlace contiene la fecha/hora de nacimiento que ingresaste.', imageShare: 'Guardar o compartir la imagen', imageSharing: 'Preparando la imagen…', imagePrivacy: 'Los datos de nacimiento no aparecen en la imagen.', actions: 'Guardar y compartir el resultado' },
  zh: { share: '分享结果链接', shareCopied: '链接已复制!', privacyNote: '此链接包含您输入的出生日期与时间信息。', imageShare: '保存或分享结果图片', imageSharing: '正在生成图片…', imagePrivacy: '图片中不会包含出生信息。', actions: '保存并分享结果' },
};

// ─── Heavenly Stems (天干) ────────────────────────────────────────────────────
const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const STEM_NAMES: Record<Locale, string[]> = {
  ko: ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'],
  en: ['Jiǎ', 'Yǐ', 'Bǐng', 'Dīng', 'Wù', 'Jǐ', 'Gēng', 'Xīn', 'Rén', 'Guǐ'],
  ja: ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
  fr: ['Jiǎ', 'Yǐ', 'Bǐng', 'Dīng', 'Wù', 'Jǐ', 'Gēng', 'Xīn', 'Rén', 'Guǐ'],
  es: ['Jiǎ', 'Yǐ', 'Bǐng', 'Dīng', 'Wù', 'Jǐ', 'Gēng', 'Xīn', 'Rén', 'Guǐ'],
  zh: ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
  cn: ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
};

// ─── Earthly Branches (地支) ──────────────────────────────────────────────────
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const BRANCH_ANIMALS: Record<Locale, string[]> = {
  ko: ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'],
  en: ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'],
  ja: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
  fr: ['Rat', 'Bœuf', 'Tigre', 'Lapin', 'Dragon', 'Serpent', 'Cheval', 'Chèvre', 'Singe', 'Coq', 'Chien', 'Cochon'],
  es: ['Rata', 'Buey', 'Tigre', 'Conejo', 'Dragón', 'Serpiente', 'Caballo', 'Cabra', 'Mono', 'Gallo', 'Perro', 'Cerdo'],
  zh: ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'],
  cn: ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'],
};
const BRANCH_EMOJIS = ['🐭', '🐄', '🐯', '🐰', '🐉', '🐍', '🐎', '🐑', '🐒', '🐓', '🐕', '🐷'];

// ─── Five Elements (오행) ──────────────────────────────────────────────────────
const STEM_ELEMENT = ['Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water'];
const BRANCH_ELEMENT = ['Water', 'Earth', 'Wood', 'Wood', 'Earth', 'Fire', 'Fire', 'Earth', 'Metal', 'Metal', 'Earth', 'Water'];
const ELEMENTS: Record<string, Record<Locale, string>> = {
  Wood: { ko: '목(木)', en: 'Wood 木', ja: '木', fr: 'Bois 木', es: 'Madera 木', zh: '木', cn: '木' },
  Fire: { ko: '화(火)', en: 'Fire 火', ja: '火', fr: 'Feu 火', es: 'Fuego 火', zh: '火', cn: '火' },
  Earth: { ko: '토(土)', en: 'Earth 土', ja: '土', fr: 'Terre 土', es: 'Tierra 土', zh: '土', cn: '土' },
  Metal: { ko: '금(金)', en: 'Metal 金', ja: '金', fr: 'Métal 金', es: 'Metal 金', zh: '金', cn: '金' },
  Water: { ko: '수(水)', en: 'Water 水', ja: '水', fr: 'Eau 水', es: 'Agua 水', zh: '水', cn: '水' },
};
const ELEMENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Wood: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  Fire: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  Earth: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  Metal: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-300' },
  Water: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
};
const ELEMENT_BAR_COLORS: Record<string, string> = {
  Wood: 'bg-green-500',
  Fire: 'bg-red-500',
  Earth: 'bg-yellow-500',
  Metal: 'bg-gray-500',
  Water: 'bg-green-500',
};
const ELEMENT_EMOJIS: Record<string, string> = {
  Wood: '🌿', Fire: '🔥', Earth: '🌍', Metal: '⚙️', Water: '💧',
};
const GENERATES: Record<string, string> = {
  Wood: 'Fire',
  Fire: 'Earth',
  Earth: 'Metal',
  Metal: 'Water',
  Water: 'Wood',
};
const CONTROLS: Record<string, string> = {
  Wood: 'Earth',
  Fire: 'Metal',
  Earth: 'Water',
  Metal: 'Wood',
  Water: 'Fire',
};

// ─── Personality traits per element ───────────────────────────────────────────
const ELEMENT_TRAITS: Record<string, Record<Locale, { strengths: string[]; weaknesses: string[]; career: string }>> = {
  Wood: {
    ko: { strengths: ['성장 지향적', '창의적', '인도주의적', '유연함'], weaknesses: ['우유부단', '지나친 이상주의', '고집'], career: '교육, 의료, 환경, 창작' },
    en: { strengths: ['Growth-oriented', 'Creative', 'Humanitarian', 'Flexible'], weaknesses: ['Indecisive', 'Over-idealistic', 'Stubborn'], career: 'Education, healthcare, environment, arts' },
    ja: { strengths: ['成長志向', '創造的', '人道主義的', '柔軟'], weaknesses: ['優柔不断', '過度な理想主義', '頑固'], career: '教育、医療、環境、創作' },
    fr: { strengths: ['Orienté croissance', 'Créatif', 'Humaniste', 'Flexible'], weaknesses: ['Indécis', 'Trop idéaliste', 'Têtu'], career: 'Éducation, santé, environnement, arts' },
    es: { strengths: ['Orientado al crecimiento', 'Creativo', 'Humanitario', 'Flexible'], weaknesses: ['Indeciso', 'Demasiado idealista', 'Terco'], career: 'Educación, salud, medio ambiente, artes' },
    zh: { strengths: ['成长导向', '创造力强', '人道主义', '灵活'], weaknesses: ['优柔寡断', '过度理想化', '固执'], career: '教育、医疗、环境、创作' },
    cn: { strengths: ['成长导向', '创造力强', '人道主义', '灵活'], weaknesses: ['优柔寡断', '过度理想化', '固执'], career: '教育、医疗、环境、创作' },
  },
  Fire: {
    ko: { strengths: ['열정적', '카리스마', '직관력', '리더십'], weaknesses: ['성급함', '충동적', '과도한 자신감'], career: '연예, 마케팅, 정치, 스포츠' },
    en: { strengths: ['Passionate', 'Charismatic', 'Intuitive', 'Leadership'], weaknesses: ['Impatient', 'Impulsive', 'Overconfident'], career: 'Entertainment, marketing, politics, sports' },
    ja: { strengths: ['情熱的', 'カリスマ', '直感力', 'リーダーシップ'], weaknesses: ['急ぎ過ぎ', '衝動的', '過信'], career: '芸能、マーケティング、政治、スポーツ' },
    fr: { strengths: ['Passionné(e)', 'Charismatique', 'Intuitif(ve)', 'Leadership'], weaknesses: ['Impatient(e)', 'Impulsif(ve)', 'Trop confiant(e)'], career: 'Divertissement, marketing, politique, sport' },
    es: { strengths: ['Apasionado/a', 'Carismático/a', 'Intuitivo/a', 'Liderazgo'], weaknesses: ['Impaciente', 'Impulsivo/a', 'Demasiado confiado/a'], career: 'Entretenimiento, marketing, política, deporte' },
    zh: { strengths: ['热情', '魅力', '直觉力', '领导力'], weaknesses: ['急躁', '冲动', '过度自信'], career: '娱乐、行销、政治、体育' },
    cn: { strengths: ['热情', '魅力', '直觉力', '领导力'], weaknesses: ['急躁', '冲动', '过度自信'], career: '娱乐、营销、政治、体育' },
  },
  Earth: {
    ko: { strengths: ['안정적', '신뢰할 수 있는', '실용적', '인내심'], weaknesses: ['보수적', '변화 거부', '느린 결정'], career: '부동산, 금융, 농업, 행정' },
    en: { strengths: ['Stable', 'Trustworthy', 'Practical', 'Patient'], weaknesses: ['Conservative', 'Resistant to change', 'Slow to decide'], career: 'Real estate, finance, agriculture, administration' },
    ja: { strengths: ['安定的', '信頼できる', '実用的', '忍耐強い'], weaknesses: ['保守的', '変化への抵抗', '決断が遅い'], career: '不動産、金融、農業、行政' },
    fr: { strengths: ['Stable', 'Fiable', 'Pratique', 'Patient(e)'], weaknesses: ['Conservateur(trice)', 'Résistance au changement', 'Lent(e) à décider'], career: 'Immobilier, finance, agriculture, administration' },
    es: { strengths: ['Estable', 'Confiable', 'Práctico/a', 'Paciente'], weaknesses: ['Conservador/a', 'Resistente al cambio', 'Lento/a para decidir'], career: 'Inmobiliario, finanzas, agricultura, administración' },
    zh: { strengths: ['稳定', '值得信赖', '务实', '有耐心'], weaknesses: ['保守', '抗拒变化', '决策缓慢'], career: '房地产、金融、农业、行政' },
    cn: { strengths: ['稳定', '值得信赖', '务实', '有耐心'], weaknesses: ['保守', '抗拒变化', '决策缓慢'], career: '房地产、金融、农业、行政' },
  },
  Metal: {
    ko: { strengths: ['결단력', '정의감', '체계적', '강한 의지'], weaknesses: ['완고함', '비타협적', '지나친 비판'], career: '법조계, 군/경찰, 금융, 엔지니어링' },
    en: { strengths: ['Decisive', 'Strong sense of justice', 'Systematic', 'Strong will'], weaknesses: ['Stubborn', 'Uncompromising', 'Overly critical'], career: 'Law, military/police, finance, engineering' },
    ja: { strengths: ['決断力', '正義感', '体系的', '強い意志'], weaknesses: ['頑固', '非妥協的', '過度な批判'], career: '法曹界、軍・警察、金融、エンジニアリング' },
    fr: { strengths: ['Décidé(e)', 'Sens de la justice', 'Systématique', 'Volonté forte'], weaknesses: ['Têtu(e)', 'Intransigeant(e)', 'Trop critique'], career: 'Droit, armée/police, finance, ingénierie' },
    es: { strengths: ['Decidido/a', 'Sentido de justicia', 'Sistemático/a', 'Voluntad fuerte'], weaknesses: ['Terco/a', 'Intransigente', 'Demasiado crítico/a'], career: 'Derecho, militar/policía, finanzas, ingeniería' },
    zh: { strengths: ['果断', '正义感强', '有条理', '意志坚定'], weaknesses: ['固执', '不妥协', '过度批评'], career: '法律、军警、金融、工程' },
    cn: { strengths: ['果断', '正义感强', '有条理', '意志坚定'], weaknesses: ['固执', '不妥协', '过度批评'], career: '法律、军警、金融、工程' },
  },
  Water: {
    ko: { strengths: ['지혜로움', '적응력', '통찰력', '외교적'], weaknesses: ['우유부단', '불안함', '지나친 사색'], career: '철학, 글쓰기, 상담, 외교' },
    en: { strengths: ['Wise', 'Adaptable', 'Insightful', 'Diplomatic'], weaknesses: ['Indecisive', 'Anxious', 'Over-contemplative'], career: 'Philosophy, writing, counseling, diplomacy' },
    ja: { strengths: ['知恵がある', '適応力がある', '洞察力', '外交的'], weaknesses: ['優柔不断', '不安', '過度な思索'], career: '哲学、執筆、カウンセリング、外交' },
    fr: { strengths: ['Sage', 'Adaptable', 'Perspicace', 'Diplomatique'], weaknesses: ['Indécis(e)', 'Anxieux(se)', 'Trop contemplatif(ve)'], career: 'Philosophie, écriture, conseil, diplomatie' },
    es: { strengths: ['Sabio/a', 'Adaptable', 'Perspicaz', 'Diplomático/a'], weaknesses: ['Indeciso/a', 'Ansioso/a', 'Demasiado contemplativo/a'], career: 'Filosofía, escritura, asesoramiento, diplomacia' },
    zh: { strengths: ['智慧', '适应力强', '洞察力', '外交手腕'], weaknesses: ['优柔寡断', '焦虑', '过度沉思'], career: '哲学、写作、咨询、外交' },
    cn: { strengths: ['智慧', '适应力强', '洞察力', '外交手腕'], weaknesses: ['优柔寡断', '焦虑', '过度沉思'], career: '哲学、写作、咨询、外交' },
  },
};

// ─── Lucky number based on dominant element ───────────────────────────────────
const LUCKY: Record<string, Record<Locale, { colors: string; numbers: string; directions: string }>> = {
  Wood: {
    ko: { colors: '초록, 파랑', numbers: '3, 8', directions: '동쪽' },
    en: { colors: 'Green, Blue', numbers: '3, 8', directions: 'East' },
    ja: { colors: '緑、青', numbers: '3、8', directions: '東' },
    fr: { colors: 'Vert, Bleu', numbers: '3, 8', directions: 'Est' },
    es: { colors: 'Verde, Azul', numbers: '3, 8', directions: 'Este' },
    zh: { colors: '绿色、蓝色', numbers: '3、8', directions: '东方' },
    cn: { colors: '绿色、蓝色', numbers: '3、8', directions: '东方' },
  },
  Fire: {
    ko: { colors: '빨강, 보라', numbers: '2, 7', directions: '남쪽' },
    en: { colors: 'Red, Purple', numbers: '2, 7', directions: 'South' },
    ja: { colors: '赤、紫', numbers: '2、7', directions: '南' },
    fr: { colors: 'Rouge, Violet', numbers: '2, 7', directions: 'Sud' },
    es: { colors: 'Rojo, Morado', numbers: '2, 7', directions: 'Sur' },
    zh: { colors: '红色、紫色', numbers: '2、7', directions: '南方' },
    cn: { colors: '红色、紫色', numbers: '2、7', directions: '南方' },
  },
  Earth: {
    ko: { colors: '노랑, 갈색', numbers: '5, 10', directions: '중앙' },
    en: { colors: 'Yellow, Brown', numbers: '5, 10', directions: 'Center' },
    ja: { colors: '黄色、茶色', numbers: '5、10', directions: '中央' },
    fr: { colors: 'Jaune, Brun', numbers: '5, 10', directions: 'Centre' },
    es: { colors: 'Amarillo, Marrón', numbers: '5, 10', directions: 'Centro' },
    zh: { colors: '黄色、棕色', numbers: '5、10', directions: '中央' },
    cn: { colors: '黄色、棕色', numbers: '5、10', directions: '中央' },
  },
  Metal: {
    ko: { colors: '흰색, 금색', numbers: '4, 9', directions: '서쪽' },
    en: { colors: 'White, Gold', numbers: '4, 9', directions: 'West' },
    ja: { colors: '白、金', numbers: '4、9', directions: '西' },
    fr: { colors: 'Blanc, Or', numbers: '4, 9', directions: 'Ouest' },
    es: { colors: 'Blanco, Dorado', numbers: '4, 9', directions: 'Oeste' },
    zh: { colors: '白色、金色', numbers: '4、9', directions: '西方' },
    cn: { colors: '白色、金色', numbers: '4、9', directions: '西方' },
  },
  Water: {
    ko: { colors: '검정, 파랑', numbers: '1, 6', directions: '북쪽' },
    en: { colors: 'Black, Blue', numbers: '1, 6', directions: 'North' },
    ja: { colors: '黒、青', numbers: '1、6', directions: '北' },
    fr: { colors: 'Noir, Bleu', numbers: '1, 6', directions: 'Nord' },
    es: { colors: 'Negro, Azul', numbers: '1, 6', directions: 'Norte' },
    zh: { colors: '黑色、蓝色', numbers: '1、6', directions: '北方' },
    cn: { colors: '黑色、蓝色', numbers: '1、6', directions: '北方' },
  },
};

const L: Record<Locale, {
  title: string; subtitle: string;
  birthDate: string; birthTime: string;
  calcBtn: string; resetBtn: string;
  unknownTime: string;
  fourPillars: string; yearPillar: string; monthPillar: string; dayPillar: string; hourPillar: string;
  stem: string; branch: string; animal: string; element: string;
  dominantElement: string; strengths: string; weaknesses: string; career: string;
  luckyColors: string; luckyNumbers: string; luckyDirections: string;
  disclaimer: string;
}> = {
  ko: {
    title: '사주 계산기', subtitle: '사주팔자(四柱八字) — 생년월일시 기반 운명 분석',
    birthDate: '생년월일', birthTime: '태어난 시각',
    calcBtn: '사주 보기', resetBtn: '초기화',
    unknownTime: '모름',
    fourPillars: '사주 (四柱)', yearPillar: '년주(年柱)', monthPillar: '월주(月柱)', dayPillar: '일주(日柱)', hourPillar: '시주(時柱)',
    stem: '천간', branch: '지지', animal: '띠', element: '오행',
    dominantElement: '주요 오행', strengths: '강점', weaknesses: '약점', career: '적합 직업',
    luckyColors: '행운의 색', luckyNumbers: '행운의 숫자', luckyDirections: '행운의 방위',
    disclaimer: '사주는 동양의 전통적인 운명론으로, 과학적 근거가 없습니다. 재미와 자기 이해의 도구로만 활용하세요.',
  },
  en: {
    title: 'Saju Palja Calculator', subtitle: 'Free Korean Four Pillars birth chart reading',
    birthDate: 'Birth date', birthTime: 'Birth time',
    calcBtn: 'Read My Saju', resetBtn: 'Reset',
    unknownTime: 'Unknown',
    fourPillars: 'Four Pillars (사주)', yearPillar: 'Year Pillar', monthPillar: 'Month Pillar', dayPillar: 'Day Pillar', hourPillar: 'Hour Pillar',
    stem: 'Heavenly Stem', branch: 'Earthly Branch', animal: 'Zodiac', element: 'Element',
    dominantElement: 'Dominant Element', strengths: 'Strengths', weaknesses: 'Weaknesses', career: 'Suited Careers',
    luckyColors: 'Lucky Colors', luckyNumbers: 'Lucky Numbers', luckyDirections: 'Lucky Directions',
    disclaimer: 'Saju is a traditional East Asian fortune-telling art with no scientific basis. Use it only for fun and self-reflection.',
  },
  ja: {
    title: '四柱推命計算機', subtitle: '生年月日時から運命を分析',
    birthDate: '生年月日', birthTime: '出生時刻',
    calcBtn: '四柱推命を見る', resetBtn: 'リセット',
    unknownTime: '不明',
    fourPillars: '四柱八字', yearPillar: '年柱', monthPillar: '月柱', dayPillar: '日柱', hourPillar: '時柱',
    stem: '天干', branch: '地支', animal: '干支', element: '五行',
    dominantElement: '主な五行', strengths: '長所', weaknesses: '短所', career: '適性',
    luckyColors: '幸運の色', luckyNumbers: '幸運の数字', luckyDirections: '幸運の方角',
    disclaimer: '四柱推命は東洋の伝統的な占術であり、科学的根拠はありません。楽しみと自己理解のツールとしてのみご利用ください。',
  },
  fr: {
    title: 'Calculateur Saju (사주)', subtitle: "Quatre Piliers du Destin — Analyse de la carte natale",
    birthDate: 'Date de naissance', birthTime: 'Heure de naissance',
    calcBtn: 'Lire mon Saju', resetBtn: 'Réinitialiser',
    unknownTime: 'Inconnu(e)',
    fourPillars: 'Quatre Piliers (사주)', yearPillar: 'Pilier Année', monthPillar: 'Pilier Mois', dayPillar: 'Pilier Jour', hourPillar: 'Pilier Heure',
    stem: 'Tige céleste', branch: 'Branche terrestre', animal: 'Zodiaque', element: 'Élément',
    dominantElement: 'Élément dominant', strengths: 'Points forts', weaknesses: 'Points faibles', career: 'Carrières adaptées',
    luckyColors: 'Couleurs porte-bonheur', luckyNumbers: 'Chiffres porte-bonheur', luckyDirections: 'Directions porte-bonheur',
    disclaimer: "Le Saju est un art divinatoire traditionnel est-asiatique sans base scientifique. Utilisez-le uniquement pour le plaisir et la réflexion personnelle.",
  },
  es: {
    title: 'Calculadora Saju (사주)', subtitle: 'Cuatro Pilares del Destino — Análisis de carta natal',
    birthDate: 'Fecha de nacimiento', birthTime: 'Hora de nacimiento',
    calcBtn: 'Leer mi Saju', resetBtn: 'Reiniciar',
    unknownTime: 'Desconocido',
    fourPillars: 'Cuatro Pilares (사주)', yearPillar: 'Pilar Año', monthPillar: 'Pilar Mes', dayPillar: 'Pilar Día', hourPillar: 'Pilar Hora',
    stem: 'Tronco celestial', branch: 'Rama terrestre', animal: 'Zodíaco', element: 'Elemento',
    dominantElement: 'Elemento dominante', strengths: 'Fortalezas', weaknesses: 'Debilidades', career: 'Carreras adecuadas',
    luckyColors: 'Colores de suerte', luckyNumbers: 'Números de suerte', luckyDirections: 'Direcciones de suerte',
    disclaimer: 'El Saju es un arte adivinatorio tradicional de Asia Oriental sin base científica. Úsalo solo para entretenimiento y reflexión.',
  },
  zh: {
    title: '四柱推命计算机', subtitle: '依生年月日时分析四柱八字',
    birthDate: '出生日期', birthTime: '出生时间',
    calcBtn: '查看我的四柱', resetBtn: '重置',
    unknownTime: '不知道',
    fourPillars: '四柱 (사주)', yearPillar: '年柱', monthPillar: '月柱', dayPillar: '日柱', hourPillar: '时柱',
    stem: '天干', branch: '地支', animal: '生肖', element: '五行',
    dominantElement: '主要五行', strengths: '优点', weaknesses: '缺点', career: '适合职业',
    luckyColors: '幸运颜色', luckyNumbers: '幸运数字', luckyDirections: '幸运方向',
    disclaimer: '四柱推命是东亚传统占术，没有科学依据。请仅用于娱乐和自我认识。',
  },
  cn: {
    title: '四柱推命计算器', subtitle: '依生年月日时分析四柱八字',
    birthDate: '出生日期', birthTime: '出生時間',
    calcBtn: '查看我的四柱', resetBtn: '重置',
    unknownTime: '不知道',
    fourPillars: '四柱 (사주)', yearPillar: '年柱', monthPillar: '月柱', dayPillar: '日柱', hourPillar: '时柱',
    stem: '天干', branch: '地支', animal: '生肖', element: '五行',
    dominantElement: '主要五行', strengths: '优点', weaknesses: '缺点', career: '适合职业',
    luckyColors: '幸运颜色', luckyNumbers: '幸运数字', luckyDirections: '幸运方向',
    disclaimer: '四柱推命是东亚传统占术，没有科学依据。请仅用于娱乐和自我认识。',
  },
};

const ELEMENT_ORDER = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'] as const;

const READING_COPY: Record<Locale, {
  readingMap: string;
  readingMapDesc: string;
  balanceTitle: string;
  abundance: string;
  scarcity: string;
  missing: string;
  noMissing: string;
  profileChanges: string;
  profileChangesDesc: string;
  howToRead: string;
  readSteps: string[];
  relationTitle: string;
  relationDesc: string;
  generates: string;
  controls: string;
  balanceQuestions: string;
  balanceQuestionItems: string[];
  quickAnswerTitle: string;
  quickAnswerBody: string;
  monthlyCta: string;
}> = {
  ko: {
    readingMap: '사주 해석 지도',
    readingMapDesc: '네 기둥은 한 줄의 결론보다 위치와 균형을 함께 볼 때 더 자연스럽게 읽힙니다.',
    quickAnswerTitle: '내 오행 한눈에 보기',
    quickAnswerBody: '당신의 사주에서 가장 강하게 드러나는 오행은 %s입니다.',
    monthlyCta: '이번 달 사주 운세 보기',
    balanceTitle: '오행 균형',
    abundance: '강하게 드러나는 오행',
    scarcity: '보완하면 좋은 오행',
    missing: '비어 있는 오행',
    noMissing: '비어 있는 오행 없음',
    profileChanges: '성향은 시간에 따라 바뀝니다',
    profileChangesDesc: '사주는 태어난 순간의 상징 지도를 보여주지만, 실제 성향은 환경, 습관, 관계, 선택에 따라 계속 변합니다. 결과를 고정된 판정이 아니라 현재 나를 돌아보는 언어로 사용해 주세요.',
    howToRead: '읽는 순서',
    readSteps: ['일간으로 나의 중심을 봅니다.', '월주로 계절과 사회적 리듬을 봅니다.', '오행의 과다와 부족을 함께 봅니다.'],
    relationTitle: '오행 생극 관계',
    relationDesc: '가장 강한 오행이 무엇을 밀어주고 무엇을 조절하려는지 보면 해석의 방향이 선명해집니다.',
    generates: '생하는 오행',
    controls: '극하는 오행',
    balanceQuestions: '보완 질문',
    balanceQuestionItems: ['강한 오행이 생활에서 과하게 드러나는 장면은?', '부족한 오행을 행동·환경·관계로 보완할 방법은?', '최근 스트레스가 특정 오행의 약점처럼 나타나지는 않는가?'],
  },
  en: {
    readingMap: 'Saju Reading Map',
    readingMapDesc: 'The four pillars read best when position and balance are considered together.',
    quickAnswerTitle: 'Your Five Elements at a Glance',
    quickAnswerBody: 'The most strongly expressed element in your saju is %s.',
    monthlyCta: "See this month's saju fortune",
    balanceTitle: 'Five Element Balance',
    abundance: 'Strongly expressed element',
    scarcity: 'Element to support',
    missing: 'Missing element',
    noMissing: 'No missing element',
    profileChanges: 'Traits can change over time',
    profileChangesDesc: 'Saju shows a symbolic map of birth, while real personality keeps changing through environment, habits, relationships, and choices.',
    howToRead: 'Reading Order',
    readSteps: ['Start from the day stem as the self point.', 'Use the month pillar for season and social rhythm.', 'Read abundance and scarcity together.'],
    relationTitle: 'Element Generation and Control',
    relationDesc: 'Read what the strongest element supports and what it regulates to find a clearer interpretation path.',
    generates: 'Generates',
    controls: 'Controls',
    balanceQuestions: 'Balancing Questions',
    balanceQuestionItems: ['Where does the strong element show up too intensely?', 'How can the weaker element be supported through habits, place, or relationships?', 'Does recent stress resemble the shadow side of one element?'],
  },
  ja: {
    readingMap: '四柱の読み方マップ',
    readingMapDesc: '四柱は結論だけでなく、位置と五行の均衡を合わせて見ると読みやすくなります。',
    quickAnswerTitle: '五行をひと目で',
    quickAnswerBody: 'あなたの四柱で最も強く出る五行は%sです。',
    monthlyCta: '今月の四柱運勢を見る',
    balanceTitle: '五行バランス',
    abundance: '強く出る五行',
    scarcity: '補うとよい五行',
    missing: '不足している五行',
    noMissing: '不足している五行なし',
    profileChanges: '性向は時間とともに変化します',
    profileChangesDesc: '四柱は出生時の象徴地図であり、実際の性向は環境、習慣、関係、選択によって変わり続けます。',
    howToRead: '読む順序',
    readSteps: ['日干を自分の中心として見ます。', '月柱で季節と社会的リズムを見ます。', '五行の多さと少なさを一緒に見ます。'],
    relationTitle: '五行の相生・相剋',
    relationDesc: '強い五行が何を生み、何を調整するかを見ると解釈の方向が見えます。',
    generates: '生じる五行',
    controls: '剋する五行',
    balanceQuestions: 'バランスの問い',
    balanceQuestionItems: ['強い五行が過剰に出る場面は？', '弱い五行を習慣・環境・関係で補う方法は？', '最近のストレスは特定の五行の影として出ていないか？'],
  },
  fr: {
    readingMap: 'Carte de lecture Saju',
    readingMapDesc: 'Les quatre piliers se lisent mieux en croisant position et équilibre.',
    quickAnswerTitle: 'Vos cinq éléments en un coup d’œil',
    quickAnswerBody: 'Dans votre Saju, l’élément le plus fortement exprimé est %s.',
    monthlyCta: 'Voir la fortune Saju de ce mois',
    balanceTitle: 'Équilibre des cinq éléments',
    abundance: 'Élément fortement exprimé',
    scarcity: 'Élément à soutenir',
    missing: 'Élément absent',
    noMissing: 'Aucun élément absent',
    profileChanges: 'Les tendances changent avec le temps',
    profileChangesDesc: 'Le Saju est une carte symbolique de naissance; la personnalité réelle évolue avec le contexte, les habitudes, les relations et les choix.',
    howToRead: 'Ordre de lecture',
    readSteps: ['Commencez par la tige du jour.', 'Lisez le pilier du mois comme saison et rythme social.', 'Comparez abondance et manque.'],
    relationTitle: 'Génération et contrôle des éléments',
    relationDesc: "Observez ce que l'élément fort soutient et ce qu'il régule pour orienter la lecture.",
    generates: 'Génère',
    controls: 'Contrôle',
    balanceQuestions: "Questions d'équilibre",
    balanceQuestionItems: ["Où l'élément fort devient-il excessif ?", "Comment soutenir l'élément faible par les habitudes, le lieu ou les relations ?", 'Le stress récent ressemble-t-il à une ombre élémentaire ?'],
  },
  es: {
    readingMap: 'Mapa de lectura Saju',
    readingMapDesc: 'Los cuatro pilares se leen mejor al combinar posición y equilibrio.',
    quickAnswerTitle: 'Tus cinco elementos de un vistazo',
    quickAnswerBody: 'En tu Saju, el elemento más expresado es %s.',
    monthlyCta: 'Ver la fortuna Saju de este mes',
    balanceTitle: 'Equilibrio de los cinco elementos',
    abundance: 'Elemento más expresado',
    scarcity: 'Elemento a reforzar',
    missing: 'Elemento ausente',
    noMissing: 'Sin elementos ausentes',
    profileChanges: 'Las tendencias cambian con el tiempo',
    profileChangesDesc: 'Saju muestra un mapa simbólico de nacimiento; la personalidad real cambia con ambiente, hábitos, relaciones y decisiones.',
    howToRead: 'Orden de lectura',
    readSteps: ['Empieza por el tronco del día.', 'Lee el pilar del mes como estación y ritmo social.', 'Observa abundancia y carencia juntas.'],
    relationTitle: 'Generación y control de elementos',
    relationDesc: 'Observa qué apoya el elemento fuerte y qué regula para aclarar la lectura.',
    generates: 'Genera',
    controls: 'Controla',
    balanceQuestions: 'Preguntas de equilibrio',
    balanceQuestionItems: ['¿Dónde aparece demasiado fuerte el elemento dominante?', '¿Cómo apoyar el elemento débil con hábitos, lugar o relaciones?', '¿El estrés reciente se parece al lado difícil de un elemento?'],
  },
  zh: {
    readingMap: '四柱解读地图',
    readingMapDesc: '四柱不只看单一结论，也要合看位置与五行平衡。',
    quickAnswerTitle: '一眼看懂我的五行',
    quickAnswerBody: '你的四柱中最强的五行是%s。',
    monthlyCta: '查看本月四柱运势',
    balanceTitle: '五行平衡',
    abundance: '较强的五行',
    scarcity: '可补足的五行',
    missing: '缺少的五行',
    noMissing: '没有缺少的五行',
    profileChanges: '性向会随时间改变',
    profileChangesDesc: '四柱呈现出生时的象征地图；真实性格会因环境、习惯、关系与选择而持续变化。',
    howToRead: '解读顺序',
    readSteps: ['先看日干作为自我中心。', '再看月柱代表季节与社会节奏。', '同时观察五行的多与少。'],
    relationTitle: '五行生克关系',
    relationDesc: '看最强五行生什么、克什么，可以更清楚地找到解读方向。',
    generates: '相生',
    controls: '相克',
    balanceQuestions: '平衡提问',
    balanceQuestionItems: ['较强的五行在哪些生活场景中过度表现？', '较弱的五行能否透过习惯、环境或关系补足？', '最近的压力是否像某个五行的阴影面？'],
  },
};

const PILLAR_ROLES: Record<Locale, Record<string, string>> = {
  ko: {
    year: '가문, 초년기, 큰 배경',
    month: '사회성, 직업 리듬, 계절감',
    day: '나 자신과 관계의 중심',
    hour: '후반기, 자녀, 잠재력',
  },
  en: {
    year: 'Ancestry, early life, wider background',
    month: 'Social style, work rhythm, season',
    day: 'Self point and close relationships',
    hour: 'Later life, children, latent potential',
  },
  ja: {
    year: '家系、幼少期、大きな背景',
    month: '社会性、仕事のリズム、季節感',
    day: '自分自身と親密な関係',
    hour: '晩年、子ども、潜在力',
  },
  fr: {
    year: 'Origines, enfance, arrière-plan',
    month: 'Style social, rythme de travail, saison',
    day: 'Point du soi et relations proches',
    hour: 'Vie tardive, enfants, potentiel latent',
  },
  es: {
    year: 'Origen, primeros años, contexto amplio',
    month: 'Estilo social, ritmo laboral, estación',
    day: 'Centro personal y relaciones cercanas',
    hour: 'Vida posterior, hijos, potencial latente',
  },
  zh: {
    year: '家族、早年、大背景',
    month: '社会性、工作节奏、季节感',
    day: '自我中心与亲密关系',
    hour: '后半生、子女、潜能',
  },
};

export default function SajuCalculator({ locale = 'ko' }: { locale?: Locale }) {
  const t = L[locale] ?? L.ko;
  const reading = READING_COPY[locale] ?? READING_COPY.ko;
  const roles = PILLAR_ROLES[locale] ?? PILLAR_ROLES.ko;
  const shareLabels = SHARE_LABELS[locale] ?? SHARE_LABELS.en;

  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(6);
  const [day, setDay] = useState(15);
  const [hour, setHour] = useState<number | null>(null);
  const [minute, setMinute] = useState<number | null>(null);
  const dateValue = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const timeValue = hour !== null ? `${String(hour).padStart(2, '0')}:${String(minute ?? 0).padStart(2, '0')}` : '';
  function handleDateChange(v: string) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
    if (!m) return;
    setYear(Number(m[1]));
    setMonth(Number(m[2]));
    setDay(Number(m[3]));
    setDone(false);
  }
  function handleTimeChange(v: string) {
    const time = parseSajuTime(v);
    if (!time) return;
    setHour(time.hour);
    setMinute(time.minute);
    setDone(false);
  }
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [done, setDone] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [imageSharing, setImageSharing] = useState(false);
  const restoredFromPermalink = useRef(false);

  // 온톨로지에서 입력한 프로필(생년월일·시·성별)을 재사용 — 재입력 제거.
  const { profile, parsed, saveBirth } = useProfilePrefill();
  const [prefilled, setPrefilled] = useState(false);
  useEffect(() => {
    if (prefilled || !parsed) return;
    setYear(parsed.year);
    setMonth(parsed.month);
    setDay(parsed.day);
    setHour(parsed.hour);
    setMinute(parsed.hour === null ? null : (parsed.minute ?? 0));
    if (profile.gender === 'male' || profile.gender === 'female') setGender(profile.gender);
    setPrefilled(true);
  }, [parsed, profile.gender, prefilled]);

  // T6/#32: entering via a shared #r= permalink restores the sender's exact
  // birth inputs and jumps straight to the result view — skipping input and
  // (deliberately) skipping saveBirth(), so a shared link never overwrites
  // the viewer's own locally-saved profile. Runs after the profile-prefill
  // effect above so a permalink always wins over the viewer's own saved data.
  useEffect(() => {
    const decoded = decodeResult<unknown>(window.location.hash);
    if (decoded?.toolId !== PERMALINK_TOOL_ID || !decoded.state) return;
    const s = parseSajuInputState(decoded.state);
    if (!s) return;
    restoredFromPermalink.current = true;
    setYear(s.year);
    setMonth(s.month);
    setDay(s.day);
    setHour(s.hour);
    setMinute(s.minute);
    if (s.gender === 'male' || s.gender === 'female') setGender(s.gender);
    setPrefilled(true); // block the profile-prefill effect above from overwriting this
    setDone(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function share() {
    gaEvent('share_click', { test_id: 'saju' });
    const state: SajuInputState = { schemaVersion: 2, year, month, day, hour, minute, gender };
    const url = writeResultHash<SajuInputState>(PERMALINK_TOOL_ID, state) ?? window.location.href;
    if (navigator.share) {
      navigator.share({ title: t.title, url });
    } else {
      navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  }

  async function shareImage() {
    if (imageSharing) return;
    setImageSharing(true);
    try {
      const { shareSajuCard } = await import('../../lib/saju-share-card');
      const toPillar = (p: { label: string; stem: number; branch: number }) => ({ label: p.label, stem: STEMS[p.stem], branch: BRANCHES[p.branch], animal: BRANCH_ANIMALS[locale][p.branch], element: ELEMENTS[STEM_ELEMENT[p.stem]][locale] });
      const known = result.pillars.map(toPillar);
      const hour = known[3] ?? { label: t.hourPillar, stem: null, branch: null, animal: '', element: SHARE_LABELS[locale]?.privacyNote ?? 'Unknown time' };
      await shareSajuCard({ locale, title: t.fourPillars, disclaimer: t.disclaimer, pillars: [known[0], known[1], known[2], hour] });
      gaEvent('share_click', { test_id: 'saju', share_surface: 'image' });
    } finally { setImageSharing(false); }
  }

  const result = useMemo(() => {
    const yStem = getYearStem(year);
    const yBranch = getYearBranch(year);
    const mBranch = getMonthBranch(month);
    const mStem = getMonthStem(yStem, month);
    const dStem = getDayStem(year, month, day);
    const dBranch = getDayBranch(year, month, day);
    const hBranch = hour !== null ? getHourBranch(hour) : null;
    const hStem = hour !== null ? getHourStem(dStem, getHourBranch(hour)) : null;

    const pillars = [
      { key: 'year', label: t.yearPillar, stem: yStem, branch: yBranch },
      { key: 'month', label: t.monthPillar, stem: mStem, branch: mBranch },
      { key: 'day', label: t.dayPillar, stem: dStem, branch: dBranch },
      ...(hStem !== null && hBranch !== null ? [{ key: 'hour', label: t.hourPillar, stem: hStem, branch: hBranch }] : []),
    ];

    // Dominant element: count stems + branches
    const elementCount: Record<string, number> = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
    pillars.forEach(p => {
      elementCount[STEM_ELEMENT[p.stem]] = (elementCount[STEM_ELEMENT[p.stem]] || 0) + 1;
      elementCount[BRANCH_ELEMENT[p.branch]] = (elementCount[BRANCH_ELEMENT[p.branch]] || 0) + 1;
    });
    const dominant = Object.entries(elementCount).sort(([, a], [, b]) => b - a)[0][0];
    const sortedElements = [...ELEMENT_ORDER].sort((a, b) => elementCount[b] - elementCount[a]);
    const scarceElements = [...ELEMENT_ORDER].sort((a, b) => elementCount[a] - elementCount[b]);
    const missingElements = ELEMENT_ORDER.filter(el => elementCount[el] === 0);

    return { pillars, elementCount, dominant, sortedElements, scarceElements, missingElements };
  }, [year, month, day, hour, t.yearPillar, t.monthPillar, t.dayPillar, t.hourPillar]);

  // ── 용신/항목별 구조 분석 (bridge index pillars → SajuResult enum) ──
  const analysis = useMemo(() => {
    const yStem = getYearStem(year), yBranch = getYearBranch(year);
    const mBranch = getMonthBranch(month), mStem = getMonthStem(yStem, month);
    const dStem = getDayStem(year, month, day), dBranch = getDayBranch(year, month, day);
    const hKnown = hour !== null;
    const hB = getHourBranch(hKnown ? (hour as number) : 12);
    const hS = getHourStem(dStem, hB);
    const S = (i: number) => STEM_ORDER[i] as unknown as HeavenlyStem;
    const B = (i: number) => BRANCH_ORDER[i] as unknown as EarthlyBranch;
    const saju: SajuResult = {
      birthDate: birthCivilToInstant({ year, month, day, hour: hKnown ? (hour as number) : 12, minute: hKnown ? (minute ?? 0) : 0 }),
      year: { heavenlyStem: S(yStem), earthlyBranch: B(yBranch) },
      month: { heavenlyStem: S(mStem), earthlyBranch: B(mBranch) },
      day: { heavenlyStem: S(dStem), earthlyBranch: B(dBranch) },
      hour: { heavenlyStem: S(hS), earthlyBranch: B(hB) },
      dayMaster: S(dStem),
      gender,
      isLunar: false,
    };
    return { data: analyzeLifeCategories(saju), hourKnown: hKnown };
  }, [year, month, day, hour, minute, gender]);

  const daysInMonth = new Date(year, month, 0).getDate();

  function handleCalc() {
    const clampedDay = Math.min(day, daysInMonth);
    if (day !== clampedDay) setDay(clampedDay);
    // 입력을 프로필에 저장 → 다른 도구(별자리·바이오리듬·주기형 운세)로 전파.
    saveBirth({ year, month, day: clampedDay, hour, minute, gender });
    setDone(true);
    gaEvent('test_completed', { test_id: 'saju' });
  }

  const PillarCard = ({ label, role, stemIdx, branchIdx }: { label: string; role: string; stemIdx: number; branchIdx: number }) => {
    const elem = STEM_ELEMENT[stemIdx];
    const c = ELEMENT_COLORS[elem];
    return (
      <div className={`rounded-xl border p-3 text-center ${c.bg} ${c.border}`}>
        <p className="text-xs font-semibold text-gray-500 mb-2">{label}</p>
        <div className="text-2xl font-bold text-gray-900 mb-0.5">{STEMS[stemIdx]}</div>
        <div className="text-xs text-gray-500 mb-1">{STEM_NAMES[locale][stemIdx]}</div>
        <div className="text-2xl font-bold text-gray-900 mb-0.5">{BRANCHES[branchIdx]}</div>
        <div className="text-xs text-gray-500 mb-1">{BRANCH_EMOJIS[branchIdx]} {BRANCH_ANIMALS[locale][branchIdx]}</div>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${c.text} bg-white bg-opacity-60`}>
          {ELEMENTS[elem][locale]}
        </span>
        <p className="mt-2 min-h-[2.25rem] text-[11px] leading-relaxed text-gray-600">{role}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card to-primary/[0.04] shadow-md">
        <CardHeader className="border-b border-primary/10 bg-primary/[0.03] text-center">
          <CardTitle>{t.title}</CardTitle>
          <CardDescription>{t.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
        <BirthDateField
          id="saju-birth-date"
          locale={locale}
          label={t.birthDate}
          value={dateValue}
          onChange={handleDateChange}
          max={new Date().toISOString().slice(0, 10)}
        />

        <ProfileTimeField
          locale={locale}
          label={t.birthTime}
          value={timeValue}
          onChange={handleTimeChange}
          syncProfile={!restoredFromPermalink.current}
        />

        <ProfileGenderField
          locale={locale}
          label={({ ko: '성별', en: 'Gender', ja: '性別', zh: '性别', fr: 'Sexe', es: 'Sexo' } as Record<Locale, string>)[locale]}
          value={gender}
          onChange={(g) => {
            if (g === 'male' || g === 'female') setGender(g);
            setDone(false);
          }}
        />

        <Button
          onClick={handleCalc}
          className="w-full"
          size="lg"
        >
          {t.calcBtn}
        </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {done && (
        <>
          {/* Four Pillars */}
          <div>
            <h2 className="text-sm font-bold text-green-700 mb-3">{t.fourPillars}</h2>
            <div className={`grid gap-3 ${result.pillars.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}>
              {result.pillars.map(p => (
                <PillarCard key={p.label} label={p.label} role={roles[p.key] ?? ''} stemIdx={p.stem} branchIdx={p.branch} />
              ))}
            </div>
          </div>

          {/* Quick answer — 내 오행 한눈에 보기 (answer-first, before deeper reads) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-800">{reading.quickAnswerTitle}</h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-700">
              {reading.quickAnswerBody.replace('%s', ELEMENTS[result.sortedElements[0]][locale])}
            </p>
            <FiveElementsOrbit
              locale={locale}
              elementCount={result.elementCount}
              dominantElement={result.sortedElements[0]}
              missingElements={result.missingElements}
            />
            <a
              href={`/${locale}/fortune/monthly/`}
              className="mt-3 inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700"
            >
              {reading.monthlyCta}
            </a>
          </div>

          {/* 용신/기신 — 이로운/해로운 기운 */}
          <YongsinSection locale={locale} analysis={analysis.data} hourKnown={analysis.hourKnown} />

          {/* 항목별 분석 — 재물/진로/연애/건강 */}
          <LifeCategoriesSection locale={locale} analysis={analysis.data} />

          {/* Reading map */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-800">{reading.readingMap}</h2>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">{reading.readingMapDesc}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {reading.readSteps.map((step, index) => (
                <div key={step} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <p className="mb-1 text-[11px] font-bold text-green-600">0{index + 1}</p>
                  <p className="text-xs leading-relaxed text-gray-700">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Element balance */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">{reading.balanceTitle}</h2>
            <div className="space-y-2">
              {ELEMENT_ORDER.map(el => {
                const c = ELEMENT_COLORS[el];
                const count = result.elementCount[el] || 0;
                const total = result.pillars.length * 2;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={el} className="flex items-center gap-2">
                    <span className="w-5 text-sm">{ELEMENT_EMOJIS[el]}</span>
                    <span className={`text-xs font-medium w-16 ${c.text}`}>{ELEMENTS[el][locale]}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full">
                      <div className={`h-2 rounded-full ${ELEMENT_BAR_COLORS[el]}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="text-[11px] font-semibold text-gray-500">{reading.abundance}</p>
                <p className="mt-1 text-sm font-bold text-gray-800">{ELEMENTS[result.sortedElements[0]][locale]}</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="text-[11px] font-semibold text-gray-500">{reading.scarcity}</p>
                <p className="mt-1 text-sm font-bold text-gray-800">{ELEMENTS[result.scarceElements[0]][locale]}</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="text-[11px] font-semibold text-gray-500">{reading.missing}</p>
                <p className="mt-1 text-sm font-bold text-gray-800">
                  {result.missingElements.length > 0
                    ? result.missingElements.map(el => ELEMENTS[el][locale]).join(', ')
                    : reading.noMissing}
                </p>
              </div>
            </div>
          </div>

          {/* Element relations */}
          {(() => {
            const strong = result.sortedElements[0];
            const support = GENERATES[strong];
            const regulate = CONTROLS[strong];
            const supportColor = ELEMENT_COLORS[support];
            const regulateColor = ELEMENT_COLORS[regulate];
            return (
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-gray-800">{reading.relationTitle}</h2>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">{reading.relationDesc}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className={`rounded-xl border p-4 ${supportColor.bg} ${supportColor.border}`}>
                    <p className="text-[11px] font-semibold text-gray-500">{reading.generates}</p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-gray-800">{ELEMENTS[strong][locale]}</span>
                      <span className="text-xs text-gray-400">→</span>
                      <span className={`text-sm font-bold ${supportColor.text}`}>{ELEMENTS[support][locale]}</span>
                    </div>
                  </div>
                  <div className={`rounded-xl border p-4 ${regulateColor.bg} ${regulateColor.border}`}>
                    <p className="text-[11px] font-semibold text-gray-500">{reading.controls}</p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-gray-800">{ELEMENTS[strong][locale]}</span>
                      <span className="text-xs text-gray-400">↘</span>
                      <span className={`text-sm font-bold ${regulateColor.text}`}>{ELEMENTS[regulate][locale]}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-700">{reading.balanceQuestions}</p>
                  <ul className="mt-2 space-y-1">
                    {reading.balanceQuestionItems.map((item) => (
                      <li key={item} className="flex gap-2 text-xs leading-relaxed text-gray-600">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })()}

          {/* Dominant element profile */}
          {(() => {
            const el = result.dominant;
            const c = ELEMENT_COLORS[el];
            const traits = ELEMENT_TRAITS[el][locale];
            const lucky = LUCKY[el][locale];
            return (
              <div className={`rounded-2xl border p-5 ${c.bg} ${c.border}`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{ELEMENT_EMOJIS[el]}</span>
                  <div>
                    <h2 className={`font-bold text-lg ${c.text}`}>{ELEMENTS[el][locale]}</h2>
                    <p className="text-xs text-gray-500">{t.dominantElement}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">✅ {t.strengths}</p>
                    <ul className="space-y-0.5">
                      {traits.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-gray-700 flex gap-1">
                          <span className="text-gray-400">·</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">⚠️ {t.weaknesses}</p>
                    <ul className="space-y-0.5">
                      {traits.weaknesses.map((w, i) => (
                        <li key={i} className="text-sm text-gray-700 flex gap-1">
                          <span className="text-gray-400">·</span>{w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-600 mb-0.5">💼 {t.career}</p>
                  <p className="text-sm text-gray-700">{traits.career}</p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: t.luckyColors, value: lucky.colors, icon: '🎨' },
                    { label: t.luckyNumbers, value: lucky.numbers, icon: '🔢' },
                    { label: t.luckyDirections, value: lucky.directions, icon: '🧭' },
                  ].map(item => (
                    <div key={item.label} className="bg-white bg-opacity-60 rounded-lg p-2 text-center">
                      <p className="text-base mb-0.5">{item.icon}</p>
                      <p className="text-[10px] text-gray-500 mb-0.5">{item.label}</p>
                      <p className="text-xs font-semibold text-gray-800">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
            <h2 className="text-sm font-semibold text-green-800">{reading.profileChanges}</h2>
            <p className="mt-2 text-xs leading-relaxed text-green-900/75">{reading.profileChangesDesc}</p>
          </div>

          <Card className="border-primary/20 bg-primary/[0.04] shadow-sm">
            <CardHeader className="pb-3 text-center">
              <CardTitle className="text-base">{shareLabels.actions}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={shareImage} disabled={imageSharing} className="w-full">
                {imageSharing ? shareLabels.imageSharing : `🖼️ ${shareLabels.imageShare}`}
              </Button>
              <p className="text-center text-xs text-muted-foreground">{shareLabels.imagePrivacy}</p>
              <Button onClick={share} variant="outline" className="w-full border-primary/30 text-primary">
                {shareCopied ? `✅ ${shareLabels.shareCopied}` : `🔗 ${shareLabels.share}`}
              </Button>
              <p className="text-center text-xs text-amber-700">{shareLabels.privacyNote}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setDone(false)} variant="secondary" className="w-full">
                {t.resetBtn}
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
}
