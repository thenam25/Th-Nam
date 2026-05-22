/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ALUMNI_DATA } from "../data";
import { Alumnus } from "../types";
import { GraduationCap, Briefcase, Award, MessageCircleCode, CheckCircle2, Star, ShieldCheck, Mail, Send, ChevronRight } from "lucide-react";

interface AlumnusJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  postedBy: string;
  role: string;
}

const ALUMNI_JOBS: AlumnusJob[] = [
  {
    id: "job1",
    title: "Thực tập sinh Thiết kế Hệ thống Pin Xe điện",
    company: "VinFast Việt Nam",
    location: "Cát Hải, Hải Phòng (Cơ chế hỗ trợ KTX)",
    salary: "8,000,000 - 10,000,000 VND",
    postedBy: "Nguyễn Hoàng Nam (Khóa 2014)",
    role: "Học tập nghiên cứu tối ưu hóa nhiệt độ Cell pin lithium"
  },
  {
    id: "job2",
    title: "Kỹ sư nhúng tự động hóa & Robot (Junior Embedded Developer)",
    company: "TechVina Automation Jsc",
    location: "Khu Công Nghệ Cao Q.9, TP.HCM",
    salary: "15,000,000 - 22,000,000 VND",
    postedBy: "Lê Quốc Bảo (Khóa 2012)",
    role: "Lập trình thiết kế hệ thống cánh tay điều khiển 4 trục thông minh"
  },
  {
    id: "job3",
    title: "Thực tập sinh Trí Tuệ Nhân Tạo (AI Engineering Intern)",
    company: "Google Partner / AI Hub Vietnam",
    location: "Quận 1, TP. Hồ Chí Minh",
    salary: "Thỏa thuận hấp dẫn + Hỗ trợ máy tính",
    postedBy: "Trần Thị Mai Anh (Khóa 2016)",
    role: "Phát triển xử lý ngôn ngữ tự nhiên Tiếng Việt"
  }
];

