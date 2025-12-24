import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import UnitStatus from '@/lib/models/UnitStatus';

// تنظيف البيانات القديمة - حذف حالات المؤجر والمتاح للإيجار
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // الحالات المسموحة فقط
    const allowedStatuses = ["متاح للبيع", "مباع", "محجوز", "غير متاح"];
    
    // جلب جميع السجلات
    const allRecords = await UnitStatus.find({});
    
    let updatedCount = 0;
    
    // تنظيف كل سجل
    for (const record of allRecords) {
      // تصفية الحالات المسموحة فقط
      const filteredStatuses = record.statuses.filter((status: any) => 
        allowedStatuses.includes(status.status)
      );
      
      // إذا كان هناك تغيير، احفظ السجل
      if (filteredStatuses.length !== record.statuses.length) {
        record.statuses = filteredStatuses;
        await record.save();
        updatedCount++;
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `تم تنظيف ${updatedCount} مشروع من الحالات القديمة`,
      updatedCount 
    });
    
  } catch (error) {
    console.error('خطأ في تنظيف البيانات:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'حدث خطأ أثناء تنظيف البيانات' 
    }, { status: 500 });
  }
}
