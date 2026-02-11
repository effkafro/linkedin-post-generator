export function hashContent(content: string): string {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & 0x7fffffff // Convert to positive 32bit integer
  }
  return hash.toString(16)
}
