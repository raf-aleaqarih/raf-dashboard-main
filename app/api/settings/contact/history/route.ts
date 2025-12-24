import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import ContactHistory from '@/lib/models/ContactHistory'

// GET - جلب تاريخ التغييرات
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const action = searchParams.get('action')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    // بناء query للفلترة
    const query: any = {}
    
    if (action) {
      query.action = action
    }
    
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) {
        query.createdAt.$gte = new Date(startDate)
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate)
      }
    }
    
    // حساب skip للصفحات
    const skip = (page - 1) * limit
    
    // جلب التاريخ مع الفلترة
    const history = await ContactHistory.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
    
    // حساب العدد الإجمالي
    const total = await ContactHistory.countDocuments(query)
    
    // حساب إحصائيات سريعة
    const stats = await ContactHistory.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      }
    ])
    
    // تحويل الإحصائيات إلى object
    const actionStats = stats.reduce((acc: any, stat) => {
      acc[stat._id] = stat.count
      return acc
    }, {})
    
    return NextResponse.json({
      success: true,
      message: 'تم جلب تاريخ التغييرات بنجاح',
      data: {
        history,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        },
        stats: {
          total,
          ...actionStats
        }
      }
    })
  } catch (error) {
    console.error('Error fetching contact history:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطأ في جلب تاريخ التغييرات'
      },
      { status: 500 }
    )
  }
}

// DELETE - حذف سجل تاريخ محدد
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'معرف السجل مطلوب'
        },
        { status: 400 }
      )
    }
    
    const deletedRecord = await ContactHistory.findByIdAndDelete(id)
    
    if (!deletedRecord) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'السجل غير موجود'
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'تم حذف السجل بنجاح'
    })
  } catch (error) {
    console.error('Error deleting history record:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطأ في حذف السجل'
      },
      { status: 500 }
    )
  }
} 