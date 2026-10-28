import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [{
    name: 'local-admin-api',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const pathname = (request.url || '').split('?')[0]
        if (pathname !== '/api/content' && pathname !== '/api/media') return next()
        try {
          const module = await server.ssrLoadModule(pathname + '.ts')
          await module.default(request, response)
        } catch (error) {
          console.error('Local administration API failed:', error instanceof Error ? error.message : error)
          response.statusCode = 500
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ error: 'Não foi possível acessar a API local.' }))
        }
      })
    },
  }],
})
