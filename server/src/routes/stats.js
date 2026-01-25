import express from 'express'
import pool from '../config/database.js'

const router = express.Router()

// GET /api/stats/orders - 주문 통계 조회
router.get('/orders', async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'received') as received,
        COUNT(*) FILTER (WHERE status = 'preparing') as preparing,
        COUNT(*) FILTER (WHERE status = 'completed') as completed
      FROM orders
    `
    const statsResult = await pool.query(statsQuery)
    const stats = statsResult.rows[0]

    res.json({
      success: true,
      data: {
        total: parseInt(stats.total),
        received: parseInt(stats.received),
        preparing: parseInt(stats.preparing),
        completed: parseInt(stats.completed)
      }
    })
  } catch (error) {
    console.error('통계 조회 오류:', error)
    res.status(500).json({
      success: false,
      error: '통계 조회 중 오류가 발생했습니다.'
    })
  }
})

export default router
