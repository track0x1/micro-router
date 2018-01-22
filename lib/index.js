const UrlPattern = require('url-pattern')
const { getParamsAndQuery, patternOpts } = require('../utils')

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

const methodFn = function (method) {
  return function (path, handler) {
    if (!path) throw new Error('You need to set a valid path')
    if (!handler) throw new Error('You need to set a valid handler')

    const route = new UrlPattern(path, patternOpts)

    const routeFn = (req, res) => {
      const { params, query } = getParamsAndQuery(route, req.url)

      if (params && req.method === method) {
        return handler(Object.assign(req, { params, query }), res)
      }
    }

    this.stack.push(routeFn)
  }
}

const proto = {
  use(...routers) {
    const stack = this.stack
    for (const rt of routers) stack.push(...rt.stack)
    return async (req, res) => {
      for (const fn of stack) {
        const result = await fn(req, res)
        if (result || res.headersSent) return result
      }

      res.statusCode = 404
      res.end()
    }
  }
}

METHODS.forEach(method => {
  proto[method === 'DELETE' ? 'del' : method.toLowerCase()] = methodFn(method)
})

module.exports = () => Object.assign(Object.create(proto), { stack: [] })
