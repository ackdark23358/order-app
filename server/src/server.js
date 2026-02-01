import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pool from './config/database.js'
import menusRouter from './routes/menus.js'
import ordersRouter from './routes/orders.js'
import statsRouter from './routes/stats.js'

// 환경 변수 로드
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// CORS: 단일 origin 또는 쉼표로 구분된 여러 origin 허용 (로컬 + 배포 URL 동시 사용)
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'
const allowedOrigins = corsOrigin.split(',').map(s => s.trim()).filter(Boolean)
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true)
    if (allowedOrigins.includes(origin)) return cb(null, origin)
    return cb(null, false)
  },
  credentials: true
}))
app.use(express.json()) // JSON 파싱
app.use(express.urlencoded({ extended: true })) // URL 인코딩된 데이터 파싱

// 데이터베이스 연결 테스트
pool.query('SELECT NOW()')
  .then(() => {
    console.log('✅ 데이터베이스 연결 확인 완료')
  })
  .catch((err) => {
    console.error('❌ 데이터베이스 연결 오류:', err.message)
  })

// 기본 라우트
app.get('/', (req, res) => {
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
