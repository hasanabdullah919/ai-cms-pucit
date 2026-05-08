import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  max: 1,           // Serverless: 1 connection per invocation
  idle_timeout: 20,
  connect_timeout: 30,
  prepare: false,   // Required for PgBouncer transaction pooler
  connection: {
    application_name: 'ai-cms-pucit',
  },
})

export default sql
