:station:  _**Toy Router -**_ A tiny, functional, modular router for ZEIT's [micro](https://github.com/zeit/micro)

[![GitHub release](https://img.shields.io/github/release/track0x1/toy-router.svg)]()
[![Coveralls](https://img.shields.io/coveralls/track0x1/toy-router.svg)]()
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

## 👌 &nbsp; Features

- **Tiny**. Just 35 lines of code.
- **Functional**. Write your http methods using functions.
- **Async**. Design to use with `async/await`
- **Modular**. Create sets of routes and join them together.

## 💻 &nbsp; Usage

Install as project dependency:

```bash
$ yarn add toy-router
```

Define your routes inside your microservice:

```js
const { send } = require('micro')
const router = require('toy-router')()

const hello = (req, res) =>
  send(res, 200, `Hello ${req.params.who}`)

const notfound = (req, res) =>
  send(res, 404, 'Not found route')

router.get('/hello/:who', hello)
router.get('/*', notfound)

module.exports = router.use()
```

### `async/await`

You can use your handler as an async function:

```js
const { send } = require('micro')
const router = require('toy-router')()

const hello = async (req, res) =>
  send(res, 200, await Promise.resolve(`Hello ${req.params.who}`))

router.get('/hello/:who', hello)

module.exports = router.use()
```

### creating a router

Similar to the pattern used by [Express Router](http://expressjs.com/en/api.html#express.router), invoke `toy-router` to create a new isolated instance.

```js
const router = require('toy-router')()
```

Then on an instance of `toy-router`, you can add routes to it using the [route methods](#route-methods), or combine it with other instances of `toy-router` with `use()`. When you've finished adding all routes, provide your final router to micro with `use()`.

#### `router.use([router, ...])`

Each instance of `toy-router` can _use_ other `toy-routers`, so you can modularize and combine multiple sets of routes.

Once you've finalized your top-level router, provide it to micro by invoking `use()`.

```js
const router = require('toy-router')()

router.get('/', () => 'G`day')

module.exports = router.use()
```

Modular approach:
```js
// index.js
const router = require('toy-router')()
const fooRouter = require('./fooRouter')
const barRouter = require('./barRouter')

module.exports = router.use(fooRouter, barRouter)

// fooRouter.js
const router = require('toy-router')()
router.get('/foo', () => 'I am foo')
module.exports = router;

// barRouter.js
const router = require('toy-router')()
router.get('/bar', () => 'I am bar')
module.exports = router;
```

### route methods

Each route is a single basic http method that is provided on an instance of `toy-router` and has the same arguments:

- `router.get(path = String, handler = Function)`
- `router.post(path = String, handler = Function)`
- `router.put(path = String, handler = Function)`
- `router.patch(path = String, handler = Function)`
- `router.del(path = String, handler = Function)`
- `router.head(path = String, handler = Function)`
- `router.options(path = String, handler = Function)`

#### path

A simple url pattern that you can define your path. In this path you can set your parameters using a `:` notation. The `req` parameter from `handler` will return this parameters as an object.

For more information about how you can define your path, see [url-pattern](https://github.com/snd/url-pattern) that's the package that we're using to match paths.

#### handler

The `handler` method is a simple function that will make some action base on your path.
The format of this function is `(res, res) => {}`

##### `req.params`

As you can see below, the `req` parameter has a property called `params` that represents the parameters defined in your `path`:

```js
const router = require('toy-router')()
const request = require('some-request-lib')

// service.js
router.get('/hello/:who', (req, res) => req.params)
module.exports = router.use()

// test.js
const response = await request('/hello/World')

console.log(response)  // { who: 'World' }
```

##### `req.query`

The `req` parameter also has a `query` property that represents the `queries` defined in your requision url:

```js
const router = require('toy-router')()
const request = require('some-request-lib')

// service.js
router.get('/user', (req, res) => req.query)
module.exports = router.use()

// test.js
const response = await request('/user?id=1')

console.log(response)  // { id: 1 }
```

### Parsing Body

By default, router *doesn't parse anything* from your requisition; it only matches your paths and execute a specific handler. So, if you want to parse your body requisition you can do something like that:

```js
const router = require('toy-router')
const { json, send } = require('micro')
const request = require('some-request-lib')

// service.js
const user = async (req, res) => {
  const body = await json(req)
  send(res, 200, body)
}

router.post('/user', user)

module.exports = router.use()

// test.js
const body = { id: 1 }
const response = await request.post('/user', { body })
```

## 🕺 &nbsp; Contribute

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device
2. Install dependencies using Yarn: `yarn install`
3. Make the necessary changes and ensure that the tests are passing using `yarn test`
4. Send a pull request 🙌
