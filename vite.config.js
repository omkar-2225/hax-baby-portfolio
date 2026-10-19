import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Real Backend REST API Plugin for Vite
// Serves /api/wishes and /api/odometer with persistent disk storage in server-data/
function dreamBackendPlugin() {
  const dataDir = path.resolve(__dirname, 'server-data')
  const wishesFile = path.join(dataDir, 'wishes.json')
  const odometerFile = path.join(dataDir, 'odometer.json')

  const defaultWishes = [
    {
      id: "wish-1",
      name: "Barnaby Bear",
      sticker: "🐻",
      message: "Pip, your chamomile music box melody cured my 3-week winter insomnia! 10/10 best engineer.",
      time: "2 hours ago",
      timestamp: Date.now() - 7200000,
      tag: "Verified Dreamer",
      loves: 14
    },
    {
      id: "wish-2",
      name: "Luna the Night Owl",
      sticker: "🦉",
      message: "The porcelain moon lantern keeps my nursery hollow so warm and cozy. Thank you Pip!",
      time: "5 hours ago",
      timestamp: Date.now() - 18000000,
      tag: "Midnight Neighbor",
      loves: 9
    },
    {
      id: "wish-3",
      name: "Sprout the Sprite",
      sticker: "🍄",
      message: "Can you please route a dream of flying over pink cotton candy mountains tonight? ✨",
      time: "Yesterday",
      timestamp: Date.now() - 86400000,
      tag: "Cloud Hopper",
      loves: 21
    }
  ]

  function ensureData() {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    if (!fs.existsSync(wishesFile)) {
      fs.writeFileSync(wishesFile, JSON.stringify(defaultWishes, null, 2), 'utf-8')
    }
    if (!fs.existsSync(odometerFile)) {
      fs.writeFileSync(odometerFile, JSON.stringify({ count: 1256, lastUpdated: Date.now() }, null, 2), 'utf-8')
    }
  }

  return {
    name: 'dream-backend-api',
    configureServer(server) {
      ensureData()

      server.middlewares.use((req, res, next) => {
        // Health check endpoint
        if (req.method === 'GET' && req.url === '/api/health') {
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.end(JSON.stringify({ status: 'ok', server: 'Midnight Nursery Dream Engine v3.0' }))
          return
        }

        // GET /api/wishes - Real live guestbook backend
        if (req.method === 'GET' && (req.url === '/api/wishes' || req.url?.startsWith('/api/wishes?'))) {
          ensureData()
          try {
            const raw = fs.readFileSync(wishesFile, 'utf-8')
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
            res.statusCode = 200
            res.end(raw)
          } catch (e) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: 'Failed to read wishes database' }))
          }
          return
        }

        // POST /api/wishes - Create new live wish
        if (req.method === 'POST' && req.url === '/api/wishes') {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', () => {
            try {
              ensureData()
              const { name, message, sticker, tag } = JSON.parse(body || '{}')
              if (!name?.trim() || !message?.trim()) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'Name and message are required' }))
                return
              }

              const wishes = JSON.parse(fs.readFileSync(wishesFile, 'utf-8'))
              const newWish = {
                id: 'wish-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
                name: String(name).trim().slice(0, 50),
                message: String(message).trim().slice(0, 200),
                sticker: sticker || '🌟',
                time: 'Just now',
                timestamp: Date.now(),
                tag: tag || 'Midnight Friend',
                loves: 0
              }

              wishes.unshift(newWish)
              fs.writeFileSync(wishesFile, JSON.stringify(wishes, null, 2), 'utf-8')

              res.setHeader('Content-Type', 'application/json')
              res.statusCode = 201
              res.end(JSON.stringify({ success: true, wish: newWish, total: wishes.length }))
            } catch (err) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Server error saving wish' }))
            }
          })
          return
        }

        // POST /api/wishes/love - Increment love/reaction on wish
        if (req.method === 'POST' && req.url === '/api/wishes/love') {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', () => {
            try {
              ensureData()
              const { id } = JSON.parse(body || '{}')
              const wishes = JSON.parse(fs.readFileSync(wishesFile, 'utf-8'))
              const target = wishes.find(w => w.id === id)
              if (target) {
                target.loves = (target.loves || 0) + 1
                fs.writeFileSync(wishesFile, JSON.stringify(wishes, null, 2), 'utf-8')
                res.setHeader('Content-Type', 'application/json')
                res.statusCode = 200
                res.end(JSON.stringify({ success: true, loves: target.loves }))
                return
              }
              res.statusCode = 404
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Wish not found' }))
            } catch (err) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Server error' }))
            }
          })
          return
        }

        // GET /api/odometer - Visitor count
        if (req.method === 'GET' && req.url === '/api/odometer') {
          ensureData()
          const data = fs.readFileSync(odometerFile, 'utf-8')
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.end(data)
          return
        }

        // POST /api/odometer/increment - Increment visitor count
        if (req.method === 'POST' && req.url === '/api/odometer/increment') {
          ensureData()
          const odo = JSON.parse(fs.readFileSync(odometerFile, 'utf-8'))
          odo.count = (odo.count || 1256) + 1
          odo.lastUpdated = Date.now()
          fs.writeFileSync(odometerFile, JSON.stringify(odo, null, 2), 'utf-8')
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.end(JSON.stringify(odo))
          return
        }

        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), dreamBackendPlugin()],
  server: {
    port: 5173
  }
})
