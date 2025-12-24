import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import ContactNumbers from '@/lib/models/ContactNumbers'
import ContactHistory from '@/lib/models/ContactHistory'

// إضافة timeout للدالة
const TIMEOUT_MS = 25000 // 25 ثانية

// Cache للبيانات
let contactCache: any = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 دقائق

// القيم الافتراضية
const defaultContactNumbers = {
  unifiedPhone: "920031103",
  marketingPhone: "0500000000",
  floatingPhone: "0500000000",
  floatingWhatsapp: "0500000000"
}

// دالة الحصول على الأرقام الحالية مع timeout و cache
async function getCurrentContactNumbers() {
  // التحقق من الـ cache
  const now = Date.now()
  if (contactCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return contactCache
  }
  
  try {
    console.log('Connecting to database for contact numbers...')
    await connectDB()
    console.log('Database connected, fetching contact data...')
    
    let contactData = await ContactNumbers.findOne().sort({ createdAt: -1 })
    console.log('Contact data found:', contactData ? 'yes' : 'no')
    
    if (!contactData) {
      console.log('No contact data found, creating default data...')
      // إنشاء بيانات افتراضية إذا لم تكن موجودة
      contactData = await ContactNumbers.create(defaultContactNumbers)
      console.log('Default contact data created successfully')
    }
    
    // تحديث الـ cache
    contactCache = contactData
    cacheTimestamp = now
    console.log('Contact data cached successfully')
    
    return contactData
  } catch (error) {
    console.error('Error in getCurrentContactNumbers:', error)
    throw error
  }
}

// دالة تسجيل التاريخ
async function logHistory(action: 'create' | 'update' | 'delete' | 'reset', oldData?: any, newData?: any, changedFields?: string[], request?: NextRequest) {
  try {
    const historyData: any = {
      action,
      oldData,
      newData,
      changedFields
    }

    // إضافة معلومات الطلب إذا كانت متوفرة
    if (request) {
      const forwarded = request.headers.get('x-forwarded-for')
      const realIp = request.headers.get('x-real-ip')
      const userAgent = request.headers.get('user-agent')
      
      historyData.ipAddress = forwarded || realIp || 'unknown'
      historyData.userAgent = userAgent
    }

    await ContactHistory.create(historyData)
  } catch (error) {
    console.error('Error logging history:', error)
  }
}

// دالة التحقق من صحة رقم الهاتف السعودي
const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return false
  
  // إزالة المسافات والرموز
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
  
  // التحقق من تنسيق رقم الهاتف السعودي
  const saudiPhoneRegex = /^(\+966|966|0)?[5][0-9]{8}$/
  const internationalRegex = /^\+966[5][0-9]{8}$/
  
  return saudiPhoneRegex.test(cleanPhone) || internationalRegex.test(cleanPhone)
}

// دالة التحقق من صحة الرقم الموحد
const validateUnifiedNumber = (number: string): boolean => {
  if (!number) return false
  
  // إزالة المسافات والرموز
  const cleanNumber = number.replace(/[\s\-\(\)]/g, '')
  
  // التحقق من تنسيق الرقم الموحد (9 أرقام)
  const unifiedRegex = /^[0-9]{9}$/
  
  return unifiedRegex.test(cleanNumber)
}

// دالة التحقق من صحة رقم التسويق (يبدأ بـ 05)
const validateMarketingNumber = (number: string): boolean => {
  if (!number) return false
  
  // إزالة المسافات والرموز
  const cleanNumber = number.replace(/[\s\-\(\)]/g, '')
  
  // التحقق من تنسيق رقم التسويق (يبدأ بـ 05)
  const marketingRegex = /^05[0-9]{8}$/
  
  return marketingRegex.test(cleanNumber)
}

// دالة تنظيف تنسيق رقم الهاتف
const formatPhoneNumber = (phone: string): string => {
  if (!phone) return ""
  
  // إزالة المسافات والرموز
  let cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
  
  // إضافة +966 إذا لم يكن موجوداً
  if (cleanPhone.startsWith('966')) {
    cleanPhone = '+' + cleanPhone
  } else if (cleanPhone.startsWith('0')) {
    cleanPhone = '+966' + cleanPhone.substring(1)
  } else if (!cleanPhone.startsWith('+')) {
    cleanPhone = '+966' + cleanPhone
  }
  
  // تنسيق الرقم مع مسافات
  if (cleanPhone.length === 13) { // +966XXXXXXXXX
    return `${cleanPhone.substring(0, 4)} ${cleanPhone.substring(4, 6)} ${cleanPhone.substring(6, 9)} ${cleanPhone.substring(9)}`
  }
  
  return cleanPhone
}

