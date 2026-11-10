import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildWhatsAppLink } from './whatsappLink.js'

test('quita todo lo que no sea dígito del teléfono', () => {
  const link = buildWhatsAppLink('+56 9 1234 5678', 'hola')
  assert.match(link, /^https:\/\/wa\.me\/56912345678\?text=/)
})

test('codifica el mensaje para URL', () => {
  const link = buildWhatsAppLink('123456', 'Hola, ¿cómo estás?')
  const url = new URL(link)
  assert.equal(url.searchParams.get('text'), 'Hola, ¿cómo estás?')
})
