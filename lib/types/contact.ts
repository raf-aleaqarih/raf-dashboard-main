export interface ContactNumbers {
  unifiedPhone: string
  marketingPhone: string
  floatingPhone: string
  floatingWhatsapp: string
}

export interface ContactHistory {
  _id: string
  action: 'create' | 'update' | 'delete' | 'reset'
  oldData?: ContactNumbers
  newData?: ContactNumbers
  changedFields?: string[]
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

export interface ValidationErrors {
  unifiedPhone?: string
  marketingPhone?: string
  floatingPhone?: string
  floatingWhatsapp?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: ValidationErrors
}

export interface HistoryResponse {
  history: ContactHistory[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  stats: {
    total: number
    create?: number
    update?: number
    delete?: number
    reset?: number
  }
} 