import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cartReducer, initialCartState } from './cartReducer.js'

test('ADD_ITEM agrega una línea nueva', () => {
  const state = cartReducer(initialCartState, { type: 'ADD_ITEM', productId: 'a', quantity: 1, maxQuantity: 5 })
  assert.deepEqual(state.lines, [{ productId: 'a', quantity: 1 }])
})

test('ADD_ITEM incrementa una línea existente', () => {
  let state = cartReducer(initialCartState, { type: 'ADD_ITEM', productId: 'a', quantity: 1, maxQuantity: 5 })
  state = cartReducer(state, { type: 'ADD_ITEM', productId: 'a', quantity: 2, maxQuantity: 5 })
  assert.equal(state.lines[0].quantity, 3)
})

test('ADD_ITEM no supera el stock disponible', () => {
  const state = cartReducer(initialCartState, { type: 'ADD_ITEM', productId: 'a', quantity: 10, maxQuantity: 3 })
  assert.equal(state.lines[0].quantity, 3)
})

test('ADD_ITEM con maxQuantity 0 no agrega nada (sin stock)', () => {
  const state = cartReducer(initialCartState, { type: 'ADD_ITEM', productId: 'a', quantity: 1, maxQuantity: 0 })
  assert.deepEqual(state.lines, [])
})

test('SET_QUANTITY clampa al máximo', () => {
  const state = cartReducer(initialCartState, { type: 'SET_QUANTITY', productId: 'a', quantity: 99, maxQuantity: 4 })
  assert.equal(state.lines[0].quantity, 4)
})

test('SET_QUANTITY a 0 elimina la línea', () => {
  let state = cartReducer(initialCartState, { type: 'ADD_ITEM', productId: 'a', quantity: 2, maxQuantity: 5 })
  state = cartReducer(state, { type: 'SET_QUANTITY', productId: 'a', quantity: 0, maxQuantity: 5 })
  assert.deepEqual(state.lines, [])
})

test('SET_QUANTITY negativa se clampa a 0 (elimina)', () => {
  let state = cartReducer(initialCartState, { type: 'ADD_ITEM', productId: 'a', quantity: 2, maxQuantity: 5 })
  state = cartReducer(state, { type: 'SET_QUANTITY', productId: 'a', quantity: -3, maxQuantity: 5 })
  assert.deepEqual(state.lines, [])
})

test('REMOVE_ITEM quita solo la línea indicada', () => {
  let state = cartReducer(initialCartState, { type: 'ADD_ITEM', productId: 'a', quantity: 1, maxQuantity: 5 })
  state = cartReducer(state, { type: 'ADD_ITEM', productId: 'b', quantity: 1, maxQuantity: 5 })
  state = cartReducer(state, { type: 'REMOVE_ITEM', productId: 'a' })
  assert.deepEqual(state.lines, [{ productId: 'b', quantity: 1 }])
})

test('CLEAR vacía el carrito', () => {
  let state = cartReducer(initialCartState, { type: 'ADD_ITEM', productId: 'a', quantity: 1, maxQuantity: 5 })
  state = cartReducer(state, { type: 'CLEAR' })
  assert.deepEqual(state, initialCartState)
})

test('una acción desconocida no cambia el estado', () => {
  const state = cartReducer(initialCartState, { type: 'NOPE' })
  assert.equal(state, initialCartState)
})
