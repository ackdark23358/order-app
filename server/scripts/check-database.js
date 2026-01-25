import pool from '../src/config/database.js'

async function checkDatabase() {
  const client = await pool.connect()
  
  try {
    console.log('='.repeat(60))
    console.log('데이터베이스 상태 확인')
    console.log('='.repeat(60))
    
    // 1. 메뉴 확인
    console.log('\n📋 메뉴 목록:')
    const menusResult = await client.query('SELECT id, name, price, stock FROM menus ORDER BY id')
    if (menusResult.rows.length === 0) {
      console.log('  ❌ 메뉴 데이터가 없습니다.')
    } else {
      menusResult.rows.forEach(menu => {
        console.log(`  - ID: ${menu.id}, 이름: ${menu.name}, 가격: ${menu.price}원, 재고: ${menu.stock}개`)
      })
    }
    
    // 2. 옵션 확인
    console.log('\n⚙️ 옵션 목록:')
    const optionsResult = await client.query(`
      SELECT o.id, o.menu_id, m.name as menu_name, o.name, o.price 
      FROM options o
      JOIN menus m ON o.menu_id = m.id
      ORDER BY o.menu_id, o.id
    `)
    if (optionsResult.rows.length === 0) {
      console.log('  ❌ 옵션 데이터가 없습니다.')
    } else {
      optionsResult.rows.forEach(option => {
        console.log(`  - 메뉴: ${option.menu_name}, 옵션: ${option.name}, 가격: ${option.price}원`)
      })
    }
    
    // 3. 주문 확인
    console.log('\n📦 주문 목록:')
    const ordersResult = await client.query(`
      SELECT id, order_date, status, total_amount 
      FROM orders 
      ORDER BY order_date DESC
    `)
    if (ordersResult.rows.length === 0) {
      console.log('  ❌ 주문 데이터가 없습니다.')
    } else {
      ordersResult.rows.forEach(order => {
        const date = new Date(order.order_date)
        const dateStr = `${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
        console.log(`  - 주문 ID: ${order.id}, 날짜: ${dateStr}, 상태: ${order.status}, 총액: ${order.total_amount}원`)
      })
    }
    
    // 4. 주문 항목 확인
    console.log('\n🛒 주문 항목 상세:')
    const orderItemsResult = await client.query(`
      SELECT 
        oi.id,
        oi.order_id,
        oi.menu_id,
        m.name as menu_name,
        oi.quantity,
        oi.unit_price,
        oi.total_price
      FROM order_items oi
      JOIN menus m ON oi.menu_id = m.id
      ORDER BY oi.order_id, oi.id
    `)
    if (orderItemsResult.rows.length === 0) {
      console.log('  ❌ 주문 항목 데이터가 없습니다.')
    } else {
      orderItemsResult.rows.forEach(item => {
        console.log(`  - 주문 ID: ${item.order_id}, 메뉴: ${item.menu_name}, 수량: ${item.quantity}, 단가: ${item.unit_price}원, 총액: ${item.total_price}원`)
      })
    }
    
    // 5. 주문 항목 옵션 확인
    console.log('\n🔧 주문 항목 옵션:')
    const orderItemOptionsResult = await client.query(`
      SELECT 
        oio.order_item_id,
        oio.option_id,
        o.name as option_name
      FROM order_item_options oio
      JOIN options o ON oio.option_id = o.id
      ORDER BY oio.order_item_id
    `)
    if (orderItemOptionsResult.rows.length === 0) {
      console.log('  ❌ 주문 항목 옵션 데이터가 없습니다.')
    } else {
      orderItemOptionsResult.rows.forEach(opt => {
        console.log(`  - 주문 항목 ID: ${opt.order_item_id}, 옵션: ${opt.option_name}`)
      })
    }
    
    // 6. 통계 확인
    console.log('\n📊 주문 통계:')
    const statsResult = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'received') as received,
        COUNT(*) FILTER (WHERE status = 'preparing') as preparing,
        COUNT(*) FILTER (WHERE status = 'completed') as completed
      FROM orders
    `)
    const stats = statsResult.rows[0]
    console.log(`  - 총 주문: ${stats.total}개`)
    console.log(`  - 주문 접수: ${stats.received}개`)
    console.log(`  - 제조 중: ${stats.preparing}개`)
    console.log(`  - 제조 완료: ${stats.completed}개`)
    
    // 7. 재고 현황 요약
    console.log('\n📦 재고 현황 요약:')
    const stockSummary = await client.query(`
      SELECT 
        name,
        stock,
        CASE 
          WHEN stock = 0 THEN '품절'
          WHEN stock <= 5 THEN '주의'
          ELSE '정상'
        END as status
      FROM menus
      ORDER BY id
    `)
    stockSummary.rows.forEach(item => {
      const statusColor = item.status === '품절' ? '🔴' : item.status === '주의' ? '🟠' : '🟢'
      console.log(`  ${statusColor} ${item.name}: ${item.stock}개 (${item.status})`)
    })
    
    console.log('\n' + '='.repeat(60))
    console.log('✅ 데이터베이스 확인 완료')
    console.log('='.repeat(60))
    
  } catch (error) {
    console.error('❌ 데이터베이스 확인 중 오류 발생:', error.message)
    console.error('상세 오류:', error)
  } finally {
    client.release()
    await pool.end()
  }
}

checkDatabase()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('프로세스 종료 중 오류:', error)
    process.exit(1)
  })