export default function AlumniSection() {
  const [selectedAlumnus, setSelectedAlumnus] = useState<Alumnus>(ALUMNI_DATA[0]);
  
  // Mentorship Application states
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [mentorPurpose, setMentorPurpose] = useState("CV_PREPARATION");
  const [mentorMsg, setMentorMsg] = useState("");
  const [appliedMentor, setAppliedMentor] = useState(false);

  const handleApplyMentorship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentId.trim()) {
      alert("Vui lòng điền họ tên và MSSV trước khi đăng ký kết nối.");
      return;
    }

    setAppliedMentor(true);
    setTimeout(() => {
      // Clear values
      setStudentName("");
      setStudentId("");
      setMentorMsg("");
    }, 100);
  };

  return (
    <div className="space-y-12">
      {/* Header & Stats Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-2xl text-white p-6 md:p-8 border border-blue-800 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 pointer-events-none opacity-5">
          <GraduationCap className="h-64 w-64" />
        </div>

        <div className="max-w-3xl">
          <span className="text-amber-400 font-bold uppercase tracking-wider text-xs font-mono">KẾT NỐI MẠNG LƯỚI HCMUTE ALUMNI</span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">Cựu Sinh Viên Thành Đạt - Bệ Phóng Cho Thế Hệ Trẻ</h2>
          <p className="text-slate-300 text-xs md:text-sm mt-2 leading-relaxed">
            Hơn 50,000 cựu sinh viên HCMUTE đang cống hiến hết mình tại nhiều vị trí then chốt toàn cầu. Họ luôn sẵn lòng đồng hành, chia sẻ kinh nghiệm, hỗ trợ học bổng và mở rộng cửa đón chào các thế hệ đàn em tương lai.
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-blue-800/80 text-center">
          <div>
            <span className="text-2xl font-black text-amber-400 block">50,000+</span>
            <span className="text-[10px] text-slate-300 uppercase font-mono mt-0.5 block">Cựu sinh viên</span>
          </div>
          <div>
            <span className="text-2xl font-black text-emerald-400 block">120+</span>
            <span className="text-[10px] text-slate-300 uppercase font-mono mt-0.5 block">Doanh nghiệp sáng lập</span>
          </div>
          <div>
            <span className="text-2xl font-black text-blue-400 block">3,500+</span>
            <span className="text-[10px] text-slate-300 uppercase font-mono mt-0.5 block">Dự án chuyển giao</span>
          </div>
          <div>
            <span className="text-2xl font-black text-pink-400 block">2 Tỷ VNĐ+</span>
            <span className="text-[10px] text-slate-300 uppercase font-mono mt-0.5 block font-sans">Học bổng đồng hành / năm</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: DYNAMIC ALUMNI STORIES & MENTOR CONNECT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Alumnus choosing list cards */}
        <div id="alumni-cards-group" className="lg:col-span-5 space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Cựu học viên tiêu biểu</h3>
            <p className="text-xs text-slate-400">Chọn cựu sinh viên để xem chi tiết và đăng ký nhận cố vấn học tập.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {ALUMNI_DATA.map((alumnus) => {
              const isSelected = selectedAlumnus.id === alumnus.id;
              return (
                <button
                  key={alumnus.id}
                  id={`btn-alumnus-${alumnus.id}`}
                  onClick={() => {
                    setSelectedAlumnus(alumnus);
                    setAppliedMentor(false);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3.5 cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 border-slate-900 text-white shadow-md"
                      : "bg-white border-slate-100 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <img
                    src={alumnus.avatarUrl}
                    alt={alumnus.name}
                    className="h-12 w-12 rounded-full object-cover shrink-0 border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate">{alumnus.name}</h4>
                    <span className={`text-xs block ${isSelected ? "text-slate-300" : "text-slate-500"} truncate`}>
                      {alumnus.currentRole}
                    </span>
                    <span className={`text-[10px] font-mono block mt-0.5 ${isSelected ? "text-amber-400" : "text-blue-600"} font-semibold uppercase`}>
                      LỚP: {alumnus.classCode}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Quote and connection console */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-6">
            {/* Top quote */}
            <div className="relative">
              <span className="text-6xl text-blue-200 font-serif absolute -top-4 -left-4 select-none pointer-events-none">“</span>
              <p className="text-slate-700 font-sans italic text-sm md:text-base leading-relaxed pl-6 pt-3 relative z-10 font-normal">
                {selectedAlumnus.quote}
              </p>
            </div>

            {/* Alumnus details Bio */}
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60 mt-4">
              <img
                src={selectedAlumnus.avatarUrl}
                alt={selectedAlumnus.name}
                className="h-14 w-14 rounded-full object-cover border-2 border-white shadow shadow-slate-300 shrink-0"
              />
              <div>
                <h4 className="font-bold text-slate-800 text-sm md:text-base">{selectedAlumnus.name}</h4>
                <div className="text-xs text-slate-500 font-medium">
                  {selectedAlumnus.currentRole} — <strong className="text-slate-800">{selectedAlumnus.company}</strong>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] font-mono text-slate-400 font-semibold uppercase">
                  <span>Cựu sinh viên khóa {selectedAlumnus.graduationYear}</span>
                  <span>•</span>
                  <span>Mã lớp: {selectedAlumnus.classCode}</span>
                </div>
              </div>
            </div>

            {/* Achievement card block */}
            <div className="space-y-1">
              <h5 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-amber-500" />
                <span>Thành tựu & Cống hiến nổi bật</span>
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">{selectedAlumnus.achievement}</p>
            </div>

            {/* Contact mentoring form */}
            <div className="pt-5 border-t border-slate-150">
              <h5 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                <MessageCircleCode className="h-4.5 w-4.5 text-blue-600" />
                <span>Nhận tư vấn cố vấn Mentorship từ {selectedAlumnus.name}</span>
              </h5>

              {appliedMentor ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5 animate-bounce" />
                  <div className="text-xs">
                    <h6 className="font-bold text-emerald-900 mb-0.5">Đã gửi yêu cầu kết nối thành công!</h6>
                    <p className="leading-relaxed">
                      Hệ thống đã chuyển tiệp đăng ký tới anh/chị <strong>{selectedAlumnus.name}</strong>. Anh chị sẽ nhận được email phản hồi kèm liên kết lịch Google Meet tư vấn của hai người vào hòm thư cá nhân của bạn trong vòng 3-5 ngày làm việc.
                    </p>
                    <button
                      type="button"
                      onClick={() => setAppliedMentor(false)}
                      className="text-xs text-blue-600 hover:underline font-bold mt-2 cursor-pointer"
                    >
                      Kết nối vấn đề khác
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleApplyMentorship} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Họ tên của bạn</label>
                      <input
                        type="text"
                        placeholder="Nguyễn Văn A"
                        required
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 placeholder-slate-400 font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Mã số sinh viên (MSSV)</label>
                      <input
                        type="text"
                        placeholder="Mã số mssv 8 số"
                        required
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 placeholder-slate-400 font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Mục tiêu cần hỗ trợ</label>
                      <select
                        value={mentorPurpose}
                        onChange={(e) => setMentorPurpose(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="CV_PREPARATION">Hướng dẫn tối ưu hồ sơ CV</option>
                        <option value="RESEARCH">Xin lời khuyên nghiên cứu khoa học</option>
                        <option value="CAREER_PATH">Định hướng nghề nghiệp thực tế</option>
                        <option value="INTERNSHIP">Hỗ trợ xin thực tập tại công ty</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Phương thức liên hệ</label>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg p-2 select-none">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <span>Sử dụng Email đăng ký học tập</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Thông điệp ngắn gửi Mentor</label>
                    <textarea
                      rows={2}
                      placeholder="Chào Anh/Chị, em mong muốn nhận lời khuyên của anh/chị về..."
                      value={mentorMsg}
                      onChange={(e) => setMentorMsg(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-700 outline-none focus:border-blue-500 placeholder-slate-400 font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Nộp đơn đăng ký kết nối Mentor</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: EXCLUSIVE ALUMNI JOB DIRECTORY BOARD */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Briefcase className="h-5 w-5 text-blue-600" />
          <h3 className="font-extrabold text-slate-800 text-lg">Cổng Thông Tin Việc Làm Đặc Quyền Do Cựu Sinh Viên Chia Sẻ</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ALUMNI_JOBS.map((job) => (
            <div key={job.id} id={`job-board-${job.id}`} className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded">
                    YÊU CẦU SINH VIÊN SPK
                  </span>
                  <ShieldCheck className="h-4.5 w-4.5 text-emerald-550 fill-emerald-500 text-emerald-600" />
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 text-sm md:text-base leading-tight group-hover:text-blue-600 transition-colors">
                    {job.title}
                  </h4>
                  <span className="text-xs text-slate-500 font-semibold block mt-1">{job.company}</span>
                </div>

                <div className="space-y-1 text-slate-600 text-xs font-normal">
                  <p>• <strong>Công việc chính:</strong> {job.role}</p>
                  <p>• <strong>Địa điểm:</strong> {job.location}</p>
                  <p>• <strong>Mức lương hỗ trợ:</strong> <strong className="text-emerald-600 font-bold">{job.salary}</strong></p>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 font-mono">Đăng bởi: {job.postedBy}</span>
                <button
                  type="button"
                  onClick={() => alert(`Đơn ứng tuyển của bạn đã được khởi tạo trực tiếp qua tài khoản Portal sinh viên.\n\nThông tin CV đính kèm hệ thống đã tự động gửi đến đại diện tuyển sinh: ${job.postedBy}.\nChúc bạn ứng tuyển phỏng vấn thành công!`)}
                  className="text-blue-600 hover:text-blue-700 font-extrabold flex items-center gap-0.5 cursor-pointer group-hover:underline"
                >
                  <span>Nộp đơn ứng tuyển</span>
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