// دالة تنظيف تنسيق الرقم الموحد
const formatUnifiedNumber = (number: string): string => {
  if (!number) return ""
  
  // إزالة المسافات والرموز
  const cleanNumber = number.replace(/[\s\-\(\)]/g, '')
  
  // التأكد من أن الرقم 9 أرقام
  if (cleanNumber.length === 9) {
    return cleanNumber
  }
  
  return cleanNumber
}

// دالة تنظيف تنسيق رقم التسويق
const formatMarketingNumber = (number: string): string => {
  if (!number) return ""
  
  // إزالة المسافات والرموز
  const cleanNumber = number.replace(/[\s\-\(\)]/g, '')
  
  // التأكد من أن الرقم يبدأ بـ 05
  if (cleanNumber.startsWith('05') && cleanNumber.length === 10) {
    return cleanNumber
  }
  
  return cleanNumber
}

// GET - جلب الأرقام الحالية
export async function GET(request: NextRequest) {
  try {
    const contactData = await getCurrentContactNumbers()
    
    return NextResponse.json({
      success: true,
      message: 'تم جلب أرقام التواصل بنجاح',
      data: {
        unifiedPhone: contactData.unifiedPhone,
        marketingPhone: contactData.marketingPhone,
        floatingPhone: contactData.floatingPhone,
        floatingWhatsapp: contactData.floatingWhatsapp
      }
    })
  } catch (error) {
    console.error('Error fetching contact numbers:', error)
    
    // إرجاع بيانات افتراضية في حالة الخطأ
    return NextResponse.json({
      success: true,
      message: 'تم جلب أرقام التواصل بنجاح (بيانات افتراضية)',
      data: {
        unifiedPhone: defaultContactNumbers.unifiedPhone,
        marketingPhone: defaultContactNumbers.marketingPhone,
        floatingPhone: defaultContactNumbers.floatingPhone,
        floatingWhatsapp: defaultContactNumbers.floatingWhatsapp
      }
    })
  }
}

// POST - تحديث الأرقام
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    
    // الحصول على البيانات الحالية
    const currentData = await getCurrentContactNumbers()
    
    // التحقق من صحة البيانات
    const errors: string[] = []
    
    if (body.unifiedPhone && !validateUnifiedNumber(body.unifiedPhone)) {
      errors.push("الرقم الموحد يجب أن يكون 9 أرقام")
    }
    
    if (body.marketingPhone && !validateMarketingNumber(body.marketingPhone)) {
      errors.push("رقم التسويق الرئيسي يجب أن يبدأ بـ 05")
    }
    
    if (body.floatingPhone && !validateMarketingNumber(body.floatingPhone)) {
      errors.push("رقم الهاتف العائم يجب أن يبدأ بـ 05")
    }
    
    if (body.floatingWhatsapp && !validateMarketingNumber(body.floatingWhatsapp)) {
      errors.push("رقم الواتساب العائم يجب أن يبدأ بـ 05")
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'بيانات غير صحيحة',
          errors
        },
        { status: 400 }
      )
    }

    // تحديث الأرقام
    const updateData: any = {}
    const changedFields: string[] = []
    
    if (body.unifiedPhone && body.unifiedPhone !== currentData.unifiedPhone) {
      updateData.unifiedPhone = formatUnifiedNumber(body.unifiedPhone)
      changedFields.push('unifiedPhone')
    }
    
    if (body.marketingPhone && body.marketingPhone !== currentData.marketingPhone) {
      updateData.marketingPhone = formatMarketingNumber(body.marketingPhone)
      changedFields.push('marketingPhone')
    }
    
    if (body.floatingPhone && body.floatingPhone !== currentData.floatingPhone) {
      updateData.floatingPhone = formatMarketingNumber(body.floatingPhone)
      changedFields.push('floatingPhone')
    }
    
    if (body.floatingWhatsapp && body.floatingWhatsapp !== currentData.floatingWhatsapp) {
      updateData.floatingWhatsapp = formatMarketingNumber(body.floatingWhatsapp)
      changedFields.push('floatingWhatsapp')
    }

    if (Object.keys(updateData).length > 0) {
      // تحديث البيانات
      const updatedData = await ContactNumbers.findByIdAndUpdate(
        currentData._id,
        updateData,
        { new: true, runValidators: true }
      )

      // مسح الـ cache
      contactCache = null
      cacheTimestamp = 0

      // تسجيل التاريخ
      await logHistory(
        'update',
        {
          unifiedPhone: currentData.unifiedPhone,
          marketingPhone: currentData.marketingPhone,
          floatingPhone: currentData.floatingPhone,
          floatingWhatsapp: currentData.floatingWhatsapp
        },
        {
          unifiedPhone: updatedData.unifiedPhone,
          marketingPhone: updatedData.marketingPhone,
          floatingPhone: updatedData.floatingPhone,
          floatingWhatsapp: updatedData.floatingWhatsapp
        },
        changedFields,
        request
      )

      return NextResponse.json({
        success: true,
        message: 'تم تحديث أرقام التواصل بنجاح',
        data: {
          unifiedPhone: updatedData.unifiedPhone,
          marketingPhone: updatedData.marketingPhone,
          floatingPhone: updatedData.floatingPhone,
          floatingWhatsapp: updatedData.floatingWhatsapp
        }
      })
    } else {
      return NextResponse.json({
        success: true,
        message: 'لم يتم إجراء أي تغييرات',
        data: {
          unifiedPhone: currentData.unifiedPhone,
          marketingPhone: currentData.marketingPhone,
          floatingPhone: currentData.floatingPhone,
          floatingWhatsapp: currentData.floatingWhatsapp
        }
      })
    }
  } catch (error) {
    console.error('Error updating contact numbers:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطأ في تحديث أرقام التواصل'
      },
      { status: 500 }
    )
  }
}

// PUT - تحديث جميع الأرقام مرة واحدة
export async function PUT(request: NextRequest) {
  try {
    console.log('PUT request received for contact numbers update')
    
    // التحقق من نوع المحتوى
    const contentType = request.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      console.log('Invalid content type:', contentType)
      return NextResponse.json(
        { 
          success: false, 
          message: 'نوع المحتوى يجب أن يكون application/json'
        },
        { status: 400 }
      )
    }

    // محاولة قراءة البيانات
    let body
    try {
      body = await request.json()
      console.log('Request body parsed successfully:', body)
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return NextResponse.json(
        { 
          success: false, 
          message: 'بيانات الطلب غير صحيحة'
        },
        { status: 400 }
      )
    }
    
    // التحقق من وجود جميع الأرقام المطلوبة
    if (!body.unifiedPhone || !body.marketingPhone || !body.floatingPhone || !body.floatingWhatsapp) {
      console.log('Missing required fields:', {
        unifiedPhone: !!body.unifiedPhone,
        marketingPhone: !!body.marketingPhone,
        floatingPhone: !!body.floatingPhone,
        floatingWhatsapp: !!body.floatingWhatsapp
      })
      return NextResponse.json(
        { 
          success: false, 
          message: 'جميع الأرقام مطلوبة',
          missingFields: {
            unifiedPhone: !body.unifiedPhone,
            marketingPhone: !body.marketingPhone,
            floatingPhone: !body.floatingPhone,
            floatingWhatsapp: !body.floatingWhatsapp
          }
        },
        { status: 400 }
      )
    }

    // التحقق من صحة جميع الأرقام
    const errors: string[] = []
    
    if (!validateUnifiedNumber(body.unifiedPhone)) {
      errors.push("الرقم الموحد يجب أن يكون 9 أرقام")
    }
    
    if (!validateMarketingNumber(body.marketingPhone)) {
      errors.push("رقم التسويق الرئيسي يجب أن يبدأ بـ 05")
    }
    
    if (!validateMarketingNumber(body.floatingPhone)) {
      errors.push("رقم الهاتف العائم يجب أن يبدأ بـ 05")
    }
    
    if (!validateMarketingNumber(body.floatingWhatsapp)) {
      errors.push("رقم الواتساب العائم يجب أن يبدأ بـ 05")
    }

    if (errors.length > 0) {
      console.log('Validation errors:', errors)
      return NextResponse.json(
        { 
          success: false, 
          message: 'بيانات غير صحيحة',
          errors
        },
        { status: 400 }
      )
    }

    // الحصول على البيانات الحالية
    let currentData
    try {
      currentData = await getCurrentContactNumbers()
      console.log('Current data retrieved successfully')
    } catch (currentDataError) {
      console.error('Failed to get current data:', currentDataError)
      return NextResponse.json(
        { 
          success: false, 
          message: 'فشل في جلب البيانات الحالية',
          error: process.env.NODE_ENV === 'development' ? (currentDataError as Error).message : undefined
        },
        { status: 500 }
      )
    }
    
    if (!currentData || !currentData._id) {
      console.log('No current data found or missing _id')
      return NextResponse.json(
        { 
          success: false, 
          message: 'لم يتم العثور على بيانات التواصل'
        },
        { status: 404 }
      )
    }
    
    // تحديث جميع الأرقام
    const newData = {
      unifiedPhone: formatUnifiedNumber(body.unifiedPhone),
      marketingPhone: formatMarketingNumber(body.marketingPhone),
      floatingPhone: formatMarketingNumber(body.floatingPhone),
      floatingWhatsapp: formatMarketingNumber(body.floatingWhatsapp)
    }

    console.log('Updating data with:', newData)

    let updatedData
    try {
      updatedData = await ContactNumbers.findByIdAndUpdate(
        currentData._id,
        newData,
        { new: true, runValidators: true }
      )
      console.log('Data updated successfully')
    } catch (updateError) {
      console.error('Failed to update data:', updateError)
      return NextResponse.json(
        { 
          success: false, 
          message: 'فشل في تحديث البيانات',
          error: process.env.NODE_ENV === 'development' ? (updateError as Error).message : undefined
        },
        { status: 500 }
      )
    }

    if (!updatedData) {
      console.log('Update returned null data')
      return NextResponse.json(
        { 
          success: false, 
          message: 'فشل في تحديث البيانات'
        },
        { status: 500 }
      )
    }

    // تسجيل التاريخ
    try {
      await logHistory(
        'update',
        {
          unifiedPhone: currentData.unifiedPhone,
          marketingPhone: currentData.marketingPhone,
          floatingPhone: currentData.floatingPhone,
          floatingWhatsapp: currentData.floatingWhatsapp
        },
        {
          unifiedPhone: updatedData.unifiedPhone,
          marketingPhone: updatedData.marketingPhone,
          floatingPhone: updatedData.floatingPhone,
          floatingWhatsapp: updatedData.floatingWhatsapp
        },
        ['unifiedPhone', 'marketingPhone', 'floatingPhone', 'floatingWhatsapp'],
        request
      )
      console.log('History logged successfully')
    } catch (historyError) {
      console.error('Error logging history:', historyError)
      // لا نوقف العملية إذا فشل تسجيل التاريخ
    }

    console.log('Contact numbers update completed successfully')
    return NextResponse.json({
      success: true,
      message: 'تم تحديث جميع أرقام التواصل بنجاح',
      data: {
        unifiedPhone: updatedData.unifiedPhone,
        marketingPhone: updatedData.marketingPhone,
        floatingPhone: updatedData.floatingPhone,
        floatingWhatsapp: updatedData.floatingWhatsapp
      }
    })
  } catch (error) {
    console.error('Error updating all contact numbers:', error)
    
    // إرجاع رسالة خطأ أكثر تفصيلاً
    let errorMessage = 'خطأ في تحديث أرقام التواصل'
    
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage = 'انتهت مهلة الاتصال بقاعدة البيانات'
      } else if (error.message.includes('validation')) {
        errorMessage = 'بيانات غير صحيحة'
      } else if (error.message.includes('connection')) {
        errorMessage = 'مشكلة في الاتصال بقاعدة البيانات'
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'فشل في الاتصال بقاعدة البيانات'
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage = 'لا يمكن العثور على قاعدة البيانات'
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}

