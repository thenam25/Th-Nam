/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from "react";
import HeroSlideshow from "./components/HeroSlideshow";
import GradingSystem from "./components/GradingSystem";
import AdmissionsSection from "./components/AdmissionsSection";
import NewsEventsSection from "./components/NewsEventsSection";
import AlumniSection from "./components/AlumniSection";
import LoginModal from "./components/LoginModal";
import { SHOWCASE_STUDENTS, generateProceduralProfile } from "./data";
import { getOfflineHtml } from "./offlineTemplate";

// Icons 
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Users,
  Search,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  ChevronRight,
  TrendingUp,
  School,
  Share2,
  FileCheck,
  Award,
  Flame,
  Globe,
  BellRing,
  ExternalLink,
  ChevronDown,
  LogOut,
  Download,
  FileDown
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"intro" | "admissions" | "news" | "alumni" | "grades">("intro");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  
  // Authenticated state from LoginModal
  const [authName, setAuthName] = useState<string | null>(null);
  const [authRole, setAuthRole] = useState<string | null>(null);
  const [authId, setAuthId] = useState<string | null>(null);
  const [authProfile, setAuthProfile] = useState<any>(null);

  // Auto-rotating highlights bar messaging ticker
  const [tickerIndex, setTickerIndex] = useState(0);
  const tickers = [
    "🔥 Tuyển sinh 2026: HCMUTE mở đợt nhận hồ sơ xét tuyển học bạ 5 học kỳ từ ngày 01/06/2026.",
    "🏆 Chúc mừng 2 dự án nghiên cứu AI & Robot cánh tay tự hành của khoa Chế tạo máy đạt giải Nhất Quốc Gia.",
    "🎓 Trường Đại Học Sư Phạm Kỹ Thuật TP.HCM vinh dự xếp vị trí thứ 3 miền Nam về chất lượng cơ sở kỹ thuật."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickers.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = (name: string, role: string, id: string, major?: string) => {
    setAuthName(name);
    const resolvedRole = role === "student" ? "Sinh Viên SPK" : role === "alumni" ? "Cựu Sinh Viên" : "Cán Bộ Giảng Viên";
    setAuthRole(resolvedRole);
    setAuthId(id);
    
    if (role === "student") {
      const found = SHOWCASE_STUDENTS.find(s => s.id === id);
      if (found) {
        setAuthProfile({ ...found });
      } else {
        const newProf = generateProceduralProfile(id);
        newProf.fullName = name;
        if (major) {
          newProf.major = major;
          if (major.includes("Ô tô")) {
            newProf.faculty = "Khoa Cơ khí Động lực";
          } else if (major.includes("Cơ điện tử")) {
            newProf.faculty = "Khoa Cơ khí Chế tạo máy";
          } else if (major.includes("Thông tin")) {
            newProf.faculty = "Khoa Công nghệ Thông tin";
          } else if (major.includes("Điện")) {
            newProf.faculty = "Khoa Điện - Điện tử";
          } else if (major.includes("May")) {
            newProf.faculty = "Khoa Thời trang và Thiết kế";
          } else if (major.includes("Logistics")) {
            newProf.faculty = "Khoa Kinh tế";
          } else if (major.includes("Thực phẩm")) {
            newProf.faculty = "Khoa Công nghệ Hóa học & Thực phẩm";
          }
        }
        setAuthProfile(newProf);
      }
    } else {
      setAuthProfile(null);
    }
  };

  const handleLogout = () => {
    setAuthName(null);
    setAuthRole(null);
    setAuthId(null);
    setAuthProfile(null);
  };

  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    
    const word = globalSearch.trim().toLowerCase();
    
    // Quick search route detection
    if (word.includes("điểm") || word.includes("gpa") || word.includes("tra cứu") || /\d+/.test(word)) {
      setActiveTab("grades");
    } else if (word.includes("tuyển sinh") || word.includes("ngành") || word.includes("học bạ") || word.includes("học phí")) {
      setActiveTab("admissions");
    } else if (word.includes("cựu") || word.includes("alumni") || word.includes("mentor") || word.includes("việc làm")) {
      setActiveTab("alumni");
    } else {
      setActiveTab("news");
    }
    
    setGlobalSearch("");
    const sectionEl = document.getElementById("main-portal");
    if (sectionEl) sectionEl.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans transition-all duration-300 antialiased selection:bg-blue-600 selection:text-white">
      
      {/* 1. TOP UTILITY STRIP */}
      <div className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px] font-mono py-2 px-4 shadow-sm z-30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-4.5 justify-center">
            <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
              <Phone className="h-3.5 w-3.5 text-blue-400" />
              <span>Hotline tuyển sinh: 028 3722 5724</span>
            </span>
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail className="h-3.5 w-3.5 text-blue-400" />
              <span>tuyensinh@hcmute.edu.vn</span>
            </span>
          </div>

          <div className="flex items-center gap-4.5">
            <span className="text-slate-300 font-bold bg-blue-900/40 border border-blue-900 px-2 py-0.5 rounded text-[10px] uppercase">
              MÃ TRƯỜNG: SPK
            </span>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hover:text-white cursor-pointer select-none">Hệ thống Đào tạo Tín chỉ trực tuyến</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CHIEF BRANDED LOGO & TEXT BANNER HEADER AREA */}
      <header className="bg-white border-b border-slate-100 py-4.5 px-4 sticky top-0 bg-white/95 backdrop-blur-md z-40 transition-all shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Slogan text layout */}
          <div className="flex items-center gap-3">
            {/* Official Logo image of HCMUTE */}
            <div className="h-14 w-14 shrink-0 bg-white rounded-full flex items-center justify-center p-0.5 shadow-md border-2 border-slate-100">
              <img
                src="https://upload.wikimedia.org/wikipedia/vi/1/1d/Logo_HCMUTE.png"
                alt="HCMUTE Logo"
                className="h-full w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* School name text typography */}
            <div className="text-left select-none shrink-0 md:shrink">
              <span className="text-[10px] md:text-xs font-black text-rose-600 block leading-tight tracking-wider uppercase">
                TRƯỜNG ĐẠI HỌC CÔNG NGHỆ KỸ THUẬT TP. HỒ CHÍ MINH
              </span>
              <h1 className="text-sm md:text-lg font-black text-slate-900 tracking-tight leading-none mt-0.5 uppercase">
                HCMC University of Technology and Engineering
              </h1>
            </div>
          </div>

          {/* Quick Search and Portal entry actions */}
          <div className="hidden lg:flex items-center gap-4">
            <form onSubmit={handleGlobalSearchSubmit} className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tra nhanh ngành, MSSV, điểm số..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 py-1.5 pl-9 pr-3 rounded-full text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all font-sans"
              />
            </form>

            {/* If Auth, replace with user card, else show Login Trigger */}
            {authName ? (
              <div className="flex items-center gap-2">
                <div className="bg-slate-100 border border-slate-200 py-1 px-3.5 rounded-full flex items-center gap-2 relative">
                  <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black select-none">
                    {authName[0]}
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] font-extrabold text-slate-800 block truncate max-w-28 leading-tight">
                      {authName}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400 block -mt-0.5 font-mono">
                      {authRole}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-1 p-1 hover:bg-slate-200 text-slate-400 hover:text-red-700 rounded-full transition-colors cursor-pointer"
                    title="Đăng xuất"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-blue-650 hover:bg-blue-750 text-slate-900 border border-blue-200 bg-amber-400 hover:bg-amber-500 font-bold px-4.5 py-2 rounded-xl text-xs tracking-wider transition-all cursor-pointer active:scale-95 shadow-sm inline-flex items-center gap-1.5 select-none"
              >
                <Sparkles className="h-4 w-4" />
                <span>ĐĂNG NHẬP PORTAL</span>
              </button>
            )}
          </div>

          {/* Toggle navigation for small devices */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 pointer-events-auto cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="h-5.5 w-5.5" /> : <Menu className="h-5.5 w-5.5" />}
          </button>
        </div>
      </header>

      {/* 3. MOBILE MENU BAR EXPANSION */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 py-4 px-4 space-y-4 shadow-inner z-50">
          <nav className="flex flex-col gap-2.5">
            <button
              onClick={() => { setActiveTab("intro"); setIsMobileMenuOpen(false); }}
              className={`text-left text-xs font-semibold py-2.5 px-3 rounded-lg ${
                activeTab === "intro" ? "bg-blue-50 text-blue-700" : "text-slate-650"
              }`}
            >
              GIỚI THIỆU TRƯỜNG
            </button>
            <button
              onClick={() => { setActiveTab("admissions"); setIsMobileMenuOpen(false); }}
              className={`text-left text-xs font-semibold py-2.5 px-3 rounded-lg ${
                activeTab === "admissions" ? "bg-blue-50 text-blue-700" : "text-slate-650"
              }`}
            >
              THÔNG TIN TUYỂN SINH
            </button>
            <button
              onClick={() => { setActiveTab("news"); setIsMobileMenuOpen(false); }}
              className={`text-left text-xs font-semibold py-2.5 px-3 rounded-lg ${
                activeTab === "news" ? "bg-blue-50 text-blue-700" : "text-slate-650"
              }`}
            >
              TIN TỨC SỰ KIỆN
            </button>
            <button
              onClick={() => { setActiveTab("alumni"); setIsMobileMenuOpen(false); }}
              className={`text-left text-xs font-semibold py-2.5 px-3 rounded-lg ${
                activeTab === "alumni" ? "bg-blue-50 text-blue-700" : "text-slate-650"
              }`}
            >
              CỰU SINH VIÊN
            </button>
            <button
              onClick={() => { setActiveTab("grades"); setIsMobileMenuOpen(false); }}
              className={`text-left text-xs font-semibold py-2.5 px-3 rounded-lg ${
                activeTab === "grades" ? "bg-blue-50 text-blue-700" : "text-slate-650"
              }`}
            >
              TRA CỨU ĐIỂM SỐ (STUDENT)
            </button>
          </nav>

          <form onSubmit={handleGlobalSearchSubmit} className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Nhập tên ngành, MSSV tra cứu..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 py-2 pl-9 pr-4 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500 font-sans"
            />
          </form>

          {authName ? (
            <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  {authName[0]}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800">{authName}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{authRole}</p>
                </div>
              </div>
              <button
                onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 cursor-pointer"
                title="Đăng xuất"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setIsLoginModalOpen(true); setIsMobileMenuOpen(false); }}
              className="w-full bg-amber-400 text-slate-900 font-bold py-2.5 rounded-xl text-xs active:scale-95 text-center shadow-sm select-none"
            >
              ĐĂNG NHẬP PORTAL HỆ THỐNG
            </button>
          )}
        </div>
      )}

      {/* 4. NEWS TICKER SUB-HEADER BULLETIN */}
      <div className="bg-red-50 border-b border-rose-100 text-red-705 text-red-700 text-xs py-2.5 px-4 shadow-inner z-10 select-none overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 overflow-hidden flex-1">
            <span className="bg-red-600 text-white text-[9px] font-extrabold py-0.5 px-2 rounded-full uppercase shrink-0 z-10 shadow-sm animate-pulse">
              TIN NỔI BẬT
            </span>
            <div className="relative flex-1 overflow-hidden h-5 flex items-center">
              <div className="animate-marquee whitespace-nowrap font-bold flex gap-12 items-center text-red-750 text-red-705">
                <span>{tickers.join(" \u00a0\u00a0\u00a0\u00a5\u00a0 ★ \u00a0\u00a0\u00a0\u00a5\u00a0 ")}</span>
                <span>{tickers.join(" \u00a0\u00a0\u00a0\u00a5\u00a0 ★ \u00a0\u00a0\u00a0\u00a5\u00a0 ")}</span>
              </div>
            </div>
          </div>
          <span className="hidden md:inline-flex text-[10px] font-mono font-bold text-red-600 hover:underline cursor-pointer shrink-0 transition-colors">
            Xem tất cả ➔
          </span>
        </div>
      </div>

      {/* 5. HERO AUTO-PLAYING IMAGE SLIDESHOW */}
      <HeroSlideshow />

      {/* 6. PRIMARY NAVIGATION TABS (DESKTOP) */}
      <div className="bg-white border-b border-slate-200 select-none sticky top-18 z-30 shadow-xs hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <nav className="flex space-x-6">
            <button
              onClick={() => setActiveTab("intro")}
              className={`py-4 px-1.5 border-b-2 text-xs font-bold uppercase tracking-wider relative transition-all cursor-pointer ${
                activeTab === "intro" 
                  ? "border-blue-600 text-blue-600" 
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              GIỚI THIỆU TRƯỜNG
              {activeTab === "intro" && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600 rounded" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("admissions")}
              className={`py-4 px-1.5 border-b-2 text-xs font-bold uppercase tracking-wider relative transition-all cursor-pointer ${
                activeTab === "admissions" 
                  ? "border-blue-600 text-blue-600" 
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              THÔNG TIN TUYỂN SINH
              {activeTab === "admissions" && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600 rounded" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("news")}
              className={`py-4 px-1.5 border-b-2 text-xs font-bold uppercase tracking-wider relative transition-all cursor-pointer ${
                activeTab === "news" 
                  ? "border-blue-600 text-blue-600" 
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              TIN TỨC & SỰ KIỆN
              {activeTab === "news" && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600 rounded" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("alumni")}
              className={`py-4 px-1.5 border-b-2 text-xs font-bold uppercase tracking-wider relative transition-all cursor-pointer ${
                activeTab === "alumni" 
                  ? "border-blue-600 text-blue-600" 
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              CỰU SINH VIÊN (ALUMNI)
              {activeTab === "alumni" && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600 rounded" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("grades")}
              className={`py-4 px-1.5 border-b-2 text-xs font-bold uppercase tracking-wider relative transition-all cursor-pointer ${
                activeTab === "grades" 
                  ? "border-blue-600 text-blue-600" 
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              TRA CỨU ĐIỂM SỐ
              {activeTab === "grades" && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600 rounded" />
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* 7. PORTAL MAIN INTERACTIVE WORKSPACE CONTAINERS */}
      <main id="main-portal" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* TAB 1: INTRO (GIỚI THIỆU TRƯỜNG CHI TIẾT - KIẾN TRÚC MỚI) */}
        {activeTab === "intro" && (
          <div className="space-y-12">
            
            {/* Visual Grid: Introduction Quote & Campus highlight specs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
              <div className="lg:col-span-7 space-y-5">
                <span className="text-blue-650 text-blue-600 font-bold uppercase tracking-widest text-xs font-mono">CHÀO MỪNG ĐẾN VỚI HCMUTE</span>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-snug">
                  Đại Học Sư Phạm Kỹ Thuật TP.HCM — 60 Năm Đổi Mới và Phát Triển
                </h2>
                <div className="h-1 w-20 bg-blue-650 bg-blue-600 rounded" />
                
                <p className="text-slate-650 text-sm leading-relaxed font-normal">
                  Được thành lập từ năm 1962, Trường Đại học Sư phạm Kỹ thuật Thành phố Hồ Chí Minh tự hào là cái nôi đào tạo hàng vạn kỹ sư xuất sắc hàng đầu cả nước. Chúng tôi luôn vươn mình bứt phá vươn ra khu vực và thế giới nhờ đội ngũ giảng dạy hàng đầu cùng hệ thống xưởng hiện đại đạt chuẩn kiểm định AUN-QA.
                </p>

                {/* Slogan showcase block with high visual elegant style */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
                  <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200/50 hover:bg-slate-100/50 transition-colors text-center">
                    <h4 className="font-bold text-rose-600 text-[13px] uppercase tracking-wider">Nhân văn</h4>
                    <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">Tôn trọng từng giá trị nhân cách sống của sinh viên.</p>
                  </div>
                  <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200/50 hover:bg-slate-100/50 transition-colors text-center">
                    <h4 className="font-bold text-blue-600 text-[13px] uppercase tracking-wider">Sáng tạo</h4>
                    <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">Bùng cháy bứt phá bứt phá ý tưởng kỹ nghệ.</p>
                  </div>
                  <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200/50 hover:bg-slate-100/50 transition-colors text-center">
                    <h4 className="font-bold text-amber-650 text-amber-600 text-[13px] uppercase tracking-wider">Hội nhập</h4>
                    <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">Chuẩn đầu ra kiểm định quốc tế đỉnh cao.</p>
                  </div>
                </div>
              </div>

              {/* Sidebar Info Campus Photos representation */}
              <div className="lg:col-span-5 relative">
                <div className="absolute inset-0 bg-blue-600/10 rounded-2xl rotate-3 scale-102 pointer-events-none" />
                <div className="relative bg-slate-900 rounded-2xl border border-slate-250 overflow-hidden shadow-lg shadow-blue-900/10">
                  <img
                    src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80"
                    alt="Campus main tower block"
                    className="h-72 w-full object-cover object-center"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-900/50 to-transparent p-4 text-white">
                    <span className="text-[10px] text-amber-400 font-mono font-bold tracking-wider uppercase">TOÀN CẢNH TRƯỜNG</span>
                    <h3 className="font-bold text-sm mt-0.5">Tòa nhà Trung Tâm 15 tầng hiện đại nhất Thủ Đức</h3>
                    <p className="text-[11px] text-slate-350 mt-1 lines-clamp-2">Địa chỉ hành chính: Số 1 Đường Võ Văn Ngân, Phường Linh Chiểu, TP. Thủ Đức, TP. Hồ Chí Minh.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Statistics grid highlights */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center shadow-xs flex flex-col justify-center items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-blue-200 cursor-pointer">
                <div className="h-10 w-10 bg-blue-50 text-blue-650 rounded-xl flex items-center justify-center mb-3 text-blue-600">
                  <School className="h-6 w-6" />
                </div>
                <h4 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none block">28,000+</h4>
                <span className="text-[10px] md:text-xs font-mono font-bold text-slate-450 uppercase mt-1 tracking-wider text-slate-400">Sinh viên đại học</span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center shadow-xs flex flex-col justify-center items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-blue-200 cursor-pointer">
                <div className="h-10 w-10 bg-amber-50 text-amber-650 rounded-xl flex items-center justify-center mb-3 text-amber-600">
                  <Flame className="h-6 w-6" />
                </div>
                <h4 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none block">950+</h4>
                <span className="text-[10px] md:text-xs font-mono font-bold text-slate-450 uppercase mt-1 tracking-wider text-slate-400">Giảng viên & Giáo sư</span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center shadow-xs flex flex-col justify-center items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-blue-200 cursor-pointer">
                <div className="h-10 w-10 bg-pink-50 text-pink-650 rounded-xl flex items-center justify-center mb-3 text-pink-600">
                  <Award className="h-6 w-6" />
                </div>
                <h4 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none block">15</h4>
                <span className="text-[10px] md:text-xs font-mono font-bold text-slate-450 uppercase mt-1 tracking-wider text-slate-400">Khoa đào tạo trọng yếu</span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center shadow-xs flex flex-col justify-center items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-blue-200 cursor-pointer">
                <div className="h-10 w-10 bg-emerald-50 text-emerald-650 rounded-xl flex items-center justify-center mb-3 text-emerald-600">
                  <Globe className="h-6 w-6" />
                </div>
                <h4 className="text-2xl md:text-3xl font-black text-emerald-600 tracking-tight leading-none block">98.2%</h4>
                <span className="text-[10px] md:text-xs font-mono font-bold text-slate-450 uppercase mt-1 tracking-wider text-slate-400">Tốt nghiệp việc làm ngay</span>
              </div>

            </div>

            {/* List of 15 essential Faculties (Khoa đào tạo) with interactive visuals */}
            <div className="bg-slate-50 border border-slate-200/50 rounded-3xl p-6 md:p-8">
              <div className="flex items-center gap-2 border-b border-slate-200/60 pb-3.5 mb-6">
                <School className="h-5 w-5 text-blue-650 text-blue-600" />
                <h3 className="font-extrabold text-slate-800 text-lg md:text-xl">Các Khoa Đào Tạo Trọng Yếu Tại HCMUTE</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  "Khoa Cơ khí Động lực",
                  "Khoa Cơ khí Chế tạo máy",
                  "Khoa Điện - Điện tử",
                  "Khoa Công nghệ Thông tin",
                  "Khoa Kinh tế",
                  "Khoa Thời trang và Thiết kế",
                  "Khoa Khoa học Ứng dụng",
                  "Khoa Ngoại ngữ",
                  "Khoa Công nghệ Hóa học & Thực phẩm",
                  "Khoa Xây dựng",
                  "Khoa In và Truyền thông",
                  "Khoa Đào tạo Chất lượng cao"
                ].map((fac, fIdx) => (
                  <div
                    key={fIdx}
                    onClick={() => {
                      // Set admissions quick filter!
                      let searchKey = "Cơ khí";
                      if (fac.includes("Thông tin")) searchKey = "Thông tin";
                      if (fac.includes("Kinh tế")) searchKey = "Kinh tế";
                      if (fac.includes("Thời trang")) searchKey = "May";
                      if (fac.includes("Điện")) searchKey = "Điện";
                      setGlobalSearch(searchKey);
                      setActiveTab("admissions");
                      const sectionEl = document.getElementById("admissions-portal");
                      if (sectionEl) sectionEl.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="p-3.5 bg-white border border-slate-150 rounded-xl hover:border-blue-500 hover:shadow-sm cursor-pointer hover:bg-slate-50 transition-all text-xs font-semibold text-slate-700 flex items-center justify-between group"
                  >
                    <span>{fac}</span>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            </div>

            {/* TRUYỀN THÔNG & VIDEO ĐA PHƯƠNG TIỆN TRỰC QUAN */}
            <div id="multimedia-section" className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-200/60 pb-3 mb-4">
                <School className="h-5 w-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-800 text-lg md:text-xl">Truyền Thông & Video Trên Các Nền Tảng Của Trường</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Video Card 1 */}
                <div className="bg-white rounded-3xl border border-slate-150 p-4 shadow-sm flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="overflow-hidden rounded-2xl aspect-video bg-slate-950 relative border border-slate-100 shadow-inner">
                      <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/-I0U7jZ2lC8"
                        title="Phim giới thiệu HCMUTE"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <span className="text-red-600 font-bold uppercase tracking-widest text-[9px] font-mono block">HCMUTE-TV YOUTUBE</span>
                    <h4 className="font-bold text-sm text-slate-800 tracking-tight leading-snug">60 Năm Vinh Quang & Phát Triển — Tập Thể Sư Phạm Kỹ Thuật</h4>
                    <p className="text-slate-500 text-xs font-normal">Đoàn phim kênh truyền thông chính thức ghi dấu những cột mốc vàng son và tự hào của nhà trường.</p>
                  </div>
                  <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>Thời lượng: 12 phút</span>
                    <a href="https://youtube.com" target="_blank" referrerPolicy="no-referrer" className="text-blue-600 hover:underline">Xem trên YT →</a>
                  </div>
                </div>

                {/* Video Card 2 */}
                <div className="bg-white rounded-3xl border border-slate-150 p-4 shadow-sm flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="overflow-hidden rounded-2xl aspect-video bg-slate-950 relative border border-slate-100 shadow-inner">
                      <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/zH87nL8g4v8"
                        title="Hướng dẫn nộp hồ sơ xét tuyển học bạ"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <span className="text-blue-600 font-bold uppercase tracking-widest text-[9px] font-mono block">TUYỂN SINH PORTAL VIDEO</span>
                    <h4 className="font-bold text-sm text-slate-800 tracking-tight leading-snug">Cẩm Nang Hướng Dẫn Xét Học Bạ Đại Học Trực Tuyến 2026</h4>
                    <p className="text-slate-500 text-xs font-normal">Các bước chi tiết nhất giúp các sĩ tử đăng ký xét tuyển nguyện vọng đơn giản, chính xác.</p>
                  </div>
                  <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>Thời lượng: 5 phút</span>
                    <a href="https://youtube.com" target="_blank" referrerPolicy="no-referrer" className="text-blue-600 hover:underline">Xét tuyển trực tuyến →</a>
                  </div>
                </div>

                {/* Video Card 3: Military Education */}
                <div className="bg-white rounded-3xl border border-slate-150 p-4 shadow-sm flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="overflow-hidden rounded-2xl aspect-video bg-slate-950 relative border border-slate-100 shadow-inner">
                      <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/m6sZ47yvE-c"
                        title="Học kỳ quân sự GDQP"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <span className="text-emerald-600 font-bold uppercase tracking-widest text-[9px] font-mono block">CỘNG ĐỒNG AUDIO-VISUAL</span>
                    <h4 className="font-bold text-sm text-slate-800 tracking-tight leading-snug">Học Kỳ Quân Sự Đáng Nhớ — Bản Lĩnh & Đồng Đội Của Sinh Viên UTE</h4>
                    <p className="text-slate-500 text-xs font-normal">Lưu giữ trọn vẹn những thước phim tư liệu quý giá về tháng ngày rèn luyện ý chí, kỷ luật quân sự hào hùng.</p>
                  </div>
                  <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>Thời lượng: 8 phút</span>
                    <a href="https://youtube.com" target="_blank" referrerPolicy="no-referrer" className="text-blue-600 hover:underline">Khóa rèn luyện →</a>
                  </div>
                </div>

              </div>

              {/* DYNAMIC CAMPUS GALERY: NHIỀU HÌNH ẢNH HOẠT ĐỘNG KHÁC */}
              <div className="bg-slate-55 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-6 md:p-8 rounded-3xl mt-8">
                <span className="text-blue-600 font-bold uppercase tracking-widest text-[10px] font-mono block mb-2">ĐỜI SỐNG SINH VIÊN HCMUTE</span>
                <h4 className="font-extrabold text-slate-800 text-lg mb-6">Thư Viện Ảnh Hoạt Động & Nghiên Cứu Khoa Học Nổi Bật</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Image 1: Lab research */}
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between group">
                    <div className="h-32 overflow-hidden bg-slate-900">
                      <img
                        src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80"
                        alt="Nghiên cứu khoa học"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-3">
                      <h5 className="font-bold text-xs text-slate-800">Thực Hành Lab Tự Động Hóa</h5>
                      <p className="text-[10px] text-slate-450 text-slate-500 mt-1">Nơi sinh viên bứt phá kỹ nghệ, chế tạo và lập trình robot cánh tay sáu trục.</p>
                    </div>
                  </div>

                  {/* Image 2: Green Summer Mùa Hè Xanh */}
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between group">
                    <div className="h-32 overflow-hidden bg-slate-900">
                      <img
                        src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=400&q=80"
                        alt="Mùa hè xanh"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-3">
                      <h5 className="font-bold text-xs text-slate-800">Chiến Dịch Mùa Hè Xanh</h5>
                      <p className="text-[10px] text-slate-450 text-slate-500 mt-1">Đem kỹ nghệ và tấm lòng tình nguyện xây dựng nông thôn mới, cầu bê tông, hệ thống chiếu sáng.</p>
                    </div>
                  </div>

                  {/* Image 3: Student Sports */}
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between group">
                    <div className="h-32 overflow-hidden bg-slate-900">
                      <img
                        src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80"
                        alt="Hoạt động thể chất"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-3">
                      <h5 className="font-bold text-xs text-slate-800">Đại Hội Thể Thao Thường Niên</h5>
                      <p className="text-[10px] text-slate-450 text-slate-500 mt-1">Khơi dậy niềm rèn luyện thể chất, bóng chuyền, điền kinh và võ thuật cổ truyền bệ vệ.</p>
                    </div>
                  </div>

                  {/* Image 4: Graduation Ceremomy */}
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between group">
                    <div className="h-32 overflow-hidden bg-slate-900">
                      <img
                        src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=400&q=80"
                        alt="Lễ tốt nghiệp"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-3">
                      <h5 className="font-bold text-xs text-slate-800">Lễ Vinh Danh & Tốt Nghiệp</h5>
                      <p className="text-[10px] text-slate-450 text-slate-500 mt-1">Khoảnh khắc tự hào ôm trọn tấm bằng đại học và định vị tương lai hội nhập quốc tế.</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>



          </div>
        )}

        {/* TAB 2: ADMISSIONS (THÔNG TIN TUYỂN SINH CANVASSING SECTION) */}
        {activeTab === "admissions" && (
          <AdmissionsSection />
        )}

        {/* TAB 3: NEWS & EVENTS (TIN TỨC CỨ KHỞI TẬP VÀ ĐÔN ĐỐC) */}
        {activeTab === "news" && (
          <NewsEventsSection />
        )}

        {/* TAB 4: ALUMNI (CỰU SINH VIÊN QUYÊN CỰC KỲ KHANG TRANG) */}
        {activeTab === "alumni" && (
          <AlumniSection />
        )}

        {/* TAB 5: GRADES SYSTEM (TRA CỨU ĐIỂM SỐ KỲ PHÙ HỢP NHẤT) */}
        {activeTab === "grades" && (
          <GradingSystem loggedInProfile={authProfile} />
        )}

      </main>

      {/* 8. COMPLETE PREMIUM FOOTER */}
      <footer className="bg-slate-900 text-slate-450 text-slate-300 border-t border-slate-800 py-12 px-4 shadow-inner mt-16 select-none leading-relaxed">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Main info block */}
          <div className="space-y-4.5 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-amber-400 flex items-center justify-center font-bold text-slate-900 text-xs">
                SPK
              </div>
              <h2 className="text-slate-100 font-extrabold text-sm tracking-widest uppercase">
                TRƯỜNG ĐẠI HỌC SƯ PHẠM KỸ THUẬT TP.HCM
              </h2>
            </div>
            <p className="text-slate-400 text-xs font-normal max-w-md">
              Là biểu tượng tiên phong của giáo dục kỹ thuật hàng đầu đất nước, cam kết kiến tạo môi trường đổi mới sáng tạo thúc đẩy khát khao hội nhập thế giới dũng mãnh.
            </p>
            <div className="space-y-2.5 text-xs text-slate-300 font-normal">
              <span className="flex items-start gap-2.5">
                <MapPin className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
                <span>Số 1 Đường Võ Văn Ngân, Phường Linh Chiểu, Thành phố Thủ Đức, Thành phố Hồ Chí Minh.</span>
              </span>
              <span className="flex items-start gap-2.5">
                <Phone className="h-4.5 w-4.5 text-blue-400 shrink-0 mt-0.5" />
                <span>+84-28-3722 1223 — Tổng đài giải đáp thủ tục</span>
              </span>
              <span className="flex items-start gap-2.5">
                <Mail className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>ic@hcmute.edu.vn — Thư kỹ thuật quốc tế</span>
              </span>
            </div>
          </div>

          {/* Useful categories link */}
          <div className="space-y-4">
            <h4 className="text-slate-200 font-bold text-xs font-mono uppercase tracking-widest">Dành Cho Thí Sinh</h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-normal">
              <li>
                <button onClick={() => { setActiveTab("admissions"); }} className="hover:text-amber-400 hover:underline cursor-pointer transition-colors text-left">
                  Tải cẩm nang tuyển sinh 2026 (PDF)
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab("admissions"); }} className="hover:text-amber-400 hover:underline cursor-pointer transition-colors text-left">
                  Đăng ký xét tuyển học bạ trực tuyến
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab("admissions"); }} className="hover:text-amber-400 hover:underline cursor-pointer transition-colors text-left">
                  AI match chọn ngành tương thích năng lực
                </button>
              </li>
              <li>
                <a href="https://hcmute.edu.vn" target="_blank" referrerPolicy="no-referrer" className="hover:text-amber-400 hover:underline inline-flex items-center gap-1">
                  <span>Hệ thống Đăng ký tham quan thực tế</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Useful categories link 2 */}
          <div className="space-y-4">
            <h4 className="text-slate-200 font-bold text-xs font-mono uppercase tracking-widest">Dịch Vụ Sinh Viên</h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-normal">
              <li>
                <button onClick={() => { setActiveTab("grades"); }} className="hover:text-amber-400 hover:underline cursor-pointer transition-colors text-left">
                  Tra cứu bảng điểm & GPA học kỳ
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab("alumni"); }} className="hover:text-amber-400 hover:underline cursor-pointer transition-colors text-left">
                  Tìm kiếm Mentors cựu sinh viên
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab("alumni"); }} className="hover:text-amber-400 hover:underline cursor-pointer transition-colors text-left">
                  Danh sách việc làm cựu sinh viên đề xuất
                </button>
              </li>
              <li>
                <a href="#rules" onClick={(e) => { e.preventDefault(); alert("Hướng dẫn Quy chế Đào tạo 2026 đã được đồng bộ hóa trên Email portal chính thức."); }} className="hover:text-amber-400 hover:underline">
                  Quy chế Đào tạo tín chỉ năm học mới
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 font-mono flex flex-col md:flex-row items-center justify-between gap-4 select-none">
          <p>© 2026 Bản quyền thuộc Trường Đại học Sư phạm Kỹ thuật TP.HCM. Bảo lưu mọi quyền.</p>
          <div className="flex gap-4.5">
            <a href="#privacy" className="hover:text-white transition-colors">Điều khoản riêng tư</a>
            <a href="#security" className="hover:text-white transition-colors">An toàn thông tin</a>
            <a href="#contact" className="hover:text-white transition-colors">Yêu cầu hỗ trợ IT</a>
          </div>
        </div>
      </footer>

      {/* 9. DIALOGS, MODALS, OVERLAYS */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
}
