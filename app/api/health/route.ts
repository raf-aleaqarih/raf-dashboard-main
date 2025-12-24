import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    // التحقق من الاتصال بقاعدة البيانات
    let dbStatus = 'disconnected'
    try {
      await connectDB()
      dbStatus = 'connected'
    } catch (error) {
      console.error('Database connection failed:', error)
      dbStatus = 'error'
    }

    // معلومات البيئة
    const environment = {
      nodeEnv: process.env.NODE_ENV || 'development',
      mongodbUri: process.env.MONGODB_URI ? 'configured' : 'not-configured',
      apiBaseUrl: process.env.API_BASE_URL || 'not-configured',
    }

    return NextResponse.json({
      success: true,
      message: 'Health check completed',
      data: {
        timestamp: new Date().toISOString(),
        environment,
        database: {
          status: dbStatus,
        },
        server: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
        },
      },
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Health check failed',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
} 