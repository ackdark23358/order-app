import express from 'express'
import pool from '../config/database.js'

const router = express.Router()

// POST /api/orders - 주문 생성
router.post('/', async (req, res) => {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')

    let { items, total_amount } = req.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        success: false,
        error: '주문 항목이 필요합니다.'
      })
    }

    // total_amount 검증 및 정수 변환 (프론트/JSON에서 숫자 보장)
    const totalAmount = typeof total_amount === 'number' ? Math.round(total_amount) : parseInt(total_amount, 10)
    if (Number.isNaN(totalAmount) || totalAmount < 0) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        success: false,
        error: '총 금액(total_amount)이 올바르지 않습니다.'
      })
    }

    // 각 항목 정규화: DB는 정수만 허용, option_ids는 정수 배열
    items = items.map(item => ({
      menu_id: parseInt(item.menu_id, 10),
      quantity: parseInt(item.quantity, 10) || 1,
      unit_price: parseInt(item.unit_price, 10) || 0,
      total_price: parseInt(item.total_price, 10) || 0,
      option_ids: Array.isArray(item.option_ids)
        ? item.option_ids.map(id => parseInt(id, 10)).filter(n => !Number.isNaN(n))
        : []
    }))

    const invalidItem = items.find(i => Number.isNaN(i.menu_id) || i.quantity < 1 || i.unit_price < 0 || i.total_price < 0)
    if (invalidItem) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        success: false,
        error: '주문 항목 형식이 올바르지 않습니다. (menu_id, quantity, unit_price, total_price 확인)'
      })
    }

    // 재고 확인 및 차감
    const stockIssues = []
    for (const item of items) {
      const stockQuery = 'SELECT id, name, stock FROM menus WHERE id = $1'
      const stockResult = await client.query(stockQuery, [item.menu_id])
      
      if (stockResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return res.status(400).json({
          success: false,
          error: `메뉴 ID ${item.menu_id}를 찾을 수 없습니다.`
        })
      }

      const menu = stockResult.rows[0]
      if (menu.stock < item.quantity) {
        stockIssues.push({
          menu_id: item.menu_id,
          menu_name: menu.name,
          requested_quantity: item.quantity,
          available_stock: menu.stock
        })
      }
    }

    if (stockIssues.length > 0) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        success: false,
        error: '재고가 부족합니다.',
        details: stockIssues
      })
    }

    // 주문 생성
    const orderQuery = `
      INSERT INTO orders (order_date, status, total_amount)
      VALUES (CURRENT_TIMESTAMP, 'received', $1)
      RETURNING id, order_date, status, total_amount
    `
    const orderResult = await client.query(orderQuery, [totalAmount])
    const order = orderResult.rows[0]

    // 주문 항목 및 옵션 저장
    const orderItems = []
    for (const item of items) {
      // 주문 항목 저장
      const itemQuery = `
        INSERT INTO order_items (order_id, menu_id, quantity, unit_price, total_price)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, menu_id, quantity, unit_price, total_price
      `
      const itemResult = await client.query(itemQuery, [
        order.id,
        item.menu_id,
        item.quantity,
        item.unit_price,
        item.total_price
      ])
      const orderItem = itemResult.rows[0]

      // 옵션 저장
      if (item.option_ids && item.option_ids.length > 0) {
        for (const optionId of item.option_ids) {
          await client.query(
            'INSERT INTO order_item_options (order_item_id, option_id) VALUES ($1, $2)',
            [orderItem.id, optionId]
          )
        }
      }

      // 재고 차감
      await client.query(
        'UPDATE menus SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [item.quantity, item.menu_id]
      )

      // 메뉴 이름 조회
      const menuQuery = 'SELECT name FROM menus WHERE id = $1'
      const menuResult = await client.query(menuQuery, [item.menu_id])
      orderItem.menu_name = menuResult.rows[0].name

      // 옵션 정보 조회
      if (item.option_ids && item.option_ids.length > 0) {
        const optionsQuery = `
          SELECT id, name, price
          FROM options
          WHERE id = ANY($1::int[])
        `
        const optionsResult = await client.query(optionsQuery, [item.option_ids])
        orderItem.options = optionsResult.rows
      } else {
        orderItem.options = []
      }

      orderItems.push(orderItem)
    }

    await client.query('COMMIT')

    res.json({
      success: true,
      data: {
        ...order,
        items: orderItems
      }
    })
  } catch (error) {
    try {
      await client.query('ROLLBACK')
    } catch (rollbackErr) {
      console.error('ROLLBACK 오류:', rollbackErr.message)
    }
    console.error('주문 생성 오류:', error.message)
    console.error('주문 생성 스택:', error.stack)
    res.status(500).json({
      success: false,
      error: '주문 생성 중 오류가 발생했습니다.'
    })
  } finally {
    client.release()
  }
})

