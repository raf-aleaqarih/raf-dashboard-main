'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'react-hot-toast'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ContactNumbers, ValidationErrors } from '@/lib/types/contact'

export default function SettingsPage() {
  const [contactNumbers, setContactNumbers] = useState<ContactNumbers>({
    unifiedPhone: '',
    marketingPhone: '',
    floatingPhone: '',
    floatingWhatsapp: ''
  })
  
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)

  // جلب الأرقام الحالية
  useEffect(() => {
    fetchContactNumbers()
  }, [])

  const fetchContactNumbers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings/contact')
      const data = await response.json()
      
      if (data.success) {
        setContactNumbers(data.data)
      } else {
        toast.error('خطأ في جلب أرقام التواصل')
      }
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setIsLoading(false)
    }
  }

  // التحقق من صحة رقم الهاتف السعودي
  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone) return false
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
    const saudiPhoneRegex = /^(\+966|966|0)?[5][0-9]{8}$/
    const internationalRegex = /^\+966[5][0-9]{8}$/
    return saudiPhoneRegex.test(cleanPhone) || internationalRegex.test(cleanPhone)
  }

  // التحقق من صحة الرقم الموحد
  const validateUnifiedNumber = (number: string): boolean => {
    if (!number) return false
    const cleanNumber = number.replace(/[\s\-\(\)]/g, '')
    const unifiedRegex = /^[0-9]{9}$/
    return unifiedRegex.test(cleanNumber)
  }

  // التحقق من صحة رقم التسويق (يبدأ بـ 05)
  const validateMarketingNumber = (number: string): boolean => {
    if (!number) return false
    const cleanNumber = number.replace(/[\s\-\(\)]/g, '')
    const marketingRegex = /^05[0-9]{8}$/
    return marketingRegex.test(cleanNumber)
  }

  // التحقق من صحة النموذج
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!contactNumbers.unifiedPhone) {
      newErrors.unifiedPhone = 'الرقم الموحد مطلوب'
    } else if (!validateUnifiedNumber(contactNumbers.unifiedPhone)) {
      newErrors.unifiedPhone = 'الرقم الموحد يجب أن يكون 9 أرقام'
    }

    if (!contactNumbers.marketingPhone) {
      newErrors.marketingPhone = 'رقم التسويق الرئيسي مطلوب'
    } else if (!validateMarketingNumber(contactNumbers.marketingPhone)) {
      newErrors.marketingPhone = 'رقم التسويق يجب أن يبدأ بـ 05'
    }

    if (!contactNumbers.floatingPhone) {
      newErrors.floatingPhone = 'رقم الهاتف العائم مطلوب'
    } else if (!validateMarketingNumber(contactNumbers.floatingPhone)) {
      newErrors.floatingPhone = 'رقم الهاتف العائم يجب أن يبدأ بـ 05'
    }

    if (!contactNumbers.floatingWhatsapp) {
      newErrors.floatingWhatsapp = 'رقم الواتساب العائم مطلوب'
    } else if (!validateMarketingNumber(contactNumbers.floatingWhatsapp)) {
      newErrors.floatingWhatsapp = 'رقم الواتساب العائم يجب أن يبدأ بـ 05'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // معالج تغيير الحقول
  const handleInputChange = (field: keyof ContactNumbers, value: string) => {
    setContactNumbers(prev => ({
      ...prev,
      [field]: value
    }))

    // التحقق من صحة الحقل المحدث
    if (errors[field]) {
      let isValid = false
      
      if (field === 'unifiedPhone') {
        isValid = validateUnifiedNumber(value)
      } else if (field === 'marketingPhone' || field === 'floatingPhone' || field === 'floatingWhatsapp') {
        isValid = validateMarketingNumber(value)
      }
      
      if (isValid) {
        setErrors(prev => ({
          ...prev,
          [field]: undefined
        }))
      }
    }
  }

  // حفظ الأرقام
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('يرجى تصحيح الأخطاء قبل الحفظ')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/settings/contact', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactNumbers)
      })

      const data = await response.json()

      if (data.success) {
        toast.success('تم حفظ أرقام التواصل بنجاح')
        setErrors({})
        // تحديث الحقول بالقيم المحفوظة
        setContactNumbers(data.data)
      } else {
        toast.error(data.message || 'خطأ في حفظ الأرقام')
        if (data.errors) {
          setErrors(data.errors)
        }
      }
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setIsSaving(false)
    }
  }

  // إعادة تعيين الأرقام
  const handleReset = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/settings/contact', {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setContactNumbers(data.data)
        setErrors({})
        toast.success('تم إعادة تعيين الأرقام بنجاح')
        setShowResetDialog(false)
      } else {
        toast.error(data.message || 'خطأ في إعادة التعيين')
      }
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex items-center justify-center flex-1">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>جاري تحميل الإعدادات...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">إعدادات التواصل</h1>
              <p className="text-gray-600">إدارة أرقام التواصل المستخدمة في الموقع</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PhoneIcon className="h-5 w-5" />
                  أرقام التواصل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* الرقم الموحد */}
                <div className="space-y-2">
                  <Label htmlFor="unifiedPhone">الرقم الموحد</Label>
                  <Input
                    id="unifiedPhone"
                    type="tel"
                    placeholder="920031103"
                    value={contactNumbers.unifiedPhone}
                    onChange={(e) => handleInputChange('unifiedPhone', e.target.value)}
                    className={errors.unifiedPhone ? 'border-red-500' : ''}
                  />
                  {errors.unifiedPhone && (
                    <p className="text-sm text-red-500">{errors.unifiedPhone}</p>
                  )}
                  <p className="text-xs text-gray-500">مثال: 920031103 (9 أرقام)</p>
                </div>

                {/* رقم التسويق الرئيسي */}
                <div className="space-y-2">
                  <Label htmlFor="marketingPhone">رقم التسويق الرئيسي (في الفوتر)</Label>
                  <Input
                    id="marketingPhone"
                    type="tel"
                    placeholder="05XXXXXXXX"
                    value={contactNumbers.marketingPhone}
                    onChange={(e) => handleInputChange('marketingPhone', e.target.value)}
                    className={errors.marketingPhone ? 'border-red-500' : ''}
                  />
                  {errors.marketingPhone && (
                    <p className="text-sm text-red-500">{errors.marketingPhone}</p>
                  )}
                  <p className="text-xs text-gray-500">مثال: 05XXXXXXXX (يبدأ بـ 05)</p>
                </div>

                <Separator />

                {/* الأرقام العائمة */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">الأرقام العائمة</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="floatingPhone">رقم الهاتف العائم</Label>
                    <Input
                      id="floatingPhone"
                      type="tel"
                      placeholder="05XXXXXXXX"
                      value={contactNumbers.floatingPhone}
                      onChange={(e) => handleInputChange('floatingPhone', e.target.value)}
                      className={errors.floatingPhone ? 'border-red-500' : ''}
                    />
                    {errors.floatingPhone && (
                      <p className="text-sm text-red-500">{errors.floatingPhone}</p>
                    )}
                    <p className="text-xs text-gray-500">مثال: 05XXXXXXXX (يبدأ بـ 05)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="floatingWhatsapp">رقم الواتساب العائم</Label>
                    <Input
                      id="floatingWhatsapp"
                      type="tel"
                      placeholder="05XXXXXXXX"
                      value={contactNumbers.floatingWhatsapp}
                      onChange={(e) => handleInputChange('floatingWhatsapp', e.target.value)}
                      className={errors.floatingWhatsapp ? 'border-red-500' : ''}
                    />
                    {errors.floatingWhatsapp && (
                      <p className="text-sm text-red-500">{errors.floatingWhatsapp}</p>
                    )}
                    <p className="text-xs text-gray-500">مثال: 05XXXXXXXX (يبدأ بـ 05)</p>
                  </div>
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving || Object.keys(errors).length > 0}
                    className="flex-1"
                  >
                    {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setShowResetDialog(true)}
                    disabled={isSaving}
                  >
                    إعادة تعيين
                  </Button>
                </div>

                {/* رابط صفحة التاريخ */}
                <div className="pt-4 border-t">
                  <Button 
                    variant="ghost" 
                    onClick={() => window.location.href = '/settings/history'}
                    className="w-full"
                  >
                    عرض تاريخ التغييرات
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialog إعادة التعيين */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد إعادة التعيين</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من إعادة تعيين جميع أرقام التواصل للقيم الافتراضية؟ 
              هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} disabled={isSaving}>
              {isSaving ? 'جاري الإعادة...' : 'تأكيد'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// أيقونة الهاتف
function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  )
} 