/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { SHOWCASE_STUDENTS, generateProceduralProfile } from "../data";
import { StudentProfile, SubjectGrade } from "../types";
import { Search, GraduationCap, Award, CheckCircle, AlertCircle, TrendingUp, Calculator, ListCollapse, Share2, HelpCircle } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from "recharts";

interface GradingSystemProps {
  loggedInProfile?: StudentProfile | null;
}

export default function GradingSystem({ loggedInProfile }: GradingSystemProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(SHOWCASE_STUDENTS[0]);
  const [activeSemIndex, setActiveSemIndex] = useState(0);
  const [searchError, setSearchError] = useState("");

  // Sync with logged in student profile
  useEffect(() => {
    if (loggedInProfile) {
      setSelectedStudent(loggedInProfile);
      setSearchQuery(loggedInProfile.id);
      setActiveSemIndex(0);
    } else {
      setSelectedStudent(SHOWCASE_STUDENTS[0]);
      setSearchQuery("");
    }
  }, [loggedInProfile]);
  
  // Grade simulator state
  const [showSimulator, setShowSimulator] = useState(false);
  const [targetGPA, setTargetGPA] = useState("3.5");
  const [upcomingCredits, setUpcomingCredits] = useState(15);
  const [requiredScore, setRequiredScore] = useState<number | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = searchQuery.trim();
    if (!cleanQuery) {
      setSearchError("Vui lòng nhập Mã số sinh viên (MSSV).");
      return;
    }

    // Try finding showcase student
    const found = SHOWCASE_STUDENTS.find(s => s.id === cleanQuery);
    if (found) {
      setSelectedStudent(found);
      setActiveSemIndex(0);
      setSearchError("");
    } else {
      // Validate length or character for realistic feel
      if (cleanQuery.length < 5) {
        setSearchError("MSSV hợp lệ thường có từ 5-10 ký tự.");
        return;
      }
      // Generate dynamically and set!
      const procedural = generateProceduralProfile(cleanQuery);
      setSelectedStudent(procedural);
      setActiveSemIndex(0);
      setSearchError("");
    }
  };

  const loadShowcase = (id: string) => {
    const found = SHOWCASE_STUDENTS.find(s => s.id === id);
    if (found) {
      setSelectedStudent(found);
      setSearchQuery(id);
      setActiveSemIndex(0);
      setSearchError("");
    }
  };

  // Run a quick cumulative estimation
  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    const target = parseFloat(targetGPA);
    if (isNaN(target) || target < 0 || target > 4.0) {
      alert("GPA mục tiêu phải nằm trong khoảng từ 0.0 đến 4.0");
      return;
    }

    const currentTotalPoints = selectedStudent.cumulativeGPA * selectedStudent.totalCreditsEarned;
    const totalCreditsNew = selectedStudent.totalCreditsEarned + upcomingCredits;
    const targetTotalPoints = target * totalCreditsNew;
    const neededPoints = targetTotalPoints - currentTotalPoints;
    const neededGPA = neededPoints / upcomingCredits;

    setRequiredScore(Math.round(neededGPA * 100) / 100);
  };

  // Prepare chart data
  const chartData = selectedStudent ? selectedStudent.semesters.map(sem => ({
    name: sem.semesterName.split(" - ")[0], // e.g. "Học kỳ I"
    "GPA Kỳ này": sem.semesterGPA,
    "Tải lượng (TC)": sem.semesterCredits
  })) : [];

  const gradeDistributionData = selectedStudent ? (() => {
    const counts: { [key: string]: number } = { "A/A+": 0, "B/B+": 0, "C/C+": 0, "D/D+": 0, "F": 0 };
    selectedStudent.semesters.forEach(sem => {
      sem.subjects.forEach(sub => {
        if (sub.letterGrade.startsWith("A")) counts["A/A+"]++;
        else if (sub.letterGrade.startsWith("B")) counts["B/B+"]++;
        else if (sub.letterGrade.startsWith("C")) counts["C/C+"]++;
        else if (sub.letterGrade.startsWith("D")) counts["D/D+"]++;
        else counts["F"]++;
      });
    });
    return Object.keys(counts).map(k => ({ label: k, value: counts[k] }));
  })() : [];

  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#9CA3AF"];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b border-slate-100 pb-5 mb-6 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold mb-2">
            <GraduationCap className="h-3.5 w-3.5" />
            <span>STUDENT PORTAL - HCMUTE SERVICE</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Tra Cứu Điểm Số & Đánh Giá Học Tập</h2>
          <p className="text-sm text-slate-500 mt-1">Hệ thống đồng bộ trực quan hóa kết quả học tập, tín chỉ tích lũy trực tuyến.</p>
        </div>

        {/* Quick Showcase Student Links */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Tài khoản demo:</span>
          {SHOWCASE_STUDENTS.map(s => (
            <button
              key={s.id}
              onClick={() => loadShowcase(s.id)}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-mono ${
                selectedStudent?.id === s.id
                  ? "bg-blue-600 text-white border-blue-600 font-semibold"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {s.id} ({s.fullName.split(" ").slice(-1)})
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="max-w-2xl mb-8">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Nhập mã số sinh viên (Ví dụ: 22110123, 23110234 hoặc mssv bất kỳ...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl text-slate-800 placeholder-slate-400 font-sans transition-all text-sm outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl tracking-wide shadow-sm transition-all outline-none cursor-pointer hover:shadow-md active:scale-95 flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            <span>Tìm kiếm</span>
          </button>
        </div>
        {searchError && (
          <p className="text-xs text-red-500 mt-2 font-medium flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {searchError}
          </p>
        )}
      </form>

      {selectedStudent ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Col 1: Profile & General Achievements */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white p-5 border border-slate-800 relative overflow-hidden shadow-lg">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5 pointer-events-none">
                <GraduationCap className="h-48 w-48" />
              </div>

              {/* Card Header Profile */}
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-blue-500 to-amber-400 p-0.5 flex items-center justify-center font-bold text-lg text-slate-900 uppercase">
                  <div className="h-full w-full bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                    {selectedStudent.fullName.split(" ").slice(-1)[0][0]}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">{selectedStudent.fullName}</h3>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">MSSV: {selectedStudent.id}</p>
                </div>
              </div>

              {/* Main stats */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-700/50">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">ĐIỂM CÙNG LŨY (HỆ 4)</span>
                  <span className="text-2xl font-black text-amber-400 mt-0.5 block">{selectedStudent.cumulativeGPA.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">HỆ 10 TRỰC QUAN</span>
                  <span className="text-2xl font-black text-emerald-400 mt-0.5 block">{selectedStudent.cumulativeGPA10.toFixed(1)}</span>
                </div>
              </div>

              <div className="mt-5 space-y-2 text-xs text-slate-300 bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ngành học:</span>
                  <span className="font-semibold text-right">{selectedStudent.major}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Khoa quản lý:</span>
                  <span className="font-semibold text-right">{selectedStudent.faculty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Lớp sinh hoạt:</span>
                  <span className="font-semibold font-mono">{selectedStudent.classCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Khóa tuyển tuyển sinh:</span>
                  <span className="font-semibold">{selectedStudent.cohort}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tổng tín chỉ tích lũy:</span>
                  <span className="font-semibold text-amber-300">{selectedStudent.totalCreditsEarned} TC</span>
                </div>
              </div>
            </div>

            {/* Recharts Mini charts: Academic Performance Insights */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5">
              <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                <TrendingUp className="h-4.5 w-4.5 text-blue-600" />
                <span>Tiến Độ Học Tập Qua Các Kỳ</span>
              </h4>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gpaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                    <YAxis domain={[0, 4.0]} stroke="#94A3B8" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Area type="monotone" dataKey="GPA Kỳ này" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#gpaGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recharts Barchart: Grade Distribution */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5">
              <h4 className="text-sm font-bold text-slate-800 mb-3.5 flex items-center gap-1.5">
                <Award className="h-4.5 w-4.5 text-amber-500" />
                <span>Phân Bố Kết Quả Môn Học</span>
              </h4>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeDistributionData} barSize={24}>
                    <XAxis dataKey="label" fontSize={10} tickLine={false} stroke="#94A3B8" />
                    <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Bar dataKey="value" name="Số môn học">
                      {gradeDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Col 2 & 3: Transcripts & GPA Simulator */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-50/50 border border-slate-200/60 rounded-2xl p-5">
              {/* Semester Selector Tabs */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-200/60 pb-3 mb-4 gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {selectedStudent.semesters.map((sem, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => setActiveSemIndex(sIdx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                        activeSemIndex === sIdx
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-600/10"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {sem.semesterName.split(" - ")[0]}
                    </button>
                  ))}
                </div>

                <div className="text-slate-500 text-xs font-mono">
                  GPA Kỳ: <strong className="text-blue-700 font-bold">{selectedStudent.semesters[activeSemIndex]?.semesterGPA?.toFixed(2)}</strong> (Tải lượng: {selectedStudent.semesters[activeSemIndex]?.semesterCredits} TC)
                </div>
              </div>

              {/* Grade details table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-mono text-[10px] tracking-wider uppercase">
                      <th className="py-2.5 px-3">Mã môn</th>
                      <th className="py-2.5 px-3">Tên môn học</th>
                      <th className="py-2.5 px-3 text-center">TC</th>
                      <th className="py-2.5 px-3 text-center">QT (30%)</th>
                      <th className="py-2.5 px-3 text-center">Thi (70%)</th>
                      <th className="py-2.5 px-3 text-center">Tổng Kết</th>
                      <th className="py-2.5 px-3 text-center">Điểm chữ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-xs">
                    {selectedStudent.semesters[activeSemIndex]?.subjects.map((sub, sIdx) => {
                      const isPass = sub.letterGrade !== "F";
                      return (
                        <tr key={sIdx} className="hover:bg-white/80 transition-all font-sans">
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{sub.code}</td>
                          <td className="py-3 px-3 font-semibold text-slate-700">{sub.name}</td>
                          <td className="py-3 px-3 text-center font-semibold text-slate-600">{sub.credits}</td>
                          <td className="py-3 px-3 text-center font-mono text-slate-500">{sub.componentScore.toFixed(1)}</td>
                          <td className="py-3 px-3 text-center font-mono text-slate-500">{sub.examScore.toFixed(1)}</td>
                          <td className="py-3 px-3 text-center font-bold text-slate-800 font-mono bg-blue-50/20">{sub.finalScore.toFixed(1)}</td>
                          <td className="py-3 px-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isPass 
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                : "bg-red-50 text-red-700 border border-red-100"
                            }`}>
                              {isPass ? (
                                <CheckCircle className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <AlertCircle className="h-3 w-3 text-red-500" />
                              )}
                              <span>{sub.letterGrade}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footnote instruction */}
              <div className="mt-4 pt-3 border-t border-slate-200/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
                <span>Hệ điểm áp dụng theo Quy chế đào tạo tín chỉ học chế HCMUTE 2026.</span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Trạng thái: Đã cập nhật chính thức</span>
                </span>
              </div>
            </div>

            {/* GPA Goal Target Simulator Widget */}
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                    <Calculator className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Công Cụ Dự Báo Đạt Mục Tiêu Học Tập</h4>
                    <p className="text-xs text-slate-500">Giúp tính toán chỉ số GPA tối thiểu cần thiết trong các kỳ học tới.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSimulator(!showSimulator)}
                  className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  {showSimulator ? "Đóng công cụ" : "Bật công cụ"}
                </button>
              </div>

              {showSimulator && (
                <form onSubmit={handleSimulate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">GPA Tích Lũy Mục Tiêu (0.0 - 4.0)</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.0"
                      max="4.0"
                      value={targetGPA}
                      onChange={(e) => setTargetGPA(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Số Tín Chỉ Sắp Đăng Ký Học</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={upcomingCredits}
                      onChange={(e) => setUpcomingCredits(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Dự báo điểm
                    </button>
                  </div>

                  {requiredScore !== null && (
                    <div className="md:col-span-3 mt-3 pt-3 border-t border-slate-200/60 flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <TrendingUp className="h-4.5 w-4.5" />
                      </div>
                      <div className="text-xs">
                        {requiredScore > 4.0 ? (
                          <span className="text-red-600 font-bold">
                            Không khả thi! Bạn cần đạt GPA {requiredScore} ở kỳ tiếp theo để kéo tổng điểm lên {targetGPA}. Hãy đăng ký nhiều tín chỉ hơn hoặc hạ mục tiêu tích lũy.
                          </span>
                        ) : requiredScore < 1.5 ? (
                          <span className="text-emerald-600 font-bold">
                            Hoàn toàn trong tầm tay! Bạn chỉ cần đạt GPA kỳ tới từ {Math.max(1.5, requiredScore).toFixed(2)} trở lên để hoàn thành mục tiêu {targetGPA}.
                          </span>
                        ) : (
                          <span className="text-slate-700 font-medium">
                            Để tích lũy đạt <strong className="text-blue-600">{targetGPA}</strong>, bạn cần đạt GPA trung bình học kỳ tới là <strong className="text-slate-900 text-sm font-bold bg-amber-100 px-1.5 py-0.5 rounded">{requiredScore.toFixed(2)}</strong>.
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
          <HelpCircle className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-700">Chưa có thông tin hiển thị</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Vui lòng nhập Mã số sinh viên của bạn (ví dụ: 22110123) để hiển thị hồ sơ học tập chi tiết.</p>
        </div>
      )}
    </div>
  );
}
