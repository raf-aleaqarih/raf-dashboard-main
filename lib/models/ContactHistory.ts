import mongoose, { Schema, Document } from 'mongoose'

export interface IContactHistory extends Document {
  action: 'create' | 'update' | 'delete' | 'reset'
  oldData?: {
    unifiedPhone?: string
    marketingPhone?: string
    floatingPhone?: string
    floatingWhatsapp?: string
  }
  newData?: {
    unifiedPhone?: string
    marketingPhone?: string
    floatingPhone?: string
    floatingWhatsapp?: string
  }
  changedFields?: string[]
  userId?: string
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

const ContactHistorySchema = new Schema<IContactHistory>({
  action: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete', 'reset']
  },
  oldData: {
    unifiedPhone: String,
    marketingPhone: String,
    floatingPhone: String,
    floatingWhatsapp: String
  },
  newData: {
    unifiedPhone: String,
    marketingPhone: String,
    floatingPhone: String,
    floatingWhatsapp: String
  },
  changedFields: [String],
  userId: String,
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
})

// التحقق من وجود النموذج قبل إنشائه
export default mongoose.models.ContactHistory || mongoose.model<IContactHistory>('ContactHistory', ContactHistorySchema) 