import { createElement, type ReactNode } from 'react'

// Render only a small, explicit set of formatting tags. Never execute saved HTML.
const allowed = new Set(['p', 'strong', 'b', 'em', 'i', 'u', 's', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'br', 'a'])

function renderNode(node: Node, key: number): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent
  if (node.nodeType !== Node.ELEMENT_NODE) return null
  const element = node as Element
  const tag = element.tagName.toLowerCase()
  const children = Array.from(element.childNodes).map((child, index) => renderNode(child, index))
  if (!allowed.has(tag)) return createElement('span', { key }, ...children)
  if (tag === 'a') {
    const href = element.getAttribute('href') || ''
    const safe = /^(https?:\/\/|mailto:)/i.test(href)
    return createElement('a', { key, ...(safe ? { href, target: '_blank', rel: 'noopener noreferrer' } : {}) }, ...children)
  }
  return createElement(tag, { key }, ...children)
}

export default function SafeRichText({ value }: { value: string }) {
  if (!/<[a-z][\s\S]*>/i.test(value)) return <span style={{ whiteSpace: 'pre-wrap' }}>{value}</span>
  const document = new DOMParser().parseFromString(value, 'text/html')
  return <>{Array.from(document.body.childNodes).map((node, index) => renderNode(node, index))}</>
}
