"use client"
import { useEffect, useState } from 'react'
import { Bell, User, Settings, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "./SidebarProvider"
import Link from "next/link"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { io } from 'socket.io-client'

interface Subscription {
  _id: string
  email: string
  createdAt: string
}

interface InterestedUser {
  _id: string
  fullName: string
  phone: number
  email: string
  categoryId: {
    title: string
    Image: { secure_url: string }
    location: string
  }
  unitId: {
    title: string
    type: string
    price: number
    images: { secure_url: string }[]
    status: string
  }
}
interface ConsultationUser {
  _id: string
  type: string
  selectedDay: string
  phone: string
  email: string
  status: string
}

export function Header() {
  const { toggle } = useSidebar()
  const [notifications, setNotifications] = useState(0)
  const [newInterests, setNewInterests] = useState(0)
  const [newConsultations, setNewConsultations] = useState(0)
  const [interestedUsers, setInterestedUsers] = useState<InterestedUser[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [consultations, setConsultations] = useState<ConsultationUser[]>([])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")
      const [countResponse, subscriptionsResponse, interestedResponse, consultationsResponse] = await Promise.all([
        fetch("https://raf-backend-main.vercel.app/newsletter/unread", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("https://raf-backend-main.vercel.app/newsletter", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("https://raf-backend-main.vercel.app/interested/findAllNotReaded", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("https://raf-backend-main.vercel.app/consultation/getAllUnReadConsultents", {
          headers: { Authorization: `Bearer ${token}` }
        }) as Promise<Response>
      ])

      const countData = await countResponse.json()
      const subsData = await subscriptionsResponse.json()
      const interestedData = await interestedResponse.json()
      const consultationsData = await consultationsResponse.json()

      setNotifications(countData.count)
      setSubscriptions(subsData.emailData || [])
      setInterestedUsers(interestedData.interested || [])
      setConsultations(consultationsData.consultations || [])

    } catch (error) {
      console.error("Failed to fetch data:", error)
    }
  }

  useEffect(() => {
    fetchData()
    const socket = io("https://raf-backend-main.vercel.app")

    socket.on("new_intersted", () => {
      setNewInterests(prev => prev + 1)
      fetchData()
    })

    socket.on("new_consultation", () => {
      setNewConsultations(prev => prev + 1)
      fetchData()
    })

    socket.on("intersted-featch", (data) => {
      setInterestedUsers(data)
    })

    socket.on("new_subscription", () => {
      fetchData()
    })

    socket.on("notifications_read", () => {
      setNotifications(0)
      setSubscriptions([])
    })

    socket.on("consultation_read", () => {
      setNewConsultations(0)
      setConsultations([])
    })

    socket.on("intersted_read", () => {
      setNewInterests(0)
      setInterestedUsers([])
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <header className="fixed top-0 right-0 left-0 bg-[#EFEDEA] border-b z-50">
      <div className="h-16 px-8 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="hover:bg-[#C48765]/10 text-[#34222E] transition-colors"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-4">
            <Image
              src="/logo.jpg"
              alt="RAF Logo"
              width={45}
              height={45}
              className="rounded-lg shadow-sm"
            />
            <h1 className="text-2xl font-bold text-[#34222E] hidden md:block tracking-wide">
              RAF
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <DropdownMenu onOpenChange={async (open) => {
            if (!open && (notifications > 0 || newInterests > 0 || newConsultations > 0)) {
              const token = localStorage.getItem("token")
              await Promise.all([
                fetch("https://raf-backend-main.vercel.app/interested/markAsRead", {
                  method: "POST",
                  headers: { Authorization: `Bearer ${token}` }
                }),
                fetch("https://raf-backend-main.vercel.app/newsletter/markAsRead", {
                  method: "POST",
                  headers: { Authorization: `Bearer ${token}` }
                }),
                fetch("https://raf-backend-main.vercel.app/consultation/isRead", {
                  method: "POST",
                  headers: { Authorization: `Bearer ${token}` }
                })
              ])
              setNotifications(0)
              setNewInterests(0)
              setNewConsultations(0)

            }
          }}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-[#C48765]/10">
                <Bell className="h-5 w-5 text-[#34222E]" />
                {(notifications > 0 || newInterests > 0 || newConsultations > 0) && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#C48765] text-[#EFEDEA] text-xs flex items-center justify-center font-medium">
                    {notifications + newInterests + newConsultations}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-[#EFEDEA] border-[#34222E]/10">
              <DropdownMenuLabel className="text-lg font-bold text-[#34222E]">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#34222E]/10" />
              {subscriptions.map((sub) => (
                <DropdownMenuItem key={sub._id} className="p-4 hover:bg-gray-50">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">{sub.email}</p>
                    <span className="text-xs text-gray-500">
                      {new Date(sub.createdAt).toLocaleString('ar-SA')}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
              {interestedUsers.map((user) => (
                <DropdownMenuItem key={user._id} className="p-4 hover:bg-gray-50">
                  <div className="flex flex-col gap-2">
                    <p className="font-medium">{user.fullName}</p>
                    <p className="text-sm">{user.email}</p>
                    <p className="text-sm">هاتف: {user.phone}</p>
                    <div className="text-xs text-gray-500">
                      <p>الفئة: {user.categoryId?.title || 'غير محدد'}</p>
                      <p>الوحدة: {user.unitId?.title || 'غير محدد'}</p>
                      <p>السعر: {user.unitId?.price?.toLocaleString() || 0} ريال</p>
                    </div>

                  </div>
                </DropdownMenuItem>
              ))}
              {consultations.map((consultation) => (
                <DropdownMenuItem key={consultation._id} className="p-4 hover:bg-gray-50">
                  <div className="flex flex-col gap-2">
                    <p className="font-medium">{consultation.email}</p>
                    <p className="text-sm">نوع الاستشارة: {consultation.type}</p>
                    <p className="text-sm">الهاتف: {consultation.phone}</p>
                    <p className="text-sm">اليوم المحدد: {consultation.selectedDay}</p>
                    <p className="text-sm">الحالة: {consultation.status}</p>
                  </div>
                </DropdownMenuItem>
              ))}

              <DropdownMenuItem asChild className="p-2">
                <Link href="/notifications" className="w-full text-center text-primary hover:text-primary-dark">
                  عرض كل الإشعارات
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-[#C48765]/10">
                <User className="h-5 w-5 text-[#34222E]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#EFEDEA] border-[#34222E]/10">
              <DropdownMenuLabel className="text-lg font-bold text-[#34222E]">Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#34222E]/10" />
              <DropdownMenuItem asChild className="p-3 hover:bg-[#C48765]/10">
                <Link href="/users/settings" className="flex items-center gap-3 text-[#34222E]">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#34222E]/10" />
              <DropdownMenuItem className="p-3 text-[#34222E] hover:bg-[#C48765]/10">
                <div className="flex items-center gap-3">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}