"use client";
import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import axios from "axios";
import { FaBuilding, FaSave } from "react-icons/fa";
import { MdOutlineHomeWork } from "react-icons/md";

const STATUS_LABELS = [
  "متاح للبيع",
  "مباع",
  "محجوز",
  "غير متاح"
];

export default function UnitStatusPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState<{ [projectId: string]: any[] }>({});
  const [totalUnitsData, setTotalUnitsData] = useState<{ [projectId: string]: number }>({});
  const [saving, setSaving] = useState<{ [projectId: string]: boolean }>({});
  const [cleaning, setCleaning] = useState(false);

  const STATUS_COLORS: Record<string, string> = {
    "متاح للبيع": "bg-green-100 text-green-700 border-green-300",
    "مباع": "bg-gray-100 text-gray-700 border-gray-300",
    "محجوز": "bg-yellow-100 text-yellow-700 border-yellow-300",
    "غير متاح": "bg-red-100 text-red-700 border-red-300",
  };

  useEffect(() => {
    async function fetchProjectsAndStatus() {
      setLoading(true);
      // 1. جلب المشاريع من API الخارجي
      const res = await fetch("https://raf-backend-main.vercel.app/category/getAllCategoryARForDashboard");
      const data = await res.json();
      const categories = data.category || [];
      // 2. جلب نسب الحالات من قاعدة البيانات
      const statusRes = await fetch("/api/unit-status");
      const statusData = await statusRes.json();
      const statusMap: Record<string, any> = {};
      (statusData.data || []).forEach((s: any) => {
        statusMap[s.projectId] = s;
      });
      // 3. دمج المشاريع مع النسب (أو إنشاء نسب افتراضية)
      const merged = await Promise.all(categories.map(async (cat: any) => {
        let statusObj = statusMap[cat._id];
        if (!statusObj) {
          // إنشاء سجل جديد بقيم افتراضية (نسبة مئوية فقط)
          const defaultStatuses = STATUS_LABELS.map(label => ({ status: label, percentage: 0 }));
          const createRes = await fetch("/api/unit-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId: cat._id, projectName: cat.title, statuses: defaultStatuses, totalUnits: 0 })
          });
          statusObj = (await createRes.json()).data;
        }
        return {
          projectId: cat._id,
          projectName: cat.title,
          totalUnits: statusObj.totalUnits || 0,
          statuses: statusObj.statuses
        };
      }));
      setProjects(merged);
      setLoading(false);
    }
    fetchProjectsAndStatus();
  }, []);

  const handleChange = (projectId: string, idx: number, field: string, value: number) => {
    // حقل count لم يعد مدعوماً - يتم معالجة النسبة المئوية فقط
    if (field !== 'percentage') return;
    
    setEditData((prev) => {
      const current = prev[projectId] || projects.find((p) => p.projectId === projectId)?.statuses || [];
      const updated = current.map((s: any, i: number) =>
        i === idx ? { ...s, [field]: value } : s
      );
      return { ...prev, [projectId]: updated };
    });
  };

  const handleTotalUnitsChange = (projectId: string, value: number) => {
    setTotalUnitsData((prev) => ({ ...prev, [projectId]: value }));
  };

  const handleSave = async (project: any) => {
    setSaving((prev) => ({ ...prev, [project.projectId]: true }));
    const statuses = editData[project.projectId] || project.statuses;
    const totalUnits = totalUnitsData[project.projectId] !== undefined 
      ? totalUnitsData[project.projectId] 
      : project.totalUnits;
    
    await fetch("/api/unit-status", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: project.projectId, statuses, totalUnits }),
    });
    setProjects((prev) =>
      prev.map((p) =>
        p.projectId === project.projectId ? { ...p, statuses, totalUnits } : p
      )
    );
    setSaving((prev) => ({ ...prev, [project.projectId]: false }));
  };

  const handleCleanupOldData = async () => {
    setCleaning(true);
    try {
      const response = await fetch("/api/unit-status/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();
      
      if (result.success) {
        alert(`تم بنجاح! ${result.message}`);
        // إعادة تحميل البيانات
        window.location.reload();
      } else {
        alert(`خطأ: ${result.message}`);
      }
    } catch (error) {
      alert("حدث خطأ أثناء تنظيف البيانات");
    }
    setCleaning(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F6F3] to-[#f3e7db] flex" dir="rtl">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 w-full h-full pt-16 overflow-auto p-4 md:p-8 lg:p-12">
          <div className="flex items-center justify-between mb-8 mt-8">
            <div className="flex items-center gap-3">
              <MdOutlineHomeWork className="text-4xl text-[#C48765] drop-shadow" />
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#34222E] tracking-tight">حالات الوحدات السكنية</h1>
            </div>
            <Button
              onClick={handleCleanupOldData}
              disabled={cleaning}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-bold transition-all duration-200"
            >
              {cleaning ? "جاري التنظيف..." : "🧹 تنظيف البيانات القديمة"}
            </Button>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <svg className="animate-spin h-10 w-10 text-[#C48765]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              <span className="ml-4 text-lg font-medium text-[#C48765]">جاري التحميل...</span>
            </div>
          ) : (
            <div className="space-y-10">
              {projects.map((project) => (
                <Card key={project.projectId} className="p-6 bg-white/90 rounded-2xl shadow-2xl border border-[#f3e7db] hover:shadow-[#C48765]/20 transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 font-bold text-2xl text-[#C48765]">
                      <FaBuilding className="text-[#C48765] text-2xl drop-shadow" />
                      {project.projectName}
                    </div>
                    <div className="flex items-center gap-4 bg-gradient-to-r from-[#C48765]/10 to-[#C48765]/5 p-4 rounded-xl border border-[#C48765]/20">
                      <span className="text-lg font-semibold text-[#34222E]">إجمالي العقارات:</span>
                      <input
                        type="number"
                        min={0}
                        value={totalUnitsData[project.projectId] !== undefined ? totalUnitsData[project.projectId] : project.totalUnits}
                        onChange={(e) => handleTotalUnitsChange(project.projectId, Number(e.target.value))}
                        className="w-24 border-2 border-[#C48765]/30 rounded-lg px-3 py-2 text-center font-bold text-xl bg-white focus:ring-2 focus:ring-[#C48765] focus:border-[#C48765] transition-all shadow-sm"
                        placeholder="0"
                      />
                      <span className="text-sm text-[#C48765] font-medium">وحدة</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(editData[project.projectId] || project.statuses).map((status: any, idx: number) => (
                      <div key={status.status} className={`flex flex-col gap-2 border rounded-xl p-4 shadow-sm ${STATUS_COLORS[status.status] || "bg-gray-50 border-gray-200"}`}>
                        <div className="mb-2">
                          <span className="font-semibold text-lg flex items-center gap-1">
                            {status.status}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 font-medium min-w-fit">النسبة المئوية (يدوية):</span>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={status.percentage}
                              onChange={(e) => handleChange(project.projectId, idx, "percentage", Number(e.target.value))}
                              className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-center font-bold text-base focus:ring-2 focus:ring-[#C48765] focus:border-[#C48765] transition"
                              placeholder="0"
                            />
                            <span className="text-xs font-semibold">%</span>
                          </div>
                          <Progress value={status.percentage} className="h-3 bg-gray-200 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-6">
                    <Button
                      className="bg-[#C48765] hover:bg-[#a06a4d] text-white px-8 py-2 rounded-full shadow-lg flex items-center gap-2 text-lg font-bold transition-all duration-200"
                      onClick={() => handleSave(project)}
                      disabled={saving[project.projectId]}
                    >
                      <FaSave className="text-xl" />
                      {saving[project.projectId] ? "...جاري الحفظ" : "حفظ التعديلات"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 