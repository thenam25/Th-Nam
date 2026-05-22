/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Sparkles, Award, Phone, Calendar, Info } from "lucide-react";

interface SlideData {
  id: number;
  imageUrl: string;
  badge: string;
  title: string;
  subtitle: string;
  linkText: string;
  highlightText?: string;
  contactInfo?: string;
}

const SLIDES: SlideData[] = [
  {
    id: 1,
    imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80",
    badge: "THÔNG BÁO QUAN TRỌNG",
    title: "Phương Thức Tuyển Sinh Đại Học Chính Quy Năm 2026",
    subtitle: "Trường Đại học Công nghệ Kỹ thuật TP. Hồ Chí Minh rộng mở cánh cửa tương lai, đào tạo nguồn nhân lực chất lượng cao thời đại số.",
    linkText: "XEM CHI TIẾT PHƯƠNG THỨC",
    highlightText: "Mã trường: UTE",
    contactInfo: "Hotline: 028 3722 5724 - www.tuyensinh.hcmute.edu.vn"
  },
  {
    id: 2,
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80",
    badge: "KHAI PHÁ CÔNG NGHỆ",
    title: "Trung Tâm Nghiên Cứu Robot & Trí Tuệ Nhân Tạo AI Đạt Chuẩn Quốc Tế",
    subtitle: "Hiện đại hóa cơ sở vật chất, phòng thực hành liên kết doanh nghiệp đa quốc gia, ươm mầm tài năng khoa học kỹ thuật.",
    linkText: "ĐĂNG KÝ THAM QUAN 3D TOUR",
    highlightText: "ICMT 2026",
    contactInfo: "Đại hội Cơ điện tử & AI quốc tế tổ chức vào tháng 11/2026"
  },
  {
    id: 3,
    imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1600&q=80",
    badge: "HỘI NHẬP TOÀN CẦU",
    title: "Chương Trình Đào Tạo Chuẩn Quốc Tế & Liên Kết Anh Quốc, Đan Mạch",
    subtitle: "Nhận bằng cử nhân chất lượng Châu Âu ngay tại Việt Nam kết hợp mô hình chuyển tiếp linh hoạt 2+2.",
    linkText: "XÉT TUYỂN CHƯƠNG TRÌNH QUỐC TẾ",
    highlightText: "Song Bằng Quốc Tế",
    contactInfo: "Cam kết chuẩn đầu ra IELTS từ 6.0 trở lên"
  },
  {
    id: 4,
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80",
    badge: "TỰ HÀO THÀNH TÍCH",
    title: "98% Cựu Sinh Viên Có Việc Làm Đúng Chuyên Ngành Ngay Khi Tốt Nghiệp",
    subtitle: "Kết nối mạng lưới cựu sinh viên thành đạt tại các tập đoàn công nghệ lớn: VinFast, Intel, Samsung, Bosch...",
    linkText: "GIA NHẬP MẠNG LƯỚI CỰU SINH VIÊN",
    highlightText: "Tỷ lệ 98%",
    contactInfo: "Hơn 50,000 cựu sinh viên kết nối chia sẻ cơ hội"
  },
  {
    id: 5,
    imageUrl: "https://images.unsplash.com/photo-1579710039144-85d6bdffddc9?auto=format&fit=crop&w=1600&q=80",
    badge: "HỌC KỲ QUÂN SỰ ĐỒNG ĐỘI",
    title: "Khóa Giáo Dục Quốc Phòng & An Ninh Tràn Đầy Nhiệt Huyết Tuổi Trẻ",
    subtitle: "Rèn luyện nếp sống chuẩn quân ngũ, bản lĩnh kỷ luật thép và tình đoàn kết gắn kết bền chặt giữa những sinh viên kỹ thuật HCMUTE tài năng.",
    linkText: "XEM CHI TIẾT LỊCH QUÂN SỰ 2026",
    highlightText: "GDQP & AN 2026",
    contactInfo: "Trung tâm GDQP&AN ĐHQG-HCM, Đông Hòa, Dĩ An"
  }
];

