import pool from '../src/config/database.js'

async function testConnection() {
  try {
    const client = await pool.connect()
    console.log('✅ 데이터베이스 연결 성공!')
    
    const result = await client.query('SELECT NOW()')
    console.log('현재 시간:', result.rows[0].now)
    
    client.release()
    process.exit(0)
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error.message)
    console.error('상세 오류:', error)
    process.exit(1)
  }
}

testConnection()
