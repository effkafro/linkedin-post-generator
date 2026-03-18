import { z } from 'zod'

/** Schema für Quellen-Informationen aus der n8n Response */
export const sourceInfoSchema = z.object({
  title: z.string(),
  excerpt: z.string(),
  url: z.string(),
  favicon: z.string().optional(),
})

/** Schema für die n8n Webhook Generate/Refine Response */
export const generateResponseSchema = z.object({
  output: z.string(),
  source: sourceInfoSchema.optional().nullable(),
})

/** Abgeleitete Typen für externe Nutzung */
export type GenerateResponse = z.infer<typeof generateResponseSchema>
export type SourceInfoResponse = z.infer<typeof sourceInfoSchema>