// GET /api/orders - 주문 목록 조회
router.get('/', async (req, res) => {
  try {
    const { status, limit = 100, offset = 0 } = req.query

    let query = `
      SELECT 
        o.id,
        o.order_date,
        o.status,
        o.total_amount
      FROM orders o
    `
    const queryParams = []
    
    if (status) {
      query += ' WHERE o.status = $1'
      queryParams.push(status)
    }
    
    query += ' ORDER BY o.order_date DESC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2)
    queryParams.push(parseInt(limit), parseInt(offset))

    const ordersResult = await pool.query(query, queryParams)
    const orders = ordersResult.rows

    // 각 주문의 항목 조회
    for (const order of orders) {
      const itemsQuery = `
        SELECT 
          oi.id,
          oi.menu_id,
          oi.quantity,
          oi.unit_price,
          oi.total_price,
          m.name as menu_name
        FROM order_items oi
        JOIN menus m ON oi.menu_id = m.id
        WHERE oi.order_id = $1
      `
      const itemsResult = await pool.query(itemsQuery, [order.id])
      const items = itemsResult.rows

      // 각 항목의 옵션 조회
      for (const item of items) {
        const optionsQuery = `
          SELECT o.id, o.name, o.price
          FROM order_item_options oio
          JOIN options o ON oio.option_id = o.id
          WHERE oio.order_item_id = $1
        `
        const optionsResult = await pool.query(optionsQuery, [item.id])
        item.option_names = optionsResult.rows.map(opt => opt.name)
        item.options = optionsResult.rows
      }

      order.items = items.map(item => ({
        menu_name: item.menu_name,
        quantity: item.quantity,
        option_names: item.option_names,
        total_price: item.total_price
      }))
    }

    // 전체 개수 조회
    let countQuery = 'SELECT COUNT(*) FROM orders'
    if (status) {
      countQuery += ' WHERE status = $1'
    }
    const countResult = await pool.query(countQuery, status ? [status] : [])
    const total = parseInt(countResult.rows[0].count)

    res.json({
      success: true,
      data: orders,
      total
    })
  } catch (error) {
    console.error('주문 목록 조회 오류:', error)
    res.status(500).json({
      success: false,
      error: '주문 목록 조회 중 오류가 발생했습니다.'
    })
  }
})

// GET /api/orders/:id - 주문 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const orderQuery = `
      SELECT 
        id,
        order_date,
        status,
        total_amount
      FROM orders
      WHERE id = $1
    `
    const orderResult = await pool.query(orderQuery, [id])

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '주문을 찾을 수 없습니다.'
      })
    }

    const order = orderResult.rows[0]

    // 주문 항목 조회
    const itemsQuery = `
      SELECT 
        oi.id,
        oi.menu_id,
        oi.quantity,
        oi.unit_price,
        oi.total_price,
        m.name as menu_name
      FROM order_items oi
      JOIN menus m ON oi.menu_id = m.id
      WHERE oi.order_id = $1
    `
    const itemsResult = await pool.query(itemsQuery, [id])
    const items = itemsResult.rows

    // 각 항목의 옵션 조회
    for (const item of items) {
      const optionsQuery = `
        SELECT o.id, o.name, o.price
        FROM order_item_options oio
        JOIN options o ON oio.option_id = o.id
        WHERE oio.order_item_id = $1
      `
      const optionsResult = await pool.query(optionsQuery, [item.id])
      item.options = optionsResult.rows
      item.option_names = optionsResult.rows.map(opt => opt.name)
    }

    order.items = items

    res.json({
      success: true,
      data: order
    })
  } catch (error) {
    console.error('주문 상세 조회 오류:', error)
    res.status(500).json({
      success: false,
      error: '주문 조회 중 오류가 발생했습니다.'
    })
  }
})

// PUT /api/orders/:id/status - 주문 상태 변경
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['preparing', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 주문 상태입니다. (preparing 또는 completed만 가능)'
      })
    }

    const updateQuery = `
      UPDATE orders 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, status, updated_at
    `
    const updateResult = await pool.query(updateQuery, [status, id])

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '주문을 찾을 수 없습니다.'
      })
    }

    res.json({
      success: true,
      data: updateResult.rows[0]
    })
  } catch (error) {
    console.error('주문 상태 변경 오류:', error)
    res.status(500).json({
      success: false,
      error: '주문 상태 변경 중 오류가 발생했습니다.'
    })
  }
})

export default router
