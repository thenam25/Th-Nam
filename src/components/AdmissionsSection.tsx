/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MAJORS_DATA } from "../data";
import { Major } from "../types";
import { BookOpen, Calculator, Compass, Sparkles, Award, Star, PhoneCall, Check, Zap, ArrowRight, CornerDownRight } from "lucide-react";

export default function AdmissionsSection() {
  const [selectedMajor, setSelectedMajor] = useState<Major | null>(MAJORS_DATA[0]);
  const [searchWord, setSearchWord] = useState("");

  // Counselor / Diagnostic States
  const [subjectsChoice, setSubjectsChoice] = useState("Math-Physics");
  const [interestChoice, setInterestChoice] = useState("Computers");
  const [scoreChoice, setScoreChoice] = useState(25);
  const [matchedMajors, setMatchedMajors] = useState<Major[]>([]);
  const [consulted, setConsulted] = useState(false);

  // Filters majors based on index search
  const filteredMajors = MAJORS_DATA.filter((m) =>
    m.name.toLowerCase().includes(searchWord.toLowerCase()) ||
    m.code.includes(searchWord) ||
    m.faculty.toLowerCase().includes(searchWord.toLowerCase())
  );

  const handleConsultDiagnostic = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to select recommended majors based on answers
    let recommendations: Major[] = [];

    if (interestChoice === "Computers") {
      recommendations = MAJORS_DATA.filter((m) => m.id === "it" || m.id === "mechatronics" || m.id === "ee");
    } else if (interestChoice === "Automotive") {
      recommendations = MAJORS_DATA.filter((m) => m.id === "auto" || m.id === "mechatronics");
    } else if (interestChoice === "Fashion") {
      recommendations = MAJORS_DATA.filter((m) => m.id === "garment");
    } else if (interestChoice === "Logistics") {
      recommendations = MAJORS_DATA.filter((m) => m.id === "logistics");
    } else if (interestChoice === "Automation") {
      recommendations = MAJORS_DATA.filter((m) => m.id === "mechatronics" || m.id === "ee" || m.id === "auto");
    }

    // Filter by score threshold (if cutOffScore <= studentScore + 2, range recommendation)
    const finalMatches = recommendations.filter(
      (m) => m.cutOffScore2025 <= scoreChoice + 2.5
    );

    // Fallback if none matched
    setMatchedMajors(finalMatches.length > 0 ? finalMatches : MAJORS_DATA.slice(0, 2));
    setConsulted(true);
  };

  return (
    <div id="admissions-portal" className="space-y-12">
      {/* SECTION 1: METHODOLOGY SCHEMES (4 PHƯƠNG THỨC XÉT TUYỂN) */}
      <div>
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-red-500 font-bold uppercase tracking-widest text-xs font-mono">XÉT TUYỂN CHÍNH QUY 2026</span>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1.5">
            Các Phương Thức Tuyển Sinh Đại Học Chính Quy
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Trường áp dụng linh hoạt tổ hợp phương thức xét tuyển đa chiều giúp tối ưu cơ hội trúng tuyển của thí sinh tài năng.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-b from-blue-50/50 to-white border border-blue-100 rounded-2xl p-5 hover:shadow-md transition-all duration-300">
            <div className="h-10 w-10 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-blue-600/10 mb-4">
              PT1
            </div>
            <h3 className="font-bold text-slate-800 text-base">Xét Điểm Thi THPT Quốc Gia</h3>
            <p className="text-slate-500 text-xs leading-relaxed mt-2">
              Sử dụng tổng điểm 3 bài thi kỳ thi tốt nghiệp THPT theo các tổ hợp xét tuyển tương ứng của từng ngành.
            </p>
            <div className="mt-4 flex items-center text-xs font-bold text-blue-600 gap-1.5 select-none">
              <span>Đại học chính quy</span>
              <Award className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="bg-gradient-to-b from-pink-50/50 to-white border border-pink-100 rounded-2xl p-5 hover:shadow-md transition-all duration-300">
            <div className="h-10 w-10 rounded-xl bg-pink-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-pink-600/10 mb-4">
              PT2
            </div>
            <h3 className="font-bold text-slate-800 text-base">Xét Kết Quả Học Bạ THPT</h3>
            <p className="text-slate-500 text-xs leading-relaxed mt-2">
              Xét tuyển dựa trên điểm trung bình học tập 5 học kỳ lớp 10, 11 và học kỳ 1 lớp 12 đạt từ 7.0 điểm trở lên.
            </p>
            <div className="mt-4 flex items-center text-xs font-bold text-pink-600 gap-1.5 select-none">
              <span>Nộp hồ sơ trực tuyến</span>
              <BookOpen className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="bg-gradient-to-b from-amber-50/50 to-white border border-amber-100 rounded-2xl p-5 hover:shadow-md transition-all duration-300">
            <div className="h-10 w-10 rounded-xl bg-amber-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-amber-600/10 mb-4">
              PT3
            </div>
            <h3 className="font-bold text-slate-800 text-base">Đánh Giá Năng Lực ĐHQG</h3>
            <p className="text-slate-500 text-xs leading-relaxed mt-2">
              Sử dụng điểm thi đánh giá năng lực do Đại học Quốc gia TP.HCM tổ chức trong năm 2026 đạt ngưỡng tối thiểu quy định.
            </p>
            <div className="mt-4 flex items-center text-xs font-bold text-amber-600 gap-1.5 select-none">
              <span>Điểm đợt 1 & đợt 2</span>
              <Zap className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="bg-gradient-to-b from-emerald-50/50 to-white border border-emerald-100 rounded-2xl p-5 hover:shadow-md transition-all duration-300">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-emerald-600/10 mb-4">
              PT4
            </div>
            <h3 className="font-bold text-slate-800 text-base">Ưu Tiên Tuyển Thẳng & IELTS</h3>
            <p className="text-slate-500 text-xs leading-relaxed mt-2">
              Cơ chế ưu tiên nộp chứng chỉ IELTS 학 thuật đạt từ 5.5 kết hợp bằng tốt nghiệp THPT, học sinh giỏi quốc gia.
            </p>
            <div className="mt-4 flex items-center text-xs font-bold text-emerald-600 gap-1.5 select-none">
              <span>Tuyển thẳng học sinh chuyên</span>
              <Sparkles className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: MAJORS LIST WITH INTERACTIVE DETAILS VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Major list select */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 font-mono">Tìm kiếm nhanh ngành học</label>
            <input
              type="text"
              placeholder="Nhập tên ngành, mã ngành hoặc khoa..."
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              className="w-full bg-white border border-slate-250 py-2.5 px-3.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl text-xs font-medium text-slate-800 outline-none"
            />
          </div>

          <div className="max-h-[460px] overflow-y-auto space-y-2.5 pr-2">
            {filteredMajors.map((major) => {
              const isSelected = selectedMajor?.id === major.id;
              return (
                <button
                  key={major.id}
                  id={`btn-major-${major.id}`}
                  onClick={() => setSelectedMajor(major)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/10"
                      : "bg-white border-slate-100 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <div>
                    <span className={`text-[10px] font-mono tracking-wider font-semibold block uppercase mb-1 ${
                      isSelected ? "text-blue-200" : "text-blue-600"
                    }`}>
                      MÃ NGÀNH: {major.code}
                    </span>
                    <h4 className="font-bold text-sm leading-tight">{major.name}</h4>
                    <span className={`text-xs block mt-0.5 ${
                      isSelected ? "text-slate-200" : "text-slate-400"
                    }`}>
                      {major.faculty}
                    </span>
                  </div>
                  <ArrowRight className={`h-4 w-4 shrink-0 transition-transform ${
                    isSelected ? "translate-x-1 text-white" : "text-slate-300"
                  }`} />
                </button>
              );
            })}
            
            {filteredMajors.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-6">Không tìm thấy mã ngành tương thích.</p>
            )}
          </div>
        </div>

        {/* Right column: Selected Major Details Sheet */}
        <div className="lg:col-span-7">
          {selectedMajor ? (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
              {/* Header Info */}
              <div className="border-b border-slate-150 pb-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border-amber-200 rounded text-[10px] font-mono font-bold">
                    KỲ TUYỂN SINH 2026
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Thời gian đào tạo: {selectedMajor.duration} năm (Kỹ sư/Cử nhân)</span>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-3 leading-tight">{selectedMajor.name}</h3>
                <span className="text-xs font-semibold text-blue-600 mt-1 block">{selectedMajor.faculty}</span>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider font-semibold">Tóm tắt đào tạo</h4>
                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed font-normal">{selectedMajor.description}</p>
              </div>

              {/* Admission Criteria statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">ĐIỂM CHUẨN ĐẦU VÀO 2025</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-rose-600">{selectedMajor.cutOffScore2025.toFixed(2)}</span>
                    <span className="text-xs font-mono text-slate-400">điểm (THPT)</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">TỔ HỢP XÉT TUYỂN</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedMajor.highschoolCombi.map((combi) => (
                      <span key={combi} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 font-bold font-mono text-[11px] rounded shadow-sm">
                        {combi}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Highlights Bullet-points */}
              <div>
                <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider font-semibold mb-3">Lợi ích & Điểm cộng ngành học</h4>
                <ul className="space-y-2.5 text-xs">
                  {selectedMajor.highlightPoints.map((point, index) => (
                    <li key={index} className="flex gap-2.5 leading-relaxed text-slate-600">
                      <div className="h-5 w-5 shrink-0 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="font-medium">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Core Admission hotline */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-blue-50/50 p-4 rounded-xl">
                <div className="text-center sm:text-left">
                  <h5 className="text-xs font-bold text-slate-800">Cần tư vấn trực tiếp về ngành học này?</h5>
                  <p className="text-[11px] text-slate-500">Đội ngũ thầy cô luôn sẵn sàng giải đáp thắc mắc của bạn.</p>
                </div>
                <a
                  href="tel:02837225724"
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 px-3.5 text-xs font-bold shadow-sm cursor-pointer transition-all active:scale-95 text-center"
                >
                  <PhoneCall className="h-4.5 w-4.5" />
                  <span>028 3722 5724</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 border border-slate-200 rounded-2xl">
              <Compass className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-500 mt-2">Vui lòng chọn một ngành học bên trái để xem thông tin chi tiết.</p>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: MATCH DIAGNOSTIC COUNSELOR TOOL (TƯ VẤN HƯỚNG NGHIỆP THÔNG MINH) */}
      <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 md:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 bottom-0 pointer-events-none opacity-5 translate-x-12 translate-y-12">
          <Calculator className="h-64 w-64" />
        </div>

        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold mb-3">
            <Compass className="h-3.5 w-3.5 text-blue-400" />
            <span>AI COUNSELOR - HỖ TRỢ CHỌN NGÀNH</span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight">Trắc Nghiệm Hướng Nghiệp & Chọn Ngành Thích Hợp</h3>
          <p className="text-slate-350 text-xs md:text-sm mt-1.5 leading-relaxed">
            Bạn băn khoăn chưa biết chọn ngành nào của HCMUTE? Hãy hoàn tất 3 câu hỏi nhanh dưới đây để hệ thống sàng lọc ngành phù hợp nhất với năng lực và sở thích của bạn.
          </p>
        </div>

        {/* Diagnostic Form details */}
        <form onSubmit={handleConsultDiagnostic} className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">1. Thế mạnh môn học</label>
            <select
              value={subjectsChoice}
              onChange={(e) => setSubjectsChoice(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg text-xs font-medium p-2.5 outline-none cursor-pointer focus:border-blue-500"
            >
              <option value="Math-Physics">Toán + Vật lý (A00, A01)</option>
              <option value="Math-English">Toán + Tiếng Anh (D01, D07)</option>
              <option value="Math-Chemistry">Toán + Hóa học/Sinh học</option>
              <option value="Language">Văn học + Ngoại ngữ</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">2. Sở thích cá nhân</label>
            <select
              value={interestChoice}
              onChange={(e) => setInterestChoice(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg text-xs font-medium p-2.5 outline-none cursor-pointer focus:border-blue-500"
            >
              <option value="Computers">Lập trình phần mềm, CNTT, AI</option>
              <option value="Automotive">Học về Cơ khí, động cơ Ô tô</option>
              <option value="Automation">Tìm hiểu Robot, mạch điện tự động</option>
              <option value="Fashion">Thiết kế thời trang, may mặc</option>
              <option value="Logistics">Phân phối hàng hóa, Kinh tế</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">3. Điểm thi ước tính ({scoreChoice} đ)</label>
            <div className="flex items-center gap-2.5">
              <input
                type="range"
                min="18"
                max="30"
                step="0.5"
                value={scoreChoice}
                onChange={(e) => setScoreChoice(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-stretch justify-stretch">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 px-4 text-xs font-bold mt-5 md:mt-0 shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Compass className="h-4 w-4" />
              <span>Gợi ý ngành học</span>
            </button>
          </div>
        </form>

        {/* Recommendations list */}
        {consulted && (
          <div className="mt-8 bg-slate-800/50 p-5 rounded-xl border border-slate-700/60 max-w-4xl">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-700/50 pb-2 mb-3">
              <Star className="h-4.5 w-4.5 text-amber-400 fill-amber-400" />
              <span>Gợi Ý Ngành Học Phù Hợp Cho Khả Năng Của Bạn:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {matchedMajors.map((m) => (
                <div key={m.id} className="bg-slate-900 border border-slate-850 p-4 rounded-lg flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-blue-400 font-mono">Mã ngành: {m.code}</span>
                    <h5 className="font-bold text-sm text-white mt-0.5">{m.name}</h5>
                    <p className="text-[11px] text-slate-400 mt-1 lines-clamp-2 leading-relaxed">{m.description}</p>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-slate-850/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">Điểm chuẩn: <strong className="text-red-400">{m.cutOffScore2025}</strong></span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMajor(m);
                        const sectionEl = document.getElementById("admissions-portal");
                        if (sectionEl) sectionEl.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-0.5 cursor-pointer hover:underline"
                    >
                      <span>Xem tuyển sinh</span>
                      <CornerDownRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
