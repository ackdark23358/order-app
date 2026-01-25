import pool from '../src/config/database.js'

async function checkMenus() {
  const client = await pool.connect()
  
  try {
    console.log('='.repeat(60))
    console.log('메뉴 API 응답 확인')
    console.log('='.repeat(60))
    
    // 메뉴와 옵션을 함께 조회 (API와 동일한 쿼리)
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
    
    const menusResult = await client.query(menusQuery)
    const menus = menusResult.rows

    console.log(`\n총 메뉴 개수: ${menus.length}개\n`)

    // 각 메뉴의 옵션 조회
    for (const menu of menus) {
      const optionsQuery = `
        SELECT id, name, price
        FROM options
        WHERE menu_id = $1
        ORDER BY id
      `
      const optionsResult = await client.query(optionsQuery, [menu.id])
      menu.options = optionsResult.rows

      console.log(`ID: ${menu.id}`)
      console.log(`  이름: ${menu.name}`)
      console.log(`  가격: ${menu.price}원`)
      console.log(`  재고: ${menu.stock}개`)
      console.log(`  옵션 개수: ${menu.options.length}개`)
      if (menu.options.length > 0) {
        menu.options.forEach(opt => {
          console.log(`    - ${opt.name} (${opt.price}원)`)
        })
      }
      console.log('')
    }

    // 특정 메뉴 확인
    console.log('\n특정 메뉴 확인:')
    const specificMenus = ['카푸치노', '카라멜 마키아토', '바닐라 라떼']
    for (const menuName of specificMenus) {
      const menu = menus.find(m => m.name === menuName)
      if (menu) {
        console.log(`✅ ${menuName}: ID=${menu.id}, 재고=${menu.stock}개, 옵션=${menu.options.length}개`)
      } else {
        console.log(`❌ ${menuName}: 찾을 수 없음`)
      }
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('✅ 확인 완료')
    console.log('='.repeat(60))
    
  } catch (error) {
    console.error('❌ 확인 중 오류 발생:', error.message)
    console.error('상세 오류:', error)
  } finally {
    client.release()
    await pool.end()
  }
}

checkMenus()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('프로세스 종료 중 오류:', error)
    process.exit(1)
  })
