import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/maintenance-requests'

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000, // زيادة مهلة الاتصال للإنتاج
      socketTimeoutMS: 45000,
      family: 4,
      // إضافة خيارات إضافية للاستقرار
      retryWrites: true,
      // إعدادات إضافية للإنتاج
      autoIndex: false, // تحسين الأداء
      maxIdleTimeMS: 30000,
      minPoolSize: 2,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('Connected to MongoDB successfully')
      return mongoose
    }).catch((error) => {
      console.error('MongoDB connection error:', error)
      cached.promise = null
      throw error
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error('Failed to connect to MongoDB:', e)
    throw e
  }

  return cached.conn
}

export default connectDB 