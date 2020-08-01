const { Pool } = require('pg')
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
  // user: 'postgres',
  // host: 'localhost',
  // database: 'feriados',
  // password: '123456',
  // port: 5432,
})
module.exports = {
  query: (text, params) => pool.query(text, params),
}
