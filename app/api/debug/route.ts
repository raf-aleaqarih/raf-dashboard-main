import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // معلومات البيئة (بدون كشف كلمات المرور)
    const environment = {
      nodeEnv: process.env.NODE_ENV || 'development',
      mongodbUri: process.env.MONGODB_URI ? 'configured' : 'not-configured',
      apiBaseUrl: process.env.API_BASE_URL || 'not-configured',
      // معلومات إضافية
      platform: process.platform,
      arch: process.arch,
      version: process.version,
    }

    // معلومات الطلب
    const requestInfo = {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
    }

    return NextResponse.json({
      success: true,
      message: 'Debug information',
      data: {
        timestamp: new Date().toISOString(),
        environment,
        request: requestInfo,
      },
    })
  } catch (error) {
    console.error('Debug endpoint failed:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Debug endpoint failed',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
} 