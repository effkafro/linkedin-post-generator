import type { JobSubStyle, CandidatePersona, Industry, JobConfig } from '../types/job'

export const JOB_SUB_STYLE_OPTIONS: { value: JobSubStyle; label: string; description: string }[] = [
  { value: 'wir-suchen', label: 'Wir suchen', description: 'Klassisch, direkt. "Wir suchen ab sofort..."' },
  { value: 'kennt-jemanden', label: 'Kennt ihr jemanden?', description: 'Netzwerk aktivieren. "Kennt jemand von euch..."' },
  { value: 'persoenlich', label: 'Persönliche Empfehlung', description: 'Storytelling. "In meinem Team suchen wir..."' },
  { value: 'opportunity', label: 'Opportunity Pitch', description: 'Benefits-first. "Diese Chance solltest du nicht verpassen..."' },
]

export const CANDIDATE_PERSONA_OPTIONS: { value: CandidatePersona; label: string; description: string }[] = [
  { value: 'junior', label: 'Junior / Berufseinsteiger', description: 'Mentoring, Lernmöglichkeiten betonen' },
  { value: 'senior', label: 'Senior / Erfahren', description: 'Verantwortung, technische Challenges betonen' },
  { value: 'c-level', label: 'C-Level / Management', description: 'Strategie, Leadership, Vision betonen' },
  { value: 'freelancer', label: 'Freelancer / Consultant', description: 'Projektdetails, Flexibilität betonen' },
]

export const INDUSTRY_OPTIONS: { value: Industry; label: string }[] = [
  { value: 'tech', label: 'Tech & IT' },
  { value: 'finance', label: 'Finance & Banking' },
  { value: 'healthcare', label: 'Healthcare & Pharma' },
  { value: 'marketing', label: 'Marketing & Creative' },
  { value: 'hr', label: 'HR & People' },
  { value: 'legal', label: 'Legal & Compliance' },
  { value: 'other', label: 'Andere Branche' },
]

export const DEFAULT_JOB_CONFIG: JobConfig = {
  hasExistingPosting: false,
  jobSubStyle: 'wir-suchen',
  candidatePersona: 'senior',
  industry: 'tech',
  remoteOption: false,
}
