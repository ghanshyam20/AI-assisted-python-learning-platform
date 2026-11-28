import { createElement, type CSSProperties, type ReactNode } from 'react'

// Only render formatting supported by the lesson editor.
const allowed = new Set([
  'p', 'strong', 'b', 'em', 'i', 'u', 's',
  'h2', 'h3', 'h4', 'ul', 'ol', 'li',
  'blockquote', 'code', 'pre', 'br', 'a',
  'span', 'mark',
])

const fonts = new Set([
  'Arial', 'Georgia', 'Verdana', 'Tahoma',
  'Times New Roman', 'Courier New', 'monospace',
])

function safeTextStyle(element: Element): CSSProperties {
  const style: CSSProperties = {}
  const font = element.getAttribute('style') || ''

  // Read only the font settings saved by the admin editor.
  const family = font.match(/(?:^|;)\s*font-family\s*:\s*([^;]+)/i)?.[1]
  const size = font.match(/(?:^|;)\s*font-size\s*:\s*(\d+(?:\.\d+)?)px/i)?.[1]

  if (family) {
    const name = family.trim().replace(/^['"]|['"]$/g, '')
    if (fonts.has(name)) style.fontFamily = name
  }

  if (size) {
    const pixels = Number(size)
    if (pixels >= 10 && pixels <= 48) {
      style.fontSize = `${pixels}px`
    }
  }

  return style
}

function renderNode(node: Node, key: number): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent
  if (node.nodeType !== Node.ELEMENT_NODE) return null

  const element = node as Element
  const tag = element.tagName.toLowerCase()
  const children = Array.from(element.childNodes).map(
    (child, index) => renderNode(child, index),
  )

  if (!allowed.has(tag)) {
    return createElement('span', { key }, ...children)
  }

  if (tag === 'a') {
    const href = element.getAttribute('href') || ''
    const safe = /^(https?:\/\/|mailto:)/i.test(href)

    return createElement(
      'a',
      {
        key,
        ...(safe ? {
          href,
          target: '_blank',
          rel: 'noopener noreferrer',
        } : {}),
      },
      ...children,
    )
  }

  // Keep approved font formatting without rendering arbitrary HTML styles.
  const style = tag === 'span' ? safeTextStyle(element) : {}

  return createElement(tag, { key, style }, ...children)
}

export default function SafeRichText({ value }: { value: string }) {
  if (!/<[a-z][\s\S]*>/i.test(value)) {
    return <span style={{ whiteSpace: 'pre-wrap' }}>{value}</span>
  }

  const document = new DOMParser().parseFromString(value, 'text/html')

  return (
    <>
      {Array.from(document.body.childNodes).map(
        (node, index) => renderNode(node, index),
      )}
    </>
  )
}