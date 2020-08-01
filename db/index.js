const { Client } = require('pg')
const pool = new Client({
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
pool.connect()
module.exports = {
  query: (text, params) => pool.query(text, params),
}
