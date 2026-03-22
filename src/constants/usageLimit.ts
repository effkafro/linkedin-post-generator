export const ANONYMOUS_ACTION_LIMIT = 3

export const USAGE_LIMIT_MESSAGES = {
  banner: (remaining: number) =>
    `Noch ${remaining} kostenlose ${remaining === 1 ? 'Aktion' : 'Aktionen'} verfügbar`,
  limitReached: 'Du hast dein kostenloses Limit erreicht. Melde dich kostenlos an, um weiterzumachen.',
} as const
