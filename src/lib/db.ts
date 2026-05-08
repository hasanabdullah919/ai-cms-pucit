import postgres from 'postgres'

// Cache connection across serverless invocations (module-level singleton)
declare global {
  // eslint-disable-next-line no-var
  var _pgClient: ReturnType<typeof postgres> | undefined
}

function getClient() {
  if (!global._pgClient) {
    global._pgClient = postgres(process.env.DATABASE_URL!, {
      ssl: { rejectUnauthorized: false },
      max: 3,
      idle_timeout: 20,
      connect_timeout: 15,
      prepare: false,
      onnotice: () => {},
    })
  }
  return global._pgClient
}

const sql = getClient()

export default sql
