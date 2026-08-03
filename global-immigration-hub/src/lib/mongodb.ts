import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!
const MONGODB_DB = process.env.MONGODB_DB ?? 'global_immigration_hub'

if (!MONGODB_URI) throw new Error('MONGODB_URI is not defined in environment variables')

// Extend global type to cache connection across hot-reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var mongooseConn: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  } | undefined
}

let cached = global.mongooseConn

if (!cached) {
  cached = global.mongooseConn = { conn: null, promise: null }
}

export async function connectDB() {
  if (cached!.conn) return cached!.conn

  if (!cached!.promise) {
    cached!.promise = mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB,
      bufferCommands: false,
    })
  }

  cached!.conn = await cached!.promise
  return cached!.conn
}

// Raw MongoClient for NextAuth adapter
import { MongoClient } from 'mongodb'

declare global {
  // eslint-disable-next-line no-var
  var mongoClient: Promise<MongoClient> | undefined
}

const mongoClientOptions = {}

let clientPromise: Promise<MongoClient>

// Cache across both dev hot-reloads and production module re-evaluations
if (!global.mongoClient) {
  global.mongoClient = new MongoClient(MONGODB_URI, mongoClientOptions).connect()
}
clientPromise = global.mongoClient

export { clientPromise }
