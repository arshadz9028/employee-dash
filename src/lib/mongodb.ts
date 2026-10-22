import mongoose from 'mongoose'

type MongooseCache = {
  connection: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

const globalForMongoose = globalThis as typeof globalThis & { mongooseCache?: MongooseCache }
const cache = globalForMongoose.mongooseCache ?? { connection: null, promise: null }
globalForMongoose.mongooseCache = cache

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is not configured.')
  }

  if (cache.connection) return cache.connection

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri).catch((error: unknown) => {
      cache.promise = null
      throw error
    })
  }

  cache.connection = await cache.promise
  return cache.connection
}