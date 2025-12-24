"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

const unitStatuses = {
  ar: ["متاح للبيع", "محجوز", "مباع", "غير متاح"],
  en: ["Available for sale", "Reserved", "Sold", "Unavailable"]
};

interface Category {
  _id: string;
  title: string;
  location?: string;
  Image?: { secure_url: string };
}

interface Unit {
  _id: string;
  title: string;
  images: Array<{ secure_url: string }>;
  status: string;
}

export default function ProjectsUnitsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [unitsByCategory, setUnitsByCategory] = useState<{ [key: string]: Unit[] }>({});
  const [loading, setLoading] = useState(true);
  const [statusUpdates, setStatusUpdates] = useState<{ [unitId: string]: string }>({});
  const [updating, setUpdating] = useState<{ [unitId: string]: boolean }>({});

  useEffect(() => {
    fetch("https://raf-backend-main.vercel.app/category/getAllCategoryARForDashboard")
      .then((res) => res.json())
      .then(async (data) => {
        const cats: Category[] = data.category || [];
        setCategories(cats);
        const unitsData: { [key: string]: Unit[] } = {};
        await Promise.all(
          cats.map(async (cat) => {
            const res = await fetch(`https://raf-backend-main.vercel.app/unit/getAllUnitByCategoryId/${cat._id}`);
            const data = await res.json();
            unitsData[cat._id] = data.units || [];
          })
        );
        setUnitsByCategory(unitsData);
        setLoading(false);
      });
  }, []);

  const handleStatusChange = (unitId: string, newStatus: string) => {
    setStatusUpdates((prev) => ({ ...prev, [unitId]: newStatus }));
  };

  const handleUpdate = async (unitId: string, categoryId: string) => {
    setUpdating((prev) => ({ ...prev, [unitId]: true }));
    const unit = unitsByCategory[categoryId]?.find(u => u._id === unitId);
    const status = statusUpdates[unitId] ?? unit?.status ?? "";
    if (!unit || !status) {
      setUpdating((prev) => ({ ...prev, [unitId]: false }));
      return;
    }
    const payload = {
      ...unit,
      status,
    };
    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));
    try {
      const res = await fetch(`https://raf-backend-main.vercel.app/unit/updateunit/${unitId}`, {
        method: "PUT",
        body: formData,
      });
      if (res.ok) {
        setUnitsByCategory((prev) => ({
          ...prev,
          [categoryId]: prev[categoryId].map((u) => u._id === unitId ? { ...u, status } : u)
        }));
      }
    } finally {
      setUpdating((prev) => ({ ...prev, [unitId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F3] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 w-full h-full pt-16 overflow-auto p-4 md:p-8 lg:p-12">
          {/* <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <span className="text-[#C48765] font-bold">الرئيسية</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>المشاريع والوحدات السكنية</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb> */}
          <h1 className="text-3xl font-bold mt-8 mb-6 text-[#34222E]">المشاريع والوحدات السكنية</h1>
          <ScrollArea className="w-full h-[calc(100vh-10rem)] pr-2">
            <Accordion type="multiple" className="w-full bg-white/60 rounded-2xl shadow-lg">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <AccordionItem key={i} value={`skeleton-${i}`} className="border-none">
                    <AccordionTrigger>
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-lg" />
                        <div>
                          <Skeleton className="w-32 h-5 mb-2" />
                          <Skeleton className="w-20 h-4" />
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                        {Array.from({ length: 3 }).map((_, j) => (
                          <Card key={j} className="rounded-xl shadow p-4 flex flex-col items-center">
                            <Skeleton className="w-[220px] h-[140px] rounded-lg mb-3" />
                            <Skeleton className="w-24 h-5 mb-2" />
                            <Skeleton className="w-32 h-4" />
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))
              ) : (
                categories.map((cat) => (
                  <AccordionItem key={cat._id} value={cat._id} className="border-none">
                    <AccordionTrigger>
                      <div className="flex items-center gap-4">
                        <Image
                          src={cat.Image?.secure_url || "/placeholder.jpg"}
                          alt={cat.title}
                          width={48}
                          height={48}
                          className="rounded-lg object-cover border border-[#EFEDEA] shadow"
                        />
                        <div>
                          <div className="font-bold text-lg text-[#34222E]">{cat.title}</div>
                          <div className="text-sm text-gray-500">{cat.location}</div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                        {(unitsByCategory[cat._id] || []).length === 0 && (
                          <Card className="col-span-full text-center text-gray-400 py-8 bg-white/80 shadow-none border-none">لا توجد وحدات سكنية لهذا المشروع</Card>
                        )}
                        {(unitsByCategory[cat._id] || []).map((unit) => (
                          <Card key={unit._id} className="rounded-xl shadow-lg p-4 flex flex-col items-center bg-white/90 border border-[#EFEDEA]">
                            <div className="w-full flex justify-center">
                              <Image
                                src={unit.images && unit.images.length > 0 ? unit.images[0].secure_url : "/placeholder.jpg"}
                                alt={unit.title}
                                width={220}
                                height={140}
                                className="rounded-lg object-cover mb-3 border border-[#EFEDEA] shadow"
                              />
                            </div>
                            <div className="font-semibold text-lg mb-2 text-[#34222E] w-full text-center">{unit.title}</div>
                            <div className="flex items-center gap-2 w-full mt-2">
                              <Select
                                value={statusUpdates[unit._id] ?? unit.status}
                                onValueChange={(value) => handleStatusChange(unit._id, value)}
                              >
                                <SelectTrigger className="flex-1 border rounded px-2 py-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {unitStatuses.ar.map((status) => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                className="bg-[#C48765] text-white px-4 py-2 rounded shadow"
                                onClick={() => handleUpdate(unit._id, cat._id)}
                                disabled={updating[unit._id] || (statusUpdates[unit._id] ?? unit.status) === unit.status}
                              >
                                {updating[unit._id] ? "...جاري التحديث" : "تحديث الحالة"}
                              </Button>
                            </div>
                            <div className="w-full flex justify-end mt-3">
                              <Badge className="bg-[#EFEDEA] text-[#C48765] border-none px-3 py-1 shadow-sm">
                                {statusUpdates[unit._id] ?? unit.status}
                              </Badge>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))
              )}
            </Accordion>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
} 