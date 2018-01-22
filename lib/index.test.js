const test = require('ava')
const micro = require('micro')
const listen = require('test-listen')
const request = require('request-promise')

const toy = require('./')

const server = fn => listen(micro(fn))

test('diferent routes', async t => {
  const router = toy()
  router.get('/foo', () => ({ name: 'foo' }))
  router.get('/bar', () => ({ name: 'bar' }))

  const url = await server(router.use())
  const fooGet = await request(`${url}/foo`)
  const barGet = await request(`${url}/bar`)

  t.is(JSON.parse(fooGet).name, 'foo')
  t.is(JSON.parse(barGet).name, 'bar')
})

test('routes with params and query', async t => {
  const hello = req => `Hello ${req.params.msg} ${req.query.time}`

  const router = toy()
  router.get('/hello/:msg', hello)

  const url = await server(router.use())
  const response = await request(`${url}/hello/world?time=now`)

  t.is(response, 'Hello world now')
})

test('non-existant route', async t => {
  const router = toy()

  const url = await server(router.use())
  await request(`${url}/fake-route`)
    .catch(err => {
      t.is(err.statusCode, 404)
    })
})

test('routes with underline', async t => {
  const router = toy()
  router.get('/foo_bar', () => 'Hello with underline')

  const url = await server(router.use())
  const response = await request(`${url}/foo_bar`)

  t.is(response, 'Hello with underline')
})

test('async handlers', async t => {
  const hello = req =>
    Promise.resolve(`Hello ${req.params.msg} ${req.query.time}`)

  const router = toy()
  router.get('/hello/:msg', hello)

  const url = await server(router.use())
  const response = await request(`${url}/hello/world?time=now`)

  t.is(response, 'Hello world now')
})

test('composed routes', async t => {
  const fooRouter = toy()
  fooRouter.get('/foo', () => `Hello foo`)

  const barRouter = toy()
  barRouter.get('/bar', () => `Hello bar`)

  fooRouter.use(barRouter)

  const url = await server(fooRouter.use())
  const fooResponse = await request(`${url}/foo`)
  const barResponse = await request(`${url}/bar`)

  t.is(fooResponse, 'Hello foo')
  t.is(barResponse, 'Hello bar')
})

test('composed routes (alternative syntax)', async t => {
  const topRouter = toy()
  topRouter.get('/top', () => `Hello top`)

  const fooRouter = toy()
  fooRouter.get('/bar', () => `Hello bar`)

  const url = await server(topRouter.use(fooRouter))
  const topResponse = await request(`${url}/top`)
  const barResponse = await request(`${url}/bar`)

  t.is(topResponse, 'Hello top')
  t.is(barResponse, 'Hello bar')
})

test('composed routes (alternative syntax, multiple routers)', async t => {
  const topRouter = toy()
  topRouter.get('/top', () => `Hello top`)

  const fooRouter = toy()
  fooRouter.get('/foo', () => `Hello foo`)
  const barRouter = toy()
  barRouter.get('/bar', () => `Hello bar`)

  const url = await server(topRouter.use(fooRouter, barRouter))
  const topResponse = await request(`${url}/top`)
  const fooResponse = await request(`${url}/foo`)
  const barResponse = await request(`${url}/bar`)

  t.is(topResponse, 'Hello top')
  t.is(fooResponse, 'Hello foo')
  t.is(barResponse, 'Hello bar')
})

test('multiple matching routes', async t => {
  const withPath = () => 'Hello world'
  const withParam = () => t.fail('Clashing route should not have been called')

  const router = toy()
  router.get('/path', withPath)
  router.get('/:param', withParam)

  const url = await server(router.use())
  const pathResponse = await request(`${url}/path`)

  t.is(pathResponse, 'Hello world')
})

test('multiple matching async routes', async t => {
  const withPath = (req, res) => micro.send(res, 200, 'Hello world')
  const withParam = () => t.fail('Clashing route should not have been called')

  const router = toy()
  router.get('/path', withPath)
  router.get('/:param', withParam)

  const url = await server(router.use())
  const pathResponse = await request(`${url}/path`)

  t.is(pathResponse, 'Hello world')
})

test('error without path and handler', t => {
  const router = toy()
  const fn = () => router.get()

  const error = t.throws(fn, Error)
  t.is(error.message, 'You need to set a valid path')
})

test('error without handler', t => {
  const router = toy()
  const fn = () => router.get('/hey')

  const error = t.throws(fn, Error)
  t.is(error.message, 'You need to set a valid handler')
})
