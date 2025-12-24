import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import UnitStatus from '@/lib/models/UnitStatus';

// جلب جميع نسب الحالات لكل المشاريع
export async function GET(request: NextRequest) {
  await connectDB();
  const all = await UnitStatus.find({});
  return NextResponse.json({ success: true, data: all });
}

// إضافة أو تحديث نسب الحالات لمشروع
export async function POST(request: NextRequest) {
  await connectDB();
  const body = await request.json();
  const { projectId, projectName, statuses, totalUnits = 0 } = body;
  if (!projectId || !projectName || !Array.isArray(statuses)) {
    return NextResponse.json({ success: false, message: 'بيانات غير مكتملة' }, { status: 400 });
  }
  // إذا كان المشروع موجود حدثه، إذا لم يكن أضفه
  const updated = await UnitStatus.findOneAndUpdate(
    { projectId },
    { projectName, statuses, totalUnits },
    { upsert: true, new: true }
  );
  return NextResponse.json({ success: true, data: updated });
}

// تحديث النسب لمشروع محدد
export async function PUT(request: NextRequest) {
  await connectDB();
  const body = await request.json();
  const { projectId, statuses, totalUnits } = body;
  if (!projectId || !Array.isArray(statuses)) {
    return NextResponse.json({ success: false, message: 'بيانات غير مكتملة' }, { status: 400 });
  }
  
  // إعداد البيانات للتحديث
  const updateData: any = { statuses };
  if (totalUnits !== undefined) {
    updateData.totalUnits = totalUnits;
  }
  
  const updated = await UnitStatus.findOneAndUpdate(
    { projectId },
    updateData,
    { new: true }
  );
  return NextResponse.json({ success: true, data: updated });
}

// حذف سجل مشروع
export async function DELETE(request: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  if (!projectId) {
    return NextResponse.json({ success: false, message: 'projectId مطلوب' }, { status: 400 });
  }
  await UnitStatus.deleteOne({ projectId });
  return NextResponse.json({ success: true });
} 