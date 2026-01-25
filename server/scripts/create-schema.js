import pool from '../src/config/database.js'

async function createDatabase() {
  const client = await pool.connect()
  
  try {
    console.log('데이터베이스 스키마 생성 시작...')
    
    // Menus 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS menus (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price INTEGER NOT NULL CHECK (price >= 0),
        image_url VARCHAR(500),
        stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Menus 테이블 생성 완료')
    
    // Options 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS options (
        id SERIAL PRIMARY KEY,
        menu_id INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        price INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Options 테이블 생성 완료')
    
    // Orders 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'preparing', 'completed')),
        total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Orders 테이블 생성 완료')
    
    // OrderItems 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        menu_id INTEGER NOT NULL REFERENCES menus(id),
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
        total_price INTEGER NOT NULL CHECK (total_price >= 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ OrderItems 테이블 생성 완료')
    
    // OrderItemOptions 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_item_options (
        id SERIAL PRIMARY KEY,
        order_item_id INTEGER NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
        option_id INTEGER NOT NULL REFERENCES options(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(order_item_id, option_id)
      )
    `)
    console.log('✅ OrderItemOptions 테이블 생성 완료')
    
    // 인덱스 생성
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date DESC)
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_options_menu_id ON options(menu_id)
    `)
    console.log('✅ 인덱스 생성 완료')
    
    console.log('\n🎉 데이터베이스 스키마 생성이 완료되었습니다!')
    
  } catch (error) {
    console.error('❌ 스키마 생성 중 오류 발생:', error.message)
    console.error('상세 오류:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

createDatabase()
  .then(() => {
    console.log('프로세스 종료')
    process.exit(0)
  })
  .catch((error) => {
    console.error('프로세스 종료 중 오류:', error)
    process.exit(1)
  })