export default function HeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  };

  return (
    <div id="hero-slideshow" className="relative h-[480px] md:h-[580px] w-full overflow-hidden bg-slate-900">
      {/* Background Slideshow Image with overlay */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {/* Backdrop Blur & Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/60 to-transparent z-10" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950/90 to-transparent z-10" />
          <img
            src={SLIDES[currentIndex].imageUrl}
            alt="HCMUTE Campus"
            className="h-full w-full object-cover object-center"
          />
        </motion.div>
      </AnimatePresence>

      {/* Floating Elements / Decorative Brand Watermark */}
      <div className="absolute top-6 right-6 hidden lg:flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white font-mono text-xs px-3 py-1.5 rounded-full z-20 shadow-lg">
        <Sparkles className="h-4.5 w-4.5 text-amber-400 animate-pulse" />
        <span>CƠ SỞ VẬT CHẤT ĐẠT CHUẨN AUN-QA</span>
      </div>

      {/* Slide Interactive Info Content */}
      <div className="absolute inset-0 flex items-center z-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {/* Banner Badge */}
                <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3.5 py-1 text-xs md:text-sm font-semibold tracking-wider text-white shadow-lg shadow-red-600/30">
                  <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                  {SLIDES[currentIndex].badge}
                </div>

                {/* Main Heading styled deeply with professional Viet touch */}
                <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl leading-tight drop-shadow-md">
                  {SLIDES[currentIndex].title}
                </h1>

                {/* Subtitle description */}
                <p className="mt-4 text-base md:text-lg text-slate-200 leading-relaxed max-w-xl text-shadow font-normal">
                  {SLIDES[currentIndex].subtitle}
                </p>

                {/* Optional Highlight badge */}
                {SLIDES[currentIndex].highlightText && (
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 bg-amber-500 text-slate-950 rounded font-bold text-xs md:text-sm shadow-md inline-flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" />
                      {SLIDES[currentIndex].highlightText}
                    </span>
                    {SLIDES[currentIndex].contactInfo && (
                      <span className="text-xs md:text-sm text-slate-300 font-mono inline-flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-blue-400" />
                        {SLIDES[currentIndex].contactInfo}
                      </span>
                    )}
                  </div>
                )}

                {/* Call to action button */}
                <div className="mt-8 flex items-center gap-4">
                  <a
                    href="#main-portal"
                    className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-blue-600 px-5.5 py-2.5 font-semibold text-white transition-all duration-300 ease-out hover:bg-blue-700 active:scale-95 shadow-md hover:shadow-blue-600/40"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {SLIDES[currentIndex].linkText}
                      <Sparkles className="h-4.5 w-4.5 text-amber-200 group-hover:rotate-12 transition-transform" />
                    </span>
                  </a>
                  
                  <div className="hidden sm:inline-flex items-center gap-2 text-xs md:text-sm font-medium text-slate-300">
                    <Info className="h-4.5 w-4.5 text-blue-400" />
                    <span>Mã tuyển sinh: <strong className="text-white hover:underline cursor-pointer">SPK</strong></span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Manual Sliding controllers (chevron arrows) */}
      <button
        id="btn-prev-slide"
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-25 bg-slate-900/40 hover:bg-slate-900/80 border border-white/10 p-2 text-white hover:text-amber-400 transition-all rounded-full cursor-pointer hidden md:flex items-center justify-center group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6 group-hover:-translate-x-0.5 transition-transform" />
      </button>

      <button
        id="btn-next-slide"
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-25 bg-slate-900/40 hover:bg-slate-900/80 border border-white/10 p-2 text-white hover:text-amber-400 transition-all rounded-full cursor-pointer hidden md:flex items-center justify-center group"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-25 flex space-x-2.5 bg-slate-950/40 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/5">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            id={`slide-dot-${index}`}
            onClick={() => setCurrentIndex(index)}
            className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              index === currentIndex ? "w-6 bg-amber-400" : "w-2.5 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
