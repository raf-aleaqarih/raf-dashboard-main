'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast, Toaster } from 'react-hot-toast'
import {
  Search, UserCheck, Calendar, Mail, Phone, RefreshCw,
  Download, ChevronLeft, ChevronRight, User, X
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import * as XLSX from 'xlsx'
import { Sidebar } from '@/components/Sidebar'
import { useSidebar } from '@/components/SidebarProvider'

// Types
interface WebsiteUser {
  _id: string
  firstName: string
  middleName: string
  lastName: string
  email: string
  role: string
  status: string
  createdAt: string
  updatedAt: string
  phoneNumber: string
  fullName: string
  lastLogin: string
}

// Main component
export default function WebsiteUserPage() {
  const { isOpen, toggle } = useSidebar()
  const [users, setUsers] = useState<WebsiteUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<WebsiteUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [paginatedUsers, setPaginatedUsers] = useState<WebsiteUser[]>([])

  // User profile
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [selectedUser, setSelectedUser] = useState<WebsiteUser | null>(null)

  // Fetch website users data
  useEffect(() => {
    fetchUsers()
  }, [])

  // Apply filters
  useEffect(() => {
    let result = users

    // Apply search filter
    if (searchTerm.trim() !== '') {
      result = result.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phoneNumber.includes(searchTerm)
      )
    }

    setFilteredUsers(result)
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchTerm, users])

  // Apply pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    setPaginatedUsers(filteredUsers.slice(startIndex, endIndex))
  }, [filteredUsers, currentPage, itemsPerPage])

  // Mock data for demonstration
  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('https://raf-backend-main.vercel.app/auth/getRafUser')
      const data = await response.json()

      // Transform the API data to match our needs
      const transformedUsers = data.users.map((user: WebsiteUser) => ({
        _id: user._id,
        fullName: `${user.firstName} ${user.middleName} ${user.lastName}`.trim(),
        email: user.email,
        phoneNumber: user.phoneNumber, // Add if phone field becomes available in API
        createdAt: user.createdAt,
        lastLogin: user.updatedAt,
        status: user.status,
        role: user.role
      }))

      setUsers(transformedUsers)
      setFilteredUsers(transformedUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('حدث خطأ أثناء تحميل بيانات المستخدمين')
    } finally {
      setIsLoading(false)
    }
  }

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Export data to Excel
  const exportToExcel = () => {
    try {
      const exportData = filteredUsers.map(user => ({
        'الاسم الكامل': user.firstName + ' ' + user.middleName + ' ' + user.lastName,
        'البريد الإلكتروني': user.email,
        'رقم الهاتف': user.phoneNumber,
        'تاريخ التسجيل': formatDate(user.createdAt),
        'آخر تسجيل دخول': formatDate(user.lastLogin)
      }))

      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'مستخدمي الموقع')

      // Generate file name with current date
      const date = new Date()
      const fileName = `مستخدمي_الموقع_${date.toISOString().split('T')[0]}.xlsx`

      XLSX.writeFile(workbook, fileName)
      toast.success('تم تصدير البيانات بنجاح')
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('حدث خطأ أثناء تصدير البيانات')
    }
  }

  // View user profile
  const viewUserProfile = (user: WebsiteUser) => {
    setSelectedUser(user)
    setShowUserProfile(true)
  }

  // Calculate total pages
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null

    return (
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="عدد العناصر" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 عناصر</SelectItem>
              <SelectItem value="10">10 عناصر</SelectItem>
              <SelectItem value="20">20 عنصر</SelectItem>
              <SelectItem value="50">50 عنصر</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-500">
            عرض {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} من {filteredUsers.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Show pages around current page
            let pageNum
            if (totalPages <= 5) {
              pageNum = i + 1
            } else if (currentPage <= 3) {
              pageNum = i + 1
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i
            } else {
              pageNum = currentPage - 2 + i
            }

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
                className="w-8 h-8"
              >
                {pageNum}
              </Button>
            )
          })}

          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  // Render user profile
  const renderUserProfile = () => {
    if (!selectedUser) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">الملف الشخصي</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowUserProfile(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex flex-col items-center mb-6">
            <div className="bg-primary/10 text-primary p-4 rounded-full mb-3">
              <User className="h-12 w-12" />
            </div>
            <h3 className="text-xl font-bold">
              {selectedUser.fullName}
            </h3>
            <p className="text-gray-500">{selectedUser.email}</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">رقم الهاتف</p>
                <p className="font-medium">{selectedUser.phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">تاريخ التسجيل</p>
                <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">آخر تسجيل دخول</p>
              <p className="font-medium">{formatDate(selectedUser.lastLogin)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">الحالة</p>
              <p className="font-medium">{selectedUser.status}</p>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button variant="outline" onClick={() => setShowUserProfile(false)}>إغلاق</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      <Sidebar />

      <div className={`flex-1 transition-all duration-300 ${isOpen ? "mr-80" : "mr-0"}`}>
        <Toaster position="top-center" />
        {showUserProfile && renderUserProfile()}

        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
            <button
              onClick={toggle}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="relative h-10 w-10 mr-3">
              <Image
                src="/logo.jpg"
                alt="Logo"
                fill
                className="object-contain rounded-full"
              />
            </div>
            <h1 className="text-xl font-bold text-gray-900">مستخدمي الموقع</h1>
          </div>
        </div>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="shadow-md">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-2xl">مستخدمي الموقع المسجلين</CardTitle>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="بحث بالاسم أو البريد أو الهاتف..."
                    className="pr-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fetchUsers()}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>

                <Button
                  variant="outline"
                  onClick={exportToExcel}
                  disabled={filteredUsers.length === 0}
                  className="hidden sm:flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span>تصدير</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right font-bold">المستخدم</TableHead>
                      <TableHead className="text-right font-bold">البريد الإلكتروني</TableHead>
                      <TableHead className="text-right font-bold">الدور</TableHead>
                      <TableHead className="text-right font-bold">تاريخ التسجيل</TableHead>
                      <TableHead className="text-right font-bold">اخر تسجيل دخول</TableHead>

                      <TableHead className="text-right font-bold">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex justify-center">
                            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : paginatedUsers.length > 0 ? (
                      paginatedUsers.map((user) => (
                        <TableRow
                          key={user._id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => viewUserProfile(user)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="bg-primary/10 text-primary p-2 rounded-full">
                                <UserCheck className="h-5 w-5" />
                              </div>
                              {user.fullName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              {user.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              {user.phoneNumber}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {formatDate(user.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(user.lastLogin)}</TableCell>
                          <TableCell>{user.status}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          لا توجد بيانات متطابقة مع البحث
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {renderPagination()}

              <div className="mt-4 sm:hidden">
                <Button
                  variant="outline"
                  onClick={exportToExcel}
                  disabled={filteredUsers.length === 0}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span>تصدير البيانات</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
