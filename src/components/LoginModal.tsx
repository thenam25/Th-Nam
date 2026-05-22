/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Lock, User, Sparkles, Award, ShieldCheck, CheckCircle2, ChevronRight, Bookmark, BookOpen, AlertCircle } from "lucide-react";
import { MAJORS_DATA } from "../data";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Extended login success callback to support custom register details
  onLoginSuccess: (userName: string, role: string, id: string, major?: string) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  
  // Login fields
  const [role, setRole] = useState("student");
  const [username, setUsername] = useState("22110123");
  const [password, setPassword] = useState("123456");
  const [loginError, setLoginError] = useState("");

  // Registration fields
  const [regMssv, setRegMssv] = useState("");
  const [regName, setRegName] = useState("");
  const [regMajor, setRegMajor] = useState(MAJORS_DATA[0].name);
  const [regPassword, setRegPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccessMsg, setRegisterSuccessMsg] = useState("");

  // High polish congratulations experience states
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [resolvedName, setResolvedName] = useState("");
  const [resolvedRole, setResolvedRole] = useState("student");
  const [resolvedId, setResolvedId] = useState("");
  const [resolvedMajor, setResolvedMajor] = useState("");

  // Clean form states when opened/closed
  useEffect(() => {
    if (isOpen) {
      setLoginError("");
      setRegisterError("");
      setRegisterSuccessMsg("");
      setActiveTab("login");
      setRole("student");
      setUsername("22110123");
      setPassword("123456");
      setRegMssv("");
      setRegName("");
      setRegPassword("");
    }
  }, [isOpen]);

  // Helper to load registered accounts from local storage
  const getRegisteredAccounts = (): any[] => {
    try {
      const stored = localStorage.getItem("hcmute_registered_accounts");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Helper to save a registered account
  const saveRegisteredAccount = (account: any) => {
    try {
      const current = getRegisteredAccounts();
      // Remove any existing duplicate just in case
      const filtered = current.filter((acc) => acc.id !== account.id);
      filtered.push(account);
      localStorage.setItem("hcmute_registered_accounts", JSON.stringify(filtered));
    } catch (e) {
      console.error("Local storage error:", e);
    }
  };

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    setLoginError("");
    if (newRole === "student") {
      setUsername("22110123");
    } else if (newRole === "alumni") {
      setUsername("16110IT2");
    } else {
      setUsername("Lecturer_SPK");
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    setTimeout(() => {
      setLoading(false);

      // 1. Check if it's matching custom registered accounts in local storage
      const registered = getRegisteredAccounts();
      const matched = registered.find((acc) => acc.id === cleanUsername);

      if (matched) {
        if (matched.password === cleanPassword || cleanPassword === "123456" || cleanPassword === "••••••••") {
          setResolvedName(matched.name);
          setResolvedId(matched.id);
          setResolvedRole(matched.role || "student");
          setResolvedMajor(matched.major || "");
          setShowCelebration(true);
          return;
        } else {
          setLoginError("Mật khẩu tài khoản đăng ký không chính xác. Mặc định là pass của bạn.");
          return;
        }
      }

      // 2. Check traditional demo/showcase accounts
      let finalName = "";
      let finalId = cleanUsername;
      
      if (cleanUsername === "22110123" && role === "student") {
        finalName = "Vũ Nguyễn Minh Quân";
      } else if (cleanUsername === "23110234" && role === "student") {
        finalName = "Lê Minh Phương Thảo";
      } else if (cleanUsername === "16110IT2" && role === "alumni") {
        finalName = "Trần Thị Mai Anh";
      } else if (cleanUsername === "Lecturer_SPK" && role === "faculty") {
        finalName = "PGS. TS. Nguyễn Văn Lớn";
      }

      if (finalName) {
        setResolvedName(finalName);
        setResolvedId(finalId);
        setResolvedRole(role);
        setResolvedMajor(role === "student" ? "Công nghệ Kỹ thuật Ô tô" : "");
        setShowCelebration(true);
      } else {
        // Fallback procedural login: If they typed an arbitrary student ID, allow it!
        if (role === "student" && /^\d+$/.test(cleanUsername) && cleanUsername.length >= 5) {
          // Generate a professional procedural name
          setResolvedName("Sinh Viên Tự Do (#" + cleanUsername.slice(-4) + ")");
          setResolvedId(cleanUsername);
          setResolvedRole("student");
          setResolvedMajor("Công nghệ Thông tin");
          setShowCelebration(true);
        } else {
          setLoginError("Tên đăng nhập demo không trùng khớp. Vui lòng thử đăng ký tài khoản mới!");
        }
      }
    }, 1000);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterSuccessMsg("");

    const mssvClean = regMssv.trim();
    const nameClean = regName.trim();
    const passwordClean = regPassword.trim();

    if (!mssvClean || !nameClean || !passwordClean) {
      setRegisterError("Vui lòng nhập đầy đủ các trường thông tin!");
      return;
    }

    if (!/^\d+$/.test(mssvClean) || mssvClean.length < 5) {
      setRegisterError("Mã số sinh viên (MSSV) phải là định dạng số, từ 5 ký tự trở lên!");
      return;
    }

    // Check conflict with existing demo student accounts
    if (mssvClean === "22110123" || mssvClean === "23110234") {
      setRegisterError("Mã số sinh viên (MSSV) này trùng với tài khoản demo có sẵn!");
      return;
    }

    // Check conflict in local storage
    const list = getRegisteredAccounts();
    if (list.some((acc) => acc.id === mssvClean)) {
      setRegisterError("MSSV này đã được đăng ký tài khoản trước đó!");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      const newAccount = {
        id: mssvClean,
        name: nameClean,
        major: regMajor,
        password: passwordClean,
        role: "student"
      };

      // Save to localStorage database
      saveRegisteredAccount(newAccount);

      // Immediately log the newly registered user into celebration mode
      setResolvedName(nameClean);
      setResolvedId(mssvClean);
      setResolvedRole("student");
      setResolvedMajor(regMajor);
      setShowCelebration(true);
    }, 1200);
  };

  const handleCloseCelebration = () => {
    setShowCelebration(false);
    onLoginSuccess(resolvedName, resolvedRole, resolvedId, resolvedMajor);
    onClose();
  };

  // Pre-configured particles for the congrats overlay
  const particles = Array.from({ length: 18 });

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="login-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto">
          {/* Backdrop Glass blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!showCelebration ? onClose : undefined}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
          />

          {/* Celebration Screen */}
          <AnimatePresence>
            {showCelebration && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-55 flex items-center justify-center bg-slate-950/90 overflow-hidden"
              >
                {/* Simulated colorful explosive confetti */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {particles.map((_, i) => {
                    const delay = i * 0.12;
                    const rotate = i * 20;
                    const scale = 0.5 + Math.random() * 0.8;
                    const colors = ["bg-amber-400", "bg-blue-400", "bg-rose-500", "bg-emerald-400", "bg-purple-500"];
                    const randomColor = colors[i % colors.length];

                    return (
                      <motion.div
                        key={i}
                        initial={{ y: "110%", x: `${10 + Math.random() * 80}%`, opacity: 0, rotate: 0 }}
                        animate={{
                          y: ["100%", `${20 + Math.random() * 40}%`, "110%"],
                          x: ["50%", `${20 + Math.random() * 60}%`],
                          opacity: [0, 1, 1, 0],
                          rotate: [0, rotate, rotate * 1.5]
                        }}
                        transition={{
                          duration: 4.5,
                          repeat: Infinity,
                          repeatDelay: Math.random() * 2,
                          delay,
                          ease: "easeOut"
                        }}
                        className={`absolute h-3 w-3 rounded-sm ${randomColor}`}
                        style={{ scale }}
                      />
                    );
                  })}
                </div>

                {/* Sparkling SVG background stars */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                  <div className="absolute top-1/4 left-1/5 animate-pulse text-amber-300">✦</div>
                  <div className="absolute top-1/3 right-1/4 animate-bounce text-blue-350">✦</div>
                  <div className="absolute bottom-1/4 left-1/3 text-emerald-300 animate-pulse">✦</div>
                  <div className="absolute bottom-1/3 right-1/5 text-rose-300">✦</div>
                </div>

                {/* Main Card with beautiful floating ID and subtle 3D feel */}
                <motion.div
                  initial={{ scale: 0.85, y: 50, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="w-full max-w-md p-6 bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-amber-400 rounded-3xl text-center text-white relative shadow-2xl shadow-amber-500/10"
                >
                  {/* Digital Signature */}
                  <div className="absolute top-4 right-4 pointer-events-none bg-amber-400/10 text-amber-400 py-1 px-2.5 rounded-full font-mono text-[9px] font-extrabold tracking-widest uppercase border border-amber-400/20">
                    PORTAL VALID
                  </div>

                  <div className="mx-auto h-16 w-16 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center shadow-lg shadow-amber-400/20 mb-5 animate-bounce">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>

                  <span className="text-[10px] text-amber-400 uppercase tracking-widest font-bold block font-mono">
                    CHÚC MỪNG HOÀN TẤT THỦ TỤC PORTAL!
                  </span>

                  {/* Digital Student ID Badge details */}
                  <div className="my-6 bg-slate-950/60 p-5 rounded-2xl border border-slate-800 text-left relative overflow-hidden backdrop-blur-md">
                    <div className="flex gap-4 items-center">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-amber-400 to-blue-500 p-0.5 flex items-center justify-center font-black text-slate-900 text-base">
                        <div className="bg-slate-900 text-white rounded-full h-full w-full flex items-center justify-center">
                          {resolvedName[0] || "U"}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-white tracking-tight">{resolvedName}</h4>
                        <p className="text-xs text-slate-400 font-mono mt-0.5 uppercase">
                          Mã định danh (MSSV): <span className="text-amber-400 font-bold">{resolvedId}</span>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-900 text-xs">
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-mono tracking-wider block">PHÂN QUYỀN PORTAL</span>
                        <span className="font-bold text-blue-400 text-xs block pl-1 mt-0.5 uppercase">
                          {resolvedRole === "student" ? "Sinh Viên SPK" : resolvedRole === "alumni" ? "Cựu Sinh Viên" : "Cán Bộ Giảng Viên"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-mono tracking-wider block">CHUYÊN NGÀNH CHÍNH</span>
                        <span className="text-emerald-400 font-semibold block mt-0.5 truncate pl-1" title={resolvedMajor}>
                          {resolvedMajor || "Chưa thiết lập"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6">
                    Bây giờ bạn có thể trải nghiệm toàn bộ tính năng gia nhập Mentorship, tra cứu học bạ nâng cao, cập nhật thông báo tuyển sinh đặc quyền.
                  </p>

                  <button
                    onClick={handleCloseCelebration}
                    id="btn-close-celebration"
                    className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl font-bold text-xs tracking-wider transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1"
                  >
                    <span>GIA NHẬP TRANG PORTAL</span>
                    <ChevronRight className="h-4.5 w-4.5" />
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Standard Form Modal representation */}
          {!showCelebration && (
            <motion.div
              initial={{ scale: 0.9, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 15, opacity: 0 }}
              className="relative w-full max-w-md mx-4 bg-white rounded-3xl overflow-hidden shadow-2xl z-50 border border-slate-100 my-8"
            >
              {/* Decorative top header banner matching HCMUTE branding */}
              <div className="h-2.5 bg-gradient-to-r from-blue-600 via-rose-500 to-amber-400" />

              <div className="p-6 relative">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="text-center mt-2.5 mb-5">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                    <Bookmark className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Cổng thông tin HCMUTE-Portal</h3>
                  <p className="text-slate-400 mt-1 text-xs">Vui lòng lựa chọn tác vụ đăng nhập hoặc đăng ký thành viên chính thức.</p>
                </div>

                {/* Switch Login vs Register */}
                <div className="grid grid-cols-2 gap-1 px-1 py-1 bg-slate-100 rounded-xl mb-6">
                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className={`py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                      activeTab === "login" ? "bg-white text-blue-600 shadow-sm font-extrabold" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    ĐĂNG NHẬP
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("register");
                      setRegisterError("");
                      setRegisterSuccessMsg("");
                    }}
                    className={`py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                      activeTab === "register" ? "bg-white text-blue-600 shadow-sm font-extrabold" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    ĐĂNG KÝ MỚI
                  </button>
                </div>

                {activeTab === "login" ? (
                  <>
                    {/* Role Switch Tabs */}
                    <div className="grid grid-cols-3 gap-1 px-1 py-1 bg-slate-50 border border-slate-150 rounded-lg">
                      <button
                        type="button"
                        onClick={() => handleRoleChange("student")}
                        className={`py-1.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          role === "student" ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Sinh viên
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRoleChange("alumni")}
                        className={`py-1.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          role === "alumni" ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Cựu SV
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRoleChange("faculty")}
                        className={`py-1.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          role === "faculty" ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Cán bộ
                      </button>
                    </div>

                    {/* Form Login */}
                    <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
                      {loginError && (
                        <div className="p-2.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium flex items-center gap-1.5">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>{loginError}</span>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider font-mono">Tên đăng nhập / MSSV</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-2 pl-9 pr-4 text-xs font-semibold text-slate-800 outline-none"
                            placeholder="Nhập MSSV (22110123) hoặc cán bộ..."
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider font-mono">Mật khẩu cá nhân</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-2 pl-9 pr-4 text-xs font-mono text-slate-800 outline-none"
                            placeholder="Nhập mật khẩu (demo lấy bất kỳ hoặc 123456)"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <label className="flex items-center gap-1 text-slate-500 cursor-pointer select-none">
                          <input type="checkbox" defaultChecked className="rounded accent-blue-600 scale-90" />
                          <span>Ghi nhớ phiên đăng nhập</span>
                        </label>
                        <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Hệ thống khôi phục mật khẩu mã Pin thông qua email sinh viên đăng ký tại trường. Vui lòng liên hệ Phòng Đào Tạo."); }} className="text-blue-600 hover:underline">
                          Quên mật khẩu?
                        </a>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-xs font-bold shadow-md shadow-blue-600/10 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {loading ? (
                          <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        ) : (
                          <>
                            <ShieldCheck className="h-4 w-4" />
                            <span>ĐĂNG NHẬP PORTAL</span>
                          </>
                        )}
                      </button>
                    </form>
                  </>
                ) : (
                  /* Form Register */
                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                    {registerError && (
                      <div className="p-2.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{registerError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider font-mono">Nhập mã số sinh viên (MSSV)</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={regMssv}
                          onChange={(e) => setRegMssv(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-2 pl-9 pr-4 text-xs font-semibold text-slate-800 outline-none"
                          placeholder="Ví dụ: 23110555 (chỉ nhập số)"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider font-mono">Họ và tên đầy đủ</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-2 pl-9 pr-4 text-xs font-semibold text-slate-800 outline-none"
                          placeholder="Ví dụ: Nguyễn Văn A"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider font-mono">Chọn chuyên ngành tuyển sinh</label>
                      <div className="relative">
                        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <select
                          value={regMajor}
                          onChange={(e) => setRegMajor(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-2 pl-9 pr-4 text-xs font-semibold text-slate-850 outline-none appearance-none cursor-pointer"
                        >
                          {MAJORS_DATA.map((maj) => (
                            <option key={maj.id} value={maj.name}>
                              {maj.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider font-mono">Thiết lập mật khẩu</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="password"
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-2 pl-9 pr-4 text-xs font-mono text-slate-800 outline-none"
                          placeholder="Mật khẩu của bạn"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-emerald-600 hover:bg-emerald-750 text-white rounded-xl py-2.5 text-xs font-bold shadow-md shadow-emerald-600/10 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-5"
                    >
                      {loading ? (
                        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          <span>HOÀN TẤT ĐĂNG KÝ HỌC VIÊN</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                <div className="mt-5 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-4">
                  <p>Hệ thống hỗ trợ bảo mật mã hóa SSL/TLS SHA-256 an toàn.</p>
                  <p className="mt-0.5">© 2026 Trung tâm CNTT & Truyền thông HCMUTE.</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
