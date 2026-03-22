function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 50
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.fillText('Cwm fjordbank glyphs vext quiz', 2, 15)
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
    ctx.fillText('Cwm fjordbank glyphs vext quiz', 4, 17)

    return canvas.toDataURL()
  } catch {
    return ''
  }
}

function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl || !(gl instanceof WebGLRenderingContext)) return ''

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    if (!debugInfo) return ''

    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) as string
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string
    return `${vendor}~${renderer}`
  } catch {
    return ''
  }
}

async function hashSHA256(input: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder()
    const data = encoder.encode(input)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Fallback: djb2 hash for HTTP/localhost
  let hash = 5381
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) & 0xffffffff
  }
  return Math.abs(hash).toString(16).padStart(8, '0')
}

export async function generateFingerprint(): Promise<string> {
  const signals = [
    navigator.userAgent,
    navigator.language,
    String(navigator.hardwareConcurrency || ''),
    navigator.platform || '',
    `${screen.width}x${screen.height}`,
    String(screen.colorDepth),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    getCanvasFingerprint(),
    getWebGLFingerprint(),
  ]

  return hashSHA256(signals.join('|'))
}
