import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL!

const sql = postgres(connectionString, {
  ssl: { rejectUnauthorized: false },
  max: 1,
  idle_timeout: 10,
  connect_timeout: 10,
  prepare: false,
  onnotice: () => {},
})

export default sql
