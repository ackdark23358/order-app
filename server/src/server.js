import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import dotenv from 'dotenv'
import pool from './config/database.js'
import menusRouter from './routes/menus.js'
import ordersRouter from './routes/orders.js'
import statsRouter from './routes/stats.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

// 프론트·백엔드 별도 도메인일 때 필요. Render에서 CORS_ORIGIN=프론트 URL 설정
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'
const allowedOrigins = corsOrigin.split(',').map(s => s.trim().replace(/\/$/, '')).filter(Boolean)
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true)
    const normalized = origin.replace(/\/$/, '')
    if (allowedOrigins.includes(normalized)) return cb(null, origin)
    return cb(null, false)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 데이터베이스 연결 테스트
pool.query('SELECT NOW()')
  .then(() => {
    console.log('✅ 데이터베이스 연결 확인 완료')
  })
  .catch((err) => {
    console.error('❌ 데이터베이스 연결 오류:', err.message)
  })

// API 루트 (JSON, 같은 오리진 서빙 시 프론트가 /api 사용)
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: '커피 주문 앱 API 서버가 실행 중입니다.',
    version: '1.0.0'
  })
})

// 헬스 체크
app.get('/api/health', async (req, res) => {
  try {
    // 데이터베이스 연결 상태 확인
    await pool.query('SELECT 1')
    res.json({
      success: true,
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

// API 라우트
app.use('/api/menus', menusRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/stats', statsRouter)

// 프론트엔드 정적 파일 (같은 오리진 서빙, CORS 불필요)
const uiDist = path.join(__dirname, '..', '..', 'UI', 'dist')
if (fs.existsSync(uiDist)) {
  app.use(express.static(uiDist))
  // SPA: API가 아닌 GET 요청은 index.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(uiDist, 'index.html'))
  })
} else {
  // UI 빌드 없이 백엔드만 실행 시
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: '커피 주문 앱 API 서버가 실행 중입니다.',
      version: '1.0.0'
    })
  })
}

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: '요청한 리소스를 찾을 수 없습니다.'
  })
})

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('에러 발생:', err)
  res.status(500).json({
    success: false,
    error: '서버 내부 오류가 발생했습니다.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`)
  console.log(`환경: ${process.env.NODE_ENV || 'development'}`)
})

export default app
