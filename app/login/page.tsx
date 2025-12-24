"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import Image from 'next/image'
import toast, { Toaster } from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff, Building2 } from 'lucide-react'

export default function Login() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const emailInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('البريد الإلكتروني غير صحيح')
        .required('البريد الإلكتروني مطلوب'),
      password: Yup.string()
        .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل')
        .required('كلمة المرور مطلوبة')
    }),
    onSubmit: async (values) => {
      setIsLoading(true)
      try {
        const response = await fetch('https://raf-backend-main.vercel.app/auth/signIn', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        })

        const data = await response.json()

        if (response.ok) {
          document.cookie = `auth-token=${data.token}; path=/; secure; samesite=strict`
          localStorage.setItem('token', data.userUpdated.token)
          toast.success("تم تسجيل الدخول بنجاح!")
          router.push('/')
        } else {
          throw new Error(data.message || "فشل تسجيل الدخول")
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "حدث خطأ في تسجيل الدخول")
      } finally {
        setIsLoading(false)
      }
    }
  })

  const handleForgotPassword = async () => {
    if (!formik.values.email) {
      toast.error("يرجى إدخال البريد الإلكتروني أولاً")
      emailInputRef.current?.focus()
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('https://raf-backend-main.vercel.app/auth/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formik.values.email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('تم إرسال رابط إعادة تعيين كلمة المرور')
        router.push(`/reset-password?email=${encodeURIComponent(formik.values.email)}`)
      } else {
        if (data.message === 'User not found') {
          throw new Error('البريد الإلكتروني غير مسجل')
        } else if (data.message === 'Email already sent') {
          throw new Error('تم إرسال رابط إعادة تعيين كلمة المرور مسبقاً')
        } else {
          throw new Error(data.message || 'فشل في إرسال البريد الإلكتروني')
        }
      }
    } catch (error) {
      console.error('Password reset error:', error)
      toast.error(error instanceof Error ? error.message : 'فشل في إرسال البريد الإلكتروني')
      if (error instanceof Error && error.message === 'Failed to fetch') {
        toast.error('لا يمكن الوصول إلى الخادم')
      }
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
              مرحباً بك في راف العقارية
            </h2>
            <p className="mt-3 text-gray-600">
              قم بتسجيل الدخول للوصول إلى لوحة التحكم
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#34222E] mb-1.5">
                  البريد الإلكتروني
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    {...formik.getFieldProps('email')}
                    ref={emailInputRef}
                    className={`
                      w-full px-4 py-3 pr-10 rounded-lg border bg-white/80
                      ${formik.touched.email && formik.errors.email
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:ring-[#C48765] focus:border-[#C48765]'}
                      transition-all duration-200 placeholder:text-gray-400
                      group-hover:border-[#C48765]/50 group-hover:bg-white
                    `}
                    placeholder="example@domain.com"
                    dir="rtl"
                  />
                  <Mail className="absolute top-3 right-3 h-5 w-5 text-gray-400 group-hover:text-[#C48765] transition-colors" />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
                    {formik.errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#34222E] mb-1.5">
                  كلمة المرور
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...formik.getFieldProps('password')}
                    className={`
                      w-full px-4 py-3 pr-10 rounded-lg border bg-white/80
                      ${formik.touched.password && formik.errors.password
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
                {formik.touched.password && formik.errors.password && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
                    {formik.errors.password}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-medium text-[#C48765] hover:text-[#B37654] transition-colors focus:outline-none hover:underline"
              >
                نسيت كلمة المرور؟
              </button>
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
                  جاري تسجيل الدخول...
                </div>
              ) : (
                "تسجيل الدخول"
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
