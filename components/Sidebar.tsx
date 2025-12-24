"use client"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, Building, FileQuestion, Star, BookOpen,
  Send, TimerIcon, Users, Shield, LogOut, X, ChevronDown,
  Newspaper, Settings
} from "lucide-react"
import { useSidebar } from "./SidebarProvider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const menuItems = [
  { name: "الرئيسية", icon: LayoutDashboard, href: "/" },
  { name: "إدارة العقارات", icon: Building, href: "/category" },

  { name: "المشاريع والوحدات", icon: Building, href: "/projects-units" },
  { name: "حالات الوحدات السكنية", icon: Building, href: "/unit-status" },
  { name: "الأسئلة الشائعة", icon: FileQuestion, href: "/faq" },
  { name: "تقييمات العملاء", icon: Star, href: "/reviews" },
  { name: "المدونة", icon: BookOpen, href: "/blog" },
  { name: "المشتركين", icon: Newspaper, href: "/subscribers" },
  { name: "طلبات العملاء", icon: Send, href: "/intersted" },
  { name: "مواعيد الاستشارات", icon: TimerIcon, href: "/consultation" },
]

const userManagementItems = [
  { name: "الصلاحيات", icon: Shield, href: "/roles" },
  { name: "إدارة المستخدمين", icon: Users, href: "/users" },
  { name: "الإعدادات", icon: Settings, href: "/users/settings" },
  { name: " مستخدمين الموقع", icon: Users, href: "/website-user" },
  { name: "إعدادات التواصل", icon: Settings, href: "/settings" },
]


export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isOpen, toggle } = useSidebar()
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch("https://raf-backend-main.vercel.app/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ token }),
      })

      if (response.ok) {
        localStorage.removeItem("token")
        document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        router.push("/login")
      }
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  return (
    <>
      <aside className={`
        fixed top-0 right-0 h-full w-80
        bg-gradient-to-b from-[#34222E] to-[#34222E]/95
        text-[#EFEDEA] shadow-2xl
        transition-all duration-300 ease-out z-50
        ${isOpen ? "translate-x-0" : "translate-x-full"}
        font-arabic
      `}>
        <div className="flex flex-col h-full">
          <div className="p-8 border-b border-[#EFEDEA]/10 bg-[#34222E]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Image
                    src="/logo.jpg"
                    alt="RAF Logo"
                    width={50}
                    height={50}
                    className="rounded-xl shadow-lg ring-2 ring-[#C48765]/20"
                  />
                  <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-[#C48765] rounded-full"></div>
                </div>
                <span className="text-2xl font-bold tracking-wider text-[#EFEDEA]">RAF</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggle}
                className="text-[#EFEDEA] hover:bg-[#C48765] transition-all rounded-lg"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-4 px-5 py-3.5 rounded-xl
                      transition-all duration-200 group
                      ${pathname === item.href
                        ? "bg-[#C48765] text-[#EFEDEA] shadow-lg"
                        : "text-[#EFEDEA]/80 hover:bg-[#C48765]/10 hover:text-[#EFEDEA]"}
                    `}
                  >
                    <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${pathname === item.href ? "text-[#EFEDEA]" : "text-[#C48765]"
                      }`} />
                    <span className="font-medium text-[15px]">{item.name}</span>
                  </Link>
                </li>
              ))}

              <li className="mt-8 pt-6 border-t border-[#EFEDEA]/10">
                <div className="px-4 mb-4 text-sm text-[#EFEDEA]/60 font-medium">
                  إعدادات النظام
                </div>
                {userManagementItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center gap-4 px-5 py-3.5 rounded-xl mb-2
                      transition-all duration-200 group
                      ${pathname === item.href
                        ? "bg-[#C48765] text-[#EFEDEA] shadow-lg"
                        : "text-[#EFEDEA]/80 hover:bg-[#C48765]/10 hover:text-[#EFEDEA]"}
                    `}
                  >
                    <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${pathname === item.href ? "text-[#EFEDEA]" : "text-[#C48765]"
                      }`} />
                    <span className="font-medium text-[15px]">{item.name}</span>
                  </Link>
                ))}
              </li>
            </ul>
          </nav>

          <div className="p-4 bg-[#34222E]/50">
            <button
              onClick={() => setShowLogoutDialog(true)}
              className="
                w-full flex items-center gap-4 px-5 py-3.5 rounded-xl
                text-[#EFEDEA]/90 hover:bg-[#C48765]/10
                transition-all duration-200 group
              "
            >
              <LogOut className="h-5 w-5 text-[#C48765] group-hover:scale-110 transition-transform" />
              <span className="font-medium">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="bg-[#EFEDEA] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-[#34222E] text-xl">تأكيد تسجيل الخروج</DialogTitle>
            <DialogDescription className="text-[#34222E]/80">
              هل أنت متأكد من تسجيل الخروج من النظام؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              className="hover:bg-[#34222E]/5"
            >
              إلغاء
            </Button>
            <Button
              className="bg-[#C48765] hover:bg-[#C48765]/90"
              onClick={handleLogout}
            >
              تأكيد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={toggle}
        />
      )}
    </>
  )
}