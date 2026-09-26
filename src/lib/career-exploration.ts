import { CAREERS } from './data-layer/shards/careers'

export type CareerExample = {
  id: string
  code: string
  title: string
  description: string
}

type CareerLocale = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'

// Keep the large career shard on the server; the interactive test receives only display fields.
export function getCareerExamples(locale: CareerLocale): CareerExample[] {
  return CAREERS.map((career) => ({
    id: career.id,
    code: career.riasecCode.toUpperCase().replace(/[^RIASEC]/g, ''),
    title: career.title[locale] ?? career.title.en ?? '',
    description: career.description[locale] ?? career.description.en ?? '',
  })).filter((career) => career.code.length > 0 && career.title.length > 0)
}
