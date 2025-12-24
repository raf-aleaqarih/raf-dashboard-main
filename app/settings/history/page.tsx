'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
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
import { ContactHistory, HistoryResponse } from '@/lib/types/contact'

export default function HistoryPage() {
  const [history, setHistory] = useState<ContactHistory[]>([])
  const [pagination, setPagination] = useState<any>({})
  const [stats, setStats] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    action: '',
    startDate: '',
    endDate: ''
  })
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null)

  useEffect(() => {
    fetchHistory()
  }, [filters])

  const fetchHistory = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString())
      })

      const response = await fetch(`/api/settings/contact/history?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setHistory(data.data.history)
        setPagination(data.data.pagination)
        setStats(data.data.stats)
      } else {
        toast.error('خطأ في جلب تاريخ التغييرات')
      }
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // إعادة تعيين الصفحة عند تغيير الفلاتر
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }))
  }

  const handleDeleteRecord = async () => {
    if (!selectedRecord) return

    try {
      const response = await fetch(`/api/settings/contact/history?id=${selectedRecord}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast.success('تم حذف السجل بنجاح')
        fetchHistory()
        setShowDeleteDialog(false)
        setSelectedRecord(null)
      } else {
        toast.error(data.message || 'خطأ في حذف السجل')
      }
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم')
    }
  }

  const getActionLabel = (action: string) => {
    const labels = {
      create: 'إنشاء',
      update: 'تحديث',
      delete: 'حذف',
      reset: 'إعادة تعيين'
    }
    return labels[action as keyof typeof labels] || action
  }

  const getActionColor = (action: string) => {
    const colors = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800',
      reset: 'bg-orange-100 text-orange-800'
    }
    return colors[action as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
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
              <p>جاري تحميل التاريخ...</p>
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
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">تاريخ التغييرات</h1>
              <p className="text-gray-600">عرض سجل جميع التغييرات في أرقام التواصل</p>
            </div>

            {/* الإحصائيات */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.total || 0}</div>
                    <div className="text-sm text-gray-600">إجمالي التغييرات</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.create || 0}</div>
                    <div className="text-sm text-gray-600">إنشاء</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.update || 0}</div>
                    <div className="text-sm text-gray-600">تحديث</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.delete || 0}</div>
                    <div className="text-sm text-gray-600">حذف</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.reset || 0}</div>
                    <div className="text-sm text-gray-600">إعادة تعيين</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* الفلاتر */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>فلاتر البحث</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="action">نوع العملية</Label>
                    <Select value={filters.action} onValueChange={(value) => handleFilterChange('action', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="جميع العمليات" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع العمليات</SelectItem>
                        <SelectItem value="create">إنشاء</SelectItem>
                        <SelectItem value="update">تحديث</SelectItem>
                        <SelectItem value="delete">حذف</SelectItem>
                        <SelectItem value="reset">إعادة تعيين</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="startDate">من تاريخ</Label>
                    <Input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">إلى تاريخ</Label>
                    <Input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="limit">عدد النتائج</Label>
                    <Select value={filters.limit.toString()} onValueChange={(value) => handleFilterChange('limit', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* جدول التاريخ */}
            <Card>
              <CardHeader>
                <CardTitle>سجل التغييرات</CardTitle>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">لا توجد سجلات</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((record) => (
                      <div key={record._id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge className={getActionColor(record.action)}>
                              {getActionLabel(record.action)}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatDate(record.createdAt)}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRecord(record._id)
                              setShowDeleteDialog(true)
                            }}
                          >
                            حذف
                          </Button>
                        </div>
                        
                        {record.changedFields && record.changedFields.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">الحقول المتغيرة:</p>
                            <div className="flex gap-2">
                              {record.changedFields.map((field) => (
                                <Badge key={field} variant="secondary" className="text-xs">
                                  {field}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {record.oldData && record.newData && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">القيم السابقة:</p>
                              <div className="space-y-1 text-sm">
                                {Object.entries(record.oldData).map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="text-gray-600">{key}:</span>
                                    <span className="font-mono">{value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">القيم الجديدة:</p>
                              <div className="space-y-1 text-sm">
                                {Object.entries(record.newData).map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="text-gray-600">{key}:</span>
                                    <span className="font-mono">{value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {record.ipAddress && (
                          <div className="mt-3 text-xs text-gray-500">
                            IP: {record.ipAddress}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* التنقل بين الصفحات */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-600">
                      صفحة {pagination.page} من {pagination.totalPages} 
                      ({pagination.total} سجل)
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!pagination.hasPrev}
                        onClick={() => handlePageChange(pagination.page - 1)}
                      >
                        السابق
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!pagination.hasNext}
                        onClick={() => handlePageChange(pagination.page + 1)}
                      >
                        التالي
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialog حذف السجل */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا السجل؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRecord}>
              تأكيد الحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 