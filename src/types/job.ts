export type JobSubStyle = 'wir-suchen' | 'kennt-jemanden' | 'persoenlich' | 'opportunity'
export type CandidatePersona = 'junior' | 'senior' | 'c-level' | 'freelancer'
export type Industry = 'tech' | 'finance' | 'healthcare' | 'marketing' | 'hr' | 'legal' | 'other'

export interface JobConfig {
  hasExistingPosting: boolean
  jobUrl?: string
  jobSubStyle: JobSubStyle
  candidatePersona: CandidatePersona
  industry: Industry
  location?: string
  remoteOption: boolean
  companyName?: string
  jobTitle?: string
  benefits?: string[]
  requirements?: string[]
}
