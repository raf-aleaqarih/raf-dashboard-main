import mongoose, { Schema, Document } from 'mongoose'

export interface IContactNumbers extends Document {
  unifiedPhone: string
  marketingPhone: string
  floatingPhone: string
  floatingWhatsapp: string
  createdAt: Date
  updatedAt: Date
}

const ContactNumbersSchema = new Schema<IContactNumbers>({
  unifiedPhone: {
    type: String,
    required: [true, 'الرقم الموحد مطلوب'],
    validate: {
      validator: function(v: string) {
        const cleanNumber = v.replace(/[\s\-\(\)]/g, '')
        return /^[0-9]{9}$/.test(cleanNumber)
      },
      message: 'الرقم الموحد يجب أن يكون 9 أرقام'
    }
  },
  marketingPhone: {
    type: String,
    required: [true, 'رقم التسويق الرئيسي مطلوب'],
    validate: {
      validator: function(v: string) {
        const cleanNumber = v.replace(/[\s\-\(\)]/g, '')
        return /^05[0-9]{8}$/.test(cleanNumber)
      },
      message: 'رقم التسويق يجب أن يبدأ بـ 05'
    }
  },
  floatingPhone: {
    type: String,
    required: [true, 'رقم الهاتف العائم مطلوب'],
    validate: {
      validator: function(v: string) {
        const cleanNumber = v.replace(/[\s\-\(\)]/g, '')
        return /^05[0-9]{8}$/.test(cleanNumber)
      },
      message: 'رقم الهاتف العائم يجب أن يبدأ بـ 05'
    }
  },
  floatingWhatsapp: {
    type: String,
    required: [true, 'رقم الواتساب العائم مطلوب'],
    validate: {
      validator: function(v: string) {
        const cleanNumber = v.replace(/[\s\-\(\)]/g, '')
        return /^05[0-9]{8}$/.test(cleanNumber)
      },
      message: 'رقم الواتساب العائم يجب أن يبدأ بـ 05'
    }
  }
}, {
  timestamps: true
})

// التحقق من وجود النموذج قبل إنشائه
export default mongoose.models.ContactNumbers || mongoose.model<IContactNumbers>('ContactNumbers', ContactNumbersSchema) 