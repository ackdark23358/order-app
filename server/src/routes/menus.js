import express from 'express'
import pool from '../config/database.js'

const router = express.Router()

// GET /api/menus - 메뉴 목록 조회
router.get('/', async (req, res) => {
  try {
    // 메뉴와 옵션을 함께 조회
    const menusQuery = `
      SELECT 
        m.id,
        m.name,
        m.description,
        m.price,
        m.image_url,
        m.stock
      FROM menus m
      ORDER BY m.id
    `
    
    const menusResult = await pool.query(menusQuery)
    const menus = menusResult.rows

    // 각 메뉴의 옵션 조회
    for (const menu of menus) {
      const optionsQuery = `
        SELECT id, name, price
        FROM options
        WHERE menu_id = $1
        ORDER BY id
      `
      const optionsResult = await pool.query(optionsQuery, [menu.id])
      menu.options = optionsResult.rows
    }

    res.json({
      success: true,
      data: menus
    })
  } catch (error) {
    console.error('메뉴 조회 오류:', error)
    res.status(500).json({
      success: false,
      error: '메뉴 조회 중 오류가 발생했습니다.'
    })
  }
})

// GET /api/menus/:id - 메뉴 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const menuQuery = `
      SELECT 
        id,
        name,
        description,
        price,
        image_url,
        stock
      FROM menus
      WHERE id = $1
    `
    
    const menuResult = await pool.query(menuQuery, [id])
    
    if (menuResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '메뉴를 찾을 수 없습니다.'
      })
    }

    const menu = menuResult.rows[0]

    // 옵션 조회
    const optionsQuery = `
      SELECT id, name, price
      FROM options
      WHERE menu_id = $1
      ORDER BY id
    `
    const optionsResult = await pool.query(optionsQuery, [id])
    menu.options = optionsResult.rows

    res.json({
      success: true,
      data: menu
    })
  } catch (error) {
    console.error('메뉴 상세 조회 오류:', error)
    res.status(500).json({
      success: false,
      error: '메뉴 조회 중 오류가 발생했습니다.'
    })
  }
})

// PUT /api/menus/:id/stock - 재고 수정
router.put('/:id/stock', async (req, res) => {
  try {
    const { id } = req.params
    const { change } = req.body

    if (typeof change !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'change는 숫자여야 합니다.'
      })
    }

    // 현재 재고 조회
    const currentQuery = 'SELECT id, name, stock FROM menus WHERE id = $1'
    const currentResult = await pool.query(currentQuery, [id])

    if (currentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '메뉴를 찾을 수 없습니다.'
      })
    }

    const currentStock = currentResult.rows[0].stock
    const newStock = currentStock + change

    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        error: '재고가 0 미만으로 내려갈 수 없습니다.'
      })
    }

    // 재고 업데이트
    const updateQuery = 'UPDATE menus SET stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, stock'
    const updateResult = await pool.query(updateQuery, [newStock, id])

    res.json({
      success: true,
      data: updateResult.rows[0]
    })
  } catch (error) {
    console.error('재고 수정 오류:', error)
    res.status(500).json({
      success: false,
      error: '재고 수정 중 오류가 발생했습니다.'
    })
  }
})

export default router
