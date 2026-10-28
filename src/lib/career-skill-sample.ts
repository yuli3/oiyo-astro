// WHY 2026-10-29: a deliberately small, source-ID-linked sample for exploration.
// Partial occupation mappings are not official crosswalks or personal skill scores.
export type BridgeLocale = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'
export type SkillDatum = { id: string; kind: 'onet' | 'esco'; label: Record<BridgeLocale, string>; importance: number | null; date: string | null }
export type CareerSkillProfile = { careerId: string; mapping: 'partial'; onetSoc: string; escoOccupation: string; skills: readonly SkillDatum[] }
export const CAREER_SKILL_PROVENANCE = {
  onet: { version: '30.3', sha256: '23985fa24e0197067c02b3f062f0520839ef15a8980b93518bae68eeb041a841', rows: 44700, url: 'https://www.onetcenter.org/db_releases.html' },
  esco: { version: '1.2.1', sha256: 'e1a46511f0ef4d505f106f1d41f528ef76d289f93e59d4d0cbaac38986102c44', rows: 126051, url: 'https://esco.ec.europa.eu/en/use-esco' },
} as const
export const CAREER_SKILL_SAMPLE: readonly CareerSkillProfile[] = [
  {
    "careerId": "software-engineer",
    "mapping": "partial",
    "onetSoc": "15-1252.00",
    "escoOccupation": "http://data.europa.eu/esco/occupation/f2b15a0e-e65a-438a-affb-29b9d50b77d1",
    "skills": [
      {
        "id": "onet:2.B.2.i",
        "kind": "onet",
        "label": {
          "ko": "복잡한 문제 해결",
          "en": "Complex problem solving",
          "ja": "複雑な問題解決",
          "zh": "复杂问题解决",
          "fr": "Résolution de problèmes complexes",
          "es": "Resolución de problemas complejos"
        },
        "importance": 3.38,
        "date": "08/2025"
      },
      {
        "id": "onet:2.B.3.e",
        "kind": "onet",
        "label": {
          "ko": "프로그래밍",
          "en": "Programming",
          "ja": "プログラミング",
          "zh": "编程",
          "fr": "Programmation",
          "es": "Programación"
        },
        "importance": 4.0,
        "date": "08/2025"
      },
      {
        "id": "onet:2.B.4.e",
        "kind": "onet",
        "label": {
          "ko": "판단과 의사결정",
          "en": "Judgment and decision making",
          "ja": "判断と意思決定",
          "zh": "判断与决策",
          "fr": "Jugement et prise de décision",
          "es": "Juicio y toma de decisiones"
        },
        "importance": 3.62,
        "date": "08/2025"
      },
      {
        "id": "onet:2.B.4.g",
        "kind": "onet",
        "label": {
          "ko": "시스템 분석",
          "en": "Systems analysis",
          "ja": "システム分析",
          "zh": "系统分析",
          "fr": "Analyse des systèmes",
          "es": "Análisis de sistemas"
        },
        "importance": 3.5,
        "date": "08/2025"
      }
    ]
  },
  {
    "careerId": "data-analyst",
    "mapping": "partial",
    "onetSoc": "15-2051.01",
    "escoOccupation": "http://data.europa.eu/esco/occupation/d3edb8f8-3a06-47a0-8fb9-9b212c006aa2",
    "skills": [
      {
        "id": "onet:2.B.2.i",
        "kind": "onet",
        "label": {
          "ko": "복잡한 문제 해결",
          "en": "Complex problem solving",
          "ja": "複雑な問題解決",
          "zh": "复杂问题解决",
          "fr": "Résolution de problèmes complexes",
          "es": "Resolución de problemas complejos"
        },
        "importance": 3.38,
        "date": "08/2024"
      },
      {
        "id": "onet:2.B.3.e",
        "kind": "onet",
        "label": {
          "ko": "프로그래밍",
          "en": "Programming",
          "ja": "プログラミング",
          "zh": "编程",
          "fr": "Programmation",
          "es": "Programación"
        },
        "importance": 2.5,
        "date": "08/2024"
      },
      {
        "id": "onet:2.B.4.e",
        "kind": "onet",
        "label": {
          "ko": "판단과 의사결정",
          "en": "Judgment and decision making",
          "ja": "判断と意思決定",
          "zh": "判断与决策",
          "fr": "Jugement et prise de décision",
          "es": "Juicio y toma de decisiones"
        },
        "importance": 3.62,
        "date": "08/2024"
      },
      {
        "id": "onet:2.B.4.g",
        "kind": "onet",
        "label": {
          "ko": "시스템 분석",
          "en": "Systems analysis",
          "ja": "システム分析",
          "zh": "系统分析",
          "fr": "Analyse des systèmes",
          "es": "Análisis de sistemas"
        },
        "importance": 3.12,
        "date": "08/2024"
      },
      {
        "id": "http://data.europa.eu/esco/skill/07889c08-7220-47c8-96f7-6068fbea00dc",
        "kind": "esco",
        "label": {
          "ko": "데이터 정규화",
          "en": "Normalise data",
          "ja": "データの正規化",
          "zh": "数据规范化",
          "fr": "Normaliser les données",
          "es": "Normalizar datos"
        },
        "importance": null,
        "date": null
      },
      {
        "id": "http://data.europa.eu/esco/skill/1b70a55d-b8a4-49fc-96c6-15ab4cff2522",
        "kind": "esco",
        "label": {
          "ko": "데이터 처리 기법 활용",
          "en": "Use data processing techniques",
          "ja": "データ処理手法の活用",
          "zh": "运用数据处理技术",
          "fr": "Utiliser des techniques de traitement des données",
          "es": "Usar técnicas de procesamiento de datos"
        },
        "importance": null,
        "date": null
      },
      {
        "id": "http://data.europa.eu/esco/skill/1e77e42a-181f-4b48-8e74-201ce50ffc29",
        "kind": "esco",
        "label": {
          "ko": "현재 데이터 해석",
          "en": "Interpret current data",
          "ja": "現行データの解釈",
          "zh": "解释当前数据",
          "fr": "Interpréter les données actuelles",
          "es": "Interpretar datos actuales"
        },
        "importance": null,
        "date": null
      }
    ]
  },
  {
    "careerId": "data-scientist",
    "mapping": "partial",
    "onetSoc": "15-2051.00",
    "escoOccupation": "http://data.europa.eu/esco/occupation/258e46f9-0075-4a2e-adae-1ff0477e0f30",
    "skills": [
      {
        "id": "http://data.europa.eu/esco/skill/07889c08-7220-47c8-96f7-6068fbea00dc",
        "kind": "esco",
        "label": {
          "ko": "데이터 정규화",
          "en": "Normalise data",
          "ja": "データの正規化",
          "zh": "数据规范化",
          "fr": "Normaliser les données",
          "es": "Normalizar datos"
        },
        "importance": null,
        "date": null
      },
      {
        "id": "http://data.europa.eu/esco/skill/1b70a55d-b8a4-49fc-96c6-15ab4cff2522",
        "kind": "esco",
        "label": {
          "ko": "데이터 처리 기법 활용",
          "en": "Use data processing techniques",
          "ja": "データ処理手法の活用",
          "zh": "运用数据处理技术",
          "fr": "Utiliser des techniques de traitement des données",
          "es": "Usar técnicas de procesamiento de datos"
        },
        "importance": null,
        "date": null
      },
      {
        "id": "http://data.europa.eu/esco/skill/1e77e42a-181f-4b48-8e74-201ce50ffc29",
        "kind": "esco",
        "label": {
          "ko": "현재 데이터 해석",
          "en": "Interpret current data",
          "ja": "現行データの解釈",
          "zh": "解释当前数据",
          "fr": "Interpréter les données actuelles",
          "es": "Interpretar datos actuales"
        },
        "importance": null,
        "date": null
      }
    ]
  }
]
