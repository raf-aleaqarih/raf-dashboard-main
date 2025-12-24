"use client"
import { useState, useEffect, Suspense } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'
import axios from 'axios'
import { Lock, KeyRound, Eye, EyeOff, Building2 } from 'lucide-react'
import Image from 'next/image'

export default function ResetPassword() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const [isLoading, setIsLoading] = useState(false)
  const [timer, setTimer] = useState(0)
  const [canResend, setCanResend] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setCanResend(true)
    }
  }, [timer])

  const formik = useFormik({
    initialValues: {
      code: '',
      newPassword: ''
    },
    validationSchema: Yup.object({
      code: Yup.string()
        .matches(/^[0-9]{6}$/, 'يجب إدخال 6 أرقام')
        .required('الرمز مطلوب'),
      newPassword: Yup.string()
        .min(6, 'يجب أن تكون كلمة المرور 6 أحرف على الأقل')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
          'يجب أن تحتوي كلمة المرور على حروف كبيرة وصغيرة وأرقام ورموز خاصة'
        )
        .required('كلمة المرور مطلوبة')
    }),
    onSubmit: async (values) => {
      setIsLoading(true)
      try {
        const response = await axios.post('https://raf-backend-main.vercel.app/auth/reset/', {
          verificationCode: values.code,
          newPassword: values.newPassword,
          email
        })
        toast.success('تم تغيير كلمة المرور بنجاح')
        router.push('/login')
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.error || 'حدث خطأ، يرجى المحاولة مرة أخرى')
        } else {
          toast.error('حدث خطأ في الاتصال بالخادم')
        }
      } finally {
        setIsLoading(false)
      }
    }
  })

  const handleResendCode = async () => {
    if (!canResend) return
    setIsLoading(true)
    try {
      await axios.post('https://raf-backend-main.vercel.app/auth/sendEmail', { email })
      setTimer(60)
      setCanResend(false)
      toast.success('تم إرسال الرمز مرة أخرى')
    } catch (error) {
      toast.error('فشل في إرسال الرمز')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShowPassword = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setShowPassword(!showPassword)
  }

  return (
    <main className="min-h-screen relative bg-[#1a1c23] flex items-center justify-center p-4 overflow-hidden">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-5" />
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-[#C48765]/20 to-[#34222E]/20 blur-3xl transform -skew-y-12" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#C48765]/10 to-transparent blur-3xl rounded-full" />
      <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-gradient-to-br from-[#34222E]/10 to-transparent blur-2xl rounded-full" />

      <div className="w-full max-w-md p-6 relative">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(196,135,101,0.15)] p-8 space-y-8 border border-white/20">
          <div className="text-center relative">

            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#34222E] to-[#C48765] bg-clip-text text-transparent">
              إعادة تعيين كلمة المرور
            </h2>
            <p className="mt-3 text-gray-600">
              أدخل الرمز المرسل إلى بريدك الإلكتروني
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#34222E] mb-1.5">
                  رمز التحقق
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    maxLength={6}
                    {...formik.getFieldProps('code')}
                    className={`
                      w-full px-4 py-3 pr-10 rounded-lg border bg-white/80 text-center tracking-widest
                      ${formik.touched.code && formik.errors.code
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:ring-[#C48765] focus:border-[#C48765]'}
                      transition-all duration-200 placeholder:text-gray-400
                      group-hover:border-[#C48765]/50 group-hover:bg-white
                    `}
                    placeholder="000000"
                    dir="ltr"
                  />
                  <KeyRound className="absolute top-3 right-3 h-5 w-5 text-gray-400 group-hover:text-[#C48765] transition-colors" />
                </div>
                {formik.touched.code && formik.errors.code && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
                    {formik.errors.code}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#34222E] mb-1.5">
                  كلمة المرور الجديدة
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...formik.getFieldProps('newPassword')}
                    className={`
                      w-full px-4 py-3 pr-10 rounded-lg border bg-white/80
                      ${formik.touched.newPassword && formik.errors.newPassword
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:ring-[#C48765] focus:border-[#C48765]'}
                      transition-all duration-200 placeholder:text-gray-400
                      group-hover:border-[#C48765]/50 group-hover:bg-white
                    `}
                    placeholder="••••••••"
                    dir="rtl"
                  />
                  <Lock className="absolute top-3 right-3 h-5 w-5 text-gray-400 group-hover:text-[#C48765] transition-colors" />
                  <button
                    type="button"
                    onClick={handleShowPassword}
                    className="absolute top-3 left-3 text-gray-400 hover:text-[#C48765] transition-colors focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {formik.touched.newPassword && formik.errors.newPassword && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
                    {formik.errors.newPassword}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full py-3.5 px-4 rounded-lg font-medium text-white
                bg-gradient-to-r from-[#C48765] to-[#E2A081] 
                hover:from-[#B37654] hover:to-[#D19070]
                focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-[#C48765]
                transition-all duration-300 transform hover:scale-[1.02]
                disabled:opacity-80 disabled:cursor-not-allowed
                shadow-lg shadow-[#C48765]/20
                relative overflow-hidden group
              `}
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-2" />
                  جاري المعالجة...
                </div>
              ) : (
                "تغيير كلمة المرور"
              )}
            </button>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={!canResend || isLoading}
              className={`
                w-full mt-4 py-2 px-4 rounded-lg font-medium
                text-[#C48765] bg-transparent border border-[#C48765]
                hover:bg-[#C48765]/5
                focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-[#C48765]
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              `}
            >
              {timer > 0 ? (
                <span>إعادة الإرسال في {timer} ثانية</span>
              ) : (
                <span>إعادة إرسال الرمز</span>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">شركة راف العقارية</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Building2 className="h-4 w-4" />
            <span>نظام إدارة الشركة</span>
          </div>
        </div>
      </div>
    </main>
  )
}