// DELETE - إعادة تعيين الأرقام للقيم الافتراضية
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    
    // الحصول على البيانات الحالية
    const currentData = await getCurrentContactNumbers()
    
    // إعادة تعيين للقيم الافتراضية
    const resetData = await ContactNumbers.findByIdAndUpdate(
      currentData._id,
      defaultContactNumbers,
      { new: true, runValidators: true }
    )

    // تسجيل التاريخ
    await logHistory(
      'reset',
      {
        unifiedPhone: currentData.unifiedPhone,
        marketingPhone: currentData.marketingPhone,
        floatingPhone: currentData.floatingPhone,
        floatingWhatsapp: currentData.floatingWhatsapp
      },
      {
        unifiedPhone: resetData.unifiedPhone,
        marketingPhone: resetData.marketingPhone,
        floatingPhone: resetData.floatingPhone,
        floatingWhatsapp: resetData.floatingWhatsapp
      },
      ['unifiedPhone', 'marketingPhone', 'floatingPhone', 'floatingWhatsapp'],
      request
    )

    return NextResponse.json({
      success: true,
      message: 'تم إعادة تعيين أرقام التواصل بنجاح',
      data: {
        unifiedPhone: resetData.unifiedPhone,
        marketingPhone: resetData.marketingPhone,
        floatingPhone: resetData.floatingPhone,
        floatingWhatsapp: resetData.floatingWhatsapp
      }
    })
  } catch (error) {
    console.error('Error resetting contact numbers:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطأ في إعادة تعيين أرقام التواصل'
      },
      { status: 500 }
    )
  }
} 