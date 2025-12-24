import mongoose, { Schema, Document } from 'mongoose';

export interface IUnitStatus extends Document {
  projectId: string;
  projectName: string;
  totalUnits: number; // إجمالي عدد العقارات في المشروع
  statuses: Array<{
    status: string; // مثل: متاح، مباع، محجوز...
    percentage: number; // النسبة المئوية (يدوية)
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const UnitStatusSchema = new Schema<IUnitStatus>({
  projectId: { type: String, required: true, unique: true },
  projectName: { type: String, required: true },
  totalUnits: { type: Number, required: true, min: 0, default: 0 },
  statuses: [
    {
      status: { type: String, required: true },
      percentage: { type: Number, required: true, min: 0, max: 100 },
    },
  ],
}, {
  timestamps: true,
});

export default mongoose.models.UnitStatus || mongoose.model<IUnitStatus>('UnitStatus', UnitStatusSchema); 