import pg from 'pg'
const { Client } = pg
import dotenv from 'dotenv'

dotenv.config()

async function createDatabase() {
  // 기본 postgres 데이터베이스에 연결하여 새 데이터베이스 생성
  const adminClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // 기본 데이터베이스
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  })

  try {
    await adminClient.connect()
    console.log('PostgreSQL에 연결되었습니다.')

    const dbName = process.env.DB_NAME || 'coffee_order_db'
    
    // 데이터베이스 존재 여부 확인
    const checkResult = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    )

    if (checkResult.rows.length > 0) {
      console.log(`✅ 데이터베이스 '${dbName}'가 이미 존재합니다.`)
    } else {
      // 데이터베이스 생성
      await adminClient.query(`CREATE DATABASE ${dbName}`)
      console.log(`✅ 데이터베이스 '${dbName}' 생성 완료!`)
    }

    await adminClient.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ 데이터베이스 생성 실패:', error.message)
    console.error('상세 오류:', error)
    await adminClient.end()
    process.exit(1)
  }
}

createDatabase()
