import pool from '../src/config/database.js'

// UI/public/images 폴더의 파일명에 맞춤 (menu-1.jpg ~ menu-3.jpg, menu-4.png ~ menu-6.png)
const menuData = [
  {
    name: '아메리카노(ICE)',
    description: '에스프레소에 물을 넣어 만든 시원한 아메리카노',
    price: 4000,
    stock: 10,
    image_url: '/images/menu-1.jpg',
    options: [
      { name: '샷 추가', price: 500 },
      { name: '시럽 추가', price: 0 }
    ]
  },
  {
    name: '아메리카노(HOT)',
    description: '에스프레소에 뜨거운 물을 넣어 만든 따뜻한 아메리카노',
    price: 4000,
    stock: 10,
    image_url: '/images/menu-2.jpg',
    options: [
      { name: '샷 추가', price: 500 },
      { name: '시럽 추가', price: 0 }
    ]
  },
  {
    name: '카페라떼',
    description: '에스프레소와 부드러운 우유가 만나 만든 라떼',
    price: 5000,
    stock: 10,
    image_url: '/images/menu-3.jpg',
    options: [
      { name: '샷 추가', price: 500 },
      { name: '시럽 추가', price: 0 },
      { name: '휘핑크림 추가', price: 500 }
    ]
  },
  {
    name: '카푸치노',
    description: '에스프레소와 우유 거품이 조화로운 카푸치노',
    price: 5000,
    stock: 10,
    image_url: '/images/menu-4.png',
    options: [
      { name: '샷 추가', price: 500 },
      { name: '시나몬 추가', price: 0 }
    ]
  },
  {
    name: '카라멜 마키아토',
    description: '카라멜 시럽과 에스프레소가 만난 달콤한 음료',
    price: 6000,
    stock: 10,
    image_url: '/images/menu-5.png',
    options: [
      { name: '샷 추가', price: 500 },
      { name: '카라멜 추가', price: 500 }
    ]
  },
  {
    name: '바닐라 라떼',
    description: '바닐라 시럽이 들어간 부드러운 라떼',
    price: 5500,
    stock: 10,
    image_url: '/images/menu-6.png',
    options: [
      { name: '샷 추가', price: 500 },
      { name: '시럽 추가', price: 0 }
    ]
  }
]

async function insertInitialData() {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    console.log('초기 데이터 삽입 시작...')

    // 기존 데이터 확인
    const checkResult = await client.query('SELECT COUNT(*) FROM menus')
    if (parseInt(checkResult.rows[0].count) > 0) {
      console.log('이미 데이터가 존재합니다. 스킵합니다.')
      await client.query('ROLLBACK')
      return
    }

    for (const menu of menuData) {
      // 메뉴 삽입 (image_url 포함 - UI/public/images와 매칭)
      const menuQuery = `
        INSERT INTO menus (name, description, price, stock, image_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `
      const menuResult = await client.query(menuQuery, [
        menu.name,
        menu.description,
        menu.price,
        menu.stock,
        menu.image_url || null
      ])
      const menuId = menuResult.rows[0].id

      // 옵션 삽입
      for (const option of menu.options) {
        const optionQuery = `
          INSERT INTO options (menu_id, name, price)
          VALUES ($1, $2, $3)
        `
        await client.query(optionQuery, [menuId, option.name, option.price])
      }

      console.log(`✅ ${menu.name} 메뉴 및 옵션 삽입 완료`)
    }

    await client.query('COMMIT')
    console.log('\n🎉 초기 데이터 삽입이 완료되었습니다!')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ 데이터 삽입 중 오류 발생:', error.message)
    console.error('상세 오류:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

insertInitialData()
  .then(() => {
    console.log('프로세스 종료')
    process.exit(0)
  })
  .catch((error) => {
    console.error('프로세스 종료 중 오류:', error)
    process.exit(1)
  })
