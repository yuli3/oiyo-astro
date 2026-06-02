import { LocalizedText } from "@/types/manifest";

import { PerfectionismDimension, PerfectionismQuestion } from "./types";

const PERFECTIONISM_OPTIONS = [
  {
    color: "bg-red-500",
    id: "1",
    text: {
      cn: "非常不同意",
      en: "Strongly Disagree",
      es: "Totalmente en desacuerdo",
      fr: "Pas du tout d'accord",
      ja: "強くそう思わない",
      ko: "매우 그렇지 않다",
    },
    value: 1,
  },
  {
    color: "bg-orange-400",
    id: "2",
    text: {
      cn: "不同意",
      en: "Disagree",
      es: "En desacuerdo",
      fr: "Pas d'accord",
      ja: "そう思わない",
      ko: "그렇지 않다",
    },
    value: 2,
  },
  {
    color: "bg-green-600/60",
    id: "3",
    text: {
      cn: "中立",
      en: "Neutral",
      es: "Neutral",
      fr: "Neutre",
      ja: "どちらでもない",
      ko: "보통이다",
    },
    value: 3,
  },
  {
    color: "bg-green-400",
    id: "4",
    text: {
      cn: "同意",
      en: "Agree",
      es: "De acuerdo",
      fr: "D'accord",
      ja: "そう思う",
      ko: "그렇다",
    },
    value: 4,
  },
  {
    color: "bg-teal-500",
    id: "5",
    text: {
      cn: "非常同意",
      en: "Strongly Agree",
      es: "Totalmente de acuerdo",
      fr: "Tout à fait d'accord",
      ja: "強くそう思う",
      ko: "매우 그렇다",
    },
    value: 5,
  },
];

export const PERFECTIONISM_QUESTIONS: PerfectionismQuestion[] = [
  {
    dimension: "Adaptive",
    id: "perf_1",
    options: PERFECTIONISM_OPTIONS,
    text: {
      cn: "我力求在所做的一切事情中做到卓越。",
      en: "I strive for excellence in everything I do.",
      es: "Me esfuerzo por la excelencia en todo lo que hago.",
      fr: "Je vise l'excellence dans tout ce que je fais.",
      ja: "私はすべてのことにおいて卓越性を追求します。",
      ko: "나는 하는 모든 일에서 탁월함을 추구한다.",
    },
  },
  {
    dimension: "Adaptive",
    id: "perf_2",
    options: PERFECTIONISM_OPTIONS,
    text: {
      cn: "我从努力工作中获得快乐。",
      en: "I get pleasure from working hard.",
      es: "Disfruto trabajando duro.",
      fr: "J'éprouve du plaisir à travailler dur.",
      ja: "私は一生懸命働くことに喜びを感じます。",
      ko: "나는 열심히 일하는 것에서 즐거움을 얻는다.",
    },
  },
  {
    dimension: "Maladaptive",
    id: "perf_3",
    options: PERFECTIONISM_OPTIONS,
    text: {
      cn: "如果我失败了，我觉得自己一无是处。",
      en: "If I fail, I feel like a worthless person.",
      es: "Si fallo, me siento como una persona sin valor.",
      fr: "Si j'échoue, je me sens comme une personne sans valeur.",
      ja: "失敗すると、自分が価値のない人間に感じられます。",
      ko: "실패하면 나 자신이 쓸모없는 사람처럼 느껴진다.",
    },
  },
  {
    dimension: "Maladaptive",
    id: "perf_4",
    options: PERFECTIONISM_OPTIONS,
    text: {
      cn: "我总是害怕犯错。",
      en: "I am constantly afraid of making mistakes.",
      es: "Tengo miedo constante de cometer errores.",
      fr: "J'ai constamment peur de faire des erreurs.",
      ja: "私は間違いを犯すことを常に恐れています。",
      ko: "나는 실수하는 것을 끊임없이 두려워한다.",
    },
  },
];

export const FULL_PERFECTIONISM_QUESTIONS = PERFECTIONISM_QUESTIONS;
