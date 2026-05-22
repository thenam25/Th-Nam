export function getOfflineHtml(): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cổng thông tin học tập & Tuyển sinh HCMUTE-Portal (Offline)</title>
  <!-- Tailwind CSS Play CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght=300;400;500;600;700;800&family=JetBrains+Mono:wght=400;500;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
          },
          animation: {
            'pulse-subtle': 'pulseSubtle 2s infinite ease-in-out',
            'float': 'float 4s infinite ease-in-out',
          },
          keyframes: {
            pulseSubtle: {
              '0%, 100%': { opacity: '1', transform: 'scale(1)' },
              '50%': { opacity: '0.8', transform: 'scale(0.98)' }
            },
            float: {
              '0%, 105%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-6px)' }
            }
          }
        }
      }
    }
  </script>
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-bounce-in {
      animation: fadeIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .tab-section {
      display: none;
    }
    .tab-section.active {
      display: block;
      animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    /* Pretty slider styling */
    input[type="range"]::-webkit-slider-thumb {
      background: #2563eb;
      border: 2px solid #ffffff;
      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
    }
  </style>
</head>
<body class="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 transition-all duration-300 antialiased selection:bg-blue-600 selection:text-white">

  <!-- 1. TOP UTILITY STRIP -->
  <div class="bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px] font-mono py-2.5 px-4 shadow-sm z-50">
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
      <div class="flex flex-wrap items-center gap-4 justify-center">
        <span class="flex items-center gap-2">
          <i data-lucide="phone" class="h-3.5 w-3.5 text-amber-400"></i>
          <span>Hotline Tuyển sinh: <strong class="text-slate-100">028 3722 5724</strong></span>
        </span>
        <span class="h-3 w-[1px] bg-slate-800 hidden sm:inline"></span>
        <span class="flex items-center gap-2">
          <i data-lucide="mail" class="h-3.5 w-3.5 text-blue-400"></i>
          <span>tuyensinh@hcmute.edu.vn</span>
        </span>
      </div>
      <div class="flex items-center gap-3">
        <span class="bg-amber-400/10 text-amber-400 border border-amber-400/30 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
          <span class="h-1.5 w-1.5 bg-amber-400 rounded-full animate-ping"></span>
          Bản Chạy Offline Độc Lập (.html)
        </span>
      </div>
    </div>
  </div>

  <!-- 2. MAIN HEADER -->
  <header class="bg-white/95 backdrop-blur border-b border-slate-100 py-3.5 px-4 sticky top-0 z-40 shadow-sm transition-all">
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <!-- Logo -->
        <div class="h-12 w-12 shrink-0 bg-white rounded-2xl flex items-center justify-center p-1.5 shadow-md border border-slate-100 cursor-pointer" onclick="switchTab('intro')">
          <img
            src="https://upload.wikimedia.org/wikipedia/vi/1/1d/Logo_HCMUTE.png"
            alt="HCMUTE Logo"
            class="h-full w-full object-contain"
          />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-sm font-black text-blue-900 tracking-wider uppercase leading-tight font-mono cursor-pointer" onclick="switchTab('intro')">
              HCMUTE-Portal
            </h1>
            <span class="bg-blue-600/10 text-blue-600 font-mono text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Offline</span>
          </div>
          <p class="text-[10px] text-slate-500 font-bold tracking-tight uppercase mt-0.5">
            Cổng thông tin tuyển sinh & Điểm học bạ 2026 chính thức
          </p>
        </div>
      </div>

      <!-- Quick Session Indicator -->
      <div id="user-badge" class="flex items-center gap-3 bg-slate-50 hover:bg-slate-100/90 py-1.5 px-3.5 rounded-2xl border border-slate-200 transition-all">
        <div class="h-7 w-7 rounded-full bg-blue-650 bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs shadow-md uppercase font-mono" id="user-initial">
          G
        </div>
        <div class="text-left text-xs">
          <h4 id="user-fullname" class="font-bold text-slate-800 leading-tight">Khách Khám Phá</h4>
          <p id="user-role" class="text-[9px] text-slate-400 font-semibold font-mono uppercase tracking-tight mt-0.5">Chưa đăng nhập</p>
        </div>
      </div>
    </div>
  </header>

  <!-- 3. HIGHLIGHT TICKER -->
  <div class="bg-amber-400 text-slate-950 font-bold py-2.5 px-4 text-xs shadow-md border-b border-amber-500 z-30">
    <div class="max-w-7xl mx-auto flex items-center justify-between gap-3">
      <div class="flex items-center gap-2.5 min-w-0 flex-1">
        <span class="bg-slate-950 text-white font-mono text-[9px] px-2 py-0.5 rounded font-black tracking-widest shrink-0 uppercase animate-pulse">
          MỚI NHẤT
        </span>
        <p id="ticker-text" class="truncate font-bold text-slate-900 font-sans">
          🔥 Tuyển sinh 2026: HCMUTE mở đợt nhận hồ sơ xét tuyển học bạ 5 học kỳ từ ngày 01/06/2026.
        </p>
      </div>
      <div class="hidden md:flex gap-1.5 shrink-0 text-[10px] text-slate-800 items-center font-mono">
        <i data-lucide="clock" class="h-3 w-3"></i>
        <span>Cập Nhật Đầy Đủ</span>
      </div>
    </div>
  </div>

  <!-- 4. HERO SECTION WITH RICH BACKDROP -->
  <div class="relative bg-slate-950 text-white py-14 px-6 overflow-hidden border-b border-amber-400 shadow-2xl">
    <div class="absolute inset-0 opacity-25">
      <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80" class="w-full h-full object-cover filter blur-xs" />
    </div>
    <!-- Ambient mesh -->
    <div class="absolute -top-24 -right-24 h-96 w-96 bg-gradient-to-br from-blue-600/15 to-transparent rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-24 -left-24 h-96 w-96 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent"></div>

    <div class="max-w-4xl mx-auto text-center relative z-10 space-y-5 flex flex-col items-center">
      <span class="bg-amber-400 text-slate-950 font-mono font-extrabold text-[10px] tracking-widest py-1 px-4 rounded-full uppercase shadow-lg shadow-amber-400/20">
        ỨNG DỤNG LƯU TRỮ CHẠY OFFLINE
      </span>
      <h2 class="text-3xl md:text-4xl font-black tracking-tight uppercase leading-tight max-w-3xl">
        Học hiệu Sáng Tạo - Hội Nhập - Phát Triển Bền Vững
      </h2>
      <p class="text-slate-300 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed font-normal">
        Đây là ứng dụng chạy độc lập ngoại tuyến an toàn và lưu trữ dữ liệu tại máy cá nhân. Hệ thống đồng bộ toàn bộ danh mục mã ngành 2026, thông tin mô phỏng điểm số, học bạ lý thuyết và tuyển sinh ngành mới <strong class="text-amber-400 font-bold">Công nghệ Thực phẩm</strong> hoàn toàn không dùng internet!
      </p>
      
      <!-- Quick Dashboard Actions -->
      <div class="flex flex-wrap gap-2 justify-center pt-2 w-full max-w-md">
        <button onclick="switchTab('grades')" class="flex-1 bg-amber-400 hover:bg-amber-500 text-slate-955 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-400/10 hover:scale-[1.02]">
          <i data-lucide="file-spreadsheet" class="h-4 w-4"></i>
          <span>Tra Điểm Học Bạ</span>
        </button>
        <button onclick="switchTab('admissions')" class="flex-1 bg-slate-800 hover:bg-slate-700/90 text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border border-slate-700 hover:border-slate-600 hover:scale-[1.02]">
          <i data-lucide="search" class="h-4 w-4"></i>
          <span>Xem Mã Ngành 2026</span>
        </button>
      </div>
    </div>
  </div>

  <!-- 5. FLOATING COMPACT MENU TABS -->
  <div class="bg-white border-b border-slate-200 sticky top-[72px] sm:top-[76px] z-30 shadow-md px-4 overflow-x-auto select-none">
    <div class="max-w-7xl mx-auto flex items-center gap-1 md:gap-2 py-2.5">
      <button onclick="switchTab('intro')" id="tab-intro" class="tab-btn py-2 px-3.5 md:px-5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 tracking-tight shrink-0 bg-blue-50 text-blue-700">
        <i data-lucide="school" class="h-4 w-4 shrink-0"></i>
        <span>Giới Thiệu</span>
      </button>
      <button onclick="switchTab('admissions')" id="tab-admissions" class="tab-btn py-2 px-3.5 md:px-5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 tracking-tight shrink-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100">
        <i data-lucide="book-open" class="h-4 w-4 shrink-0"></i>
        <span>Tuyển Sinh 2026</span>
      </button>
      <button onclick="switchTab('grades')" id="tab-grades" class="tab-btn py-2 px-3.5 md:px-5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 tracking-tight shrink-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100">
        <i data-lucide="file-spreadsheet" class="h-4 w-4 shrink-0"></i>
        <span>Tra Điểm & Học Bạ</span>
      </button>
      <button onclick="switchTab('news')" id="tab-news" class="tab-btn py-2 px-3.5 md:px-5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 tracking-tight shrink-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100">
        <i data-lucide="calendar" class="h-4 w-4 shrink-0"></i>
        <span>Sự Kiện & Tin Tức</span>
      </button>
      <button onclick="switchTab('alumni')" id="tab-alumni" class="tab-btn py-2 px-3.5 md:px-5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 tracking-tight shrink-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100">
        <i data-lucide="users" class="h-4 w-4 shrink-0"></i>
        <span>Cựu Sinh Viên VIP</span>
      </button>
    </div>
  </div>

  <!-- 6. MAIN CONTENT LAYOUT FRAME -->
  <main class="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-8">

    <!-- =========================== TAB 1: INTRO =========================== -->
    <section id="content-intro" class="tab-section active space-y-8">
      
      <!-- Key Statistics -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm text-center transform hover:translate-y-[-2px] transition-all hover:shadow-md">
          <span class="text-slate-400 block text-[10px] uppercase font-mono tracking-widest font-bold">Thành Lập Từ</span>
          <span class="text-3xl font-black text-blue-900 tracking-tight block mt-1">1962</span>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm text-center transform hover:translate-y-[-2px] transition-all hover:shadow-md">
          <span class="text-slate-400 block text-[10px] uppercase font-mono tracking-widest font-bold">Quy Mô Đất Sân</span>
          <span class="text-3xl font-black text-emerald-700 tracking-tight block mt-1">220,000m²</span>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm text-center transform hover:translate-y-[-2px] transition-all hover:shadow-md">
          <span class="text-slate-400 block text-[10px] uppercase font-mono tracking-widest font-bold">Sinh Viên Chính Quy</span>
          <span class="text-3xl font-black text-rose-700 tracking-tight block mt-1">26,000+</span>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm text-center transform hover:translate-y-[-2px] transition-all hover:shadow-md">
          <span class="text-slate-400 block text-[10px] uppercase font-mono tracking-widest font-bold">Chương Trình Chuẩn Quốc Tế</span>
          <span class="text-3xl font-black text-amber-700 tracking-tight block mt-1">12 Ngành</span>
        </div>
      </div>

      <!-- Introduction block with official video frame -->
      <div class="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-1 space-y-4.5 text-left flex flex-col justify-between">
          <div class="space-y-4">
            <span class="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 border border-blue-200/50 py-0.5 px-2.5 rounded-full font-mono text-[9px] uppercase tracking-wider font-extrabold">
              ⭐ CHẤT LƯỢNG TIÊN PHONG
            </span>
            <h3 class="text-2xl font-black text-slate-900 tracking-tight leading-snug">Về Đại Học Sư Phạm Kỹ Thuật TPHCM</h3>
            <p class="text-slate-650 text-xs leading-relaxed font-normal">
              Trường Đại học Sư phạm Kỹ thuật TP.HCM là một trong những cơ sở đào tạo nguồn nhân lực kỹ thuật, nghiên cứu khoa học hàng đầu của Việt Nam. Được vận hành với tôn chỉ đổi mới không ngừng, trường đảm bảo môi trường lý tưởng nhất cho tri thức hội nhập.
            </p>
          </div>
          <div class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-2xl">
            <h4 class="font-extrabold text-[11px] text-blue-900 font-mono uppercase tracking-wide">Triết lý Đào tạo:</h4>
            <p class="text-xs text-blue-800 italic font-semibold mt-0.5">"Nhân bản - Sáng tạo - Hội nhập"</p>
          </div>
        </div>
        <div class="lg:col-span-2 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-lg aspect-video relative">
          <iframe
            class="w-full h-full"
            src="https://www.youtube.com/embed/-I0U7jZ2lC8"
            title="HCMUTE Tour"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      </div>

      <!-- Quick Interactive Selection Helper (New Offline Feature) -->
      <div class="bg-gradient-to-br from-blue-900 to-indigo-950 rounded-3xl p-6 md:p-8 text-white border-2 border-amber-400/40 shadow-xl relative overflow-hidden text-left">
        <div class="absolute top-0 right-0 h-40 w-40 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl pointer-events-none"></div>
        <div class="space-y-4 max-w-3xl">
          <span class="bg-amber-400 text-slate-955 font-mono font-black text-[10px] tracking-wider py-1 px-3 rounded-md uppercase">
            ⚡ KHẢO SÁT CHỌN NGÀNH (MÔ PHỎNG OFFLINE)
          </span>
          <h3 class="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
            Trình Khảo Sát & Lọc Ngành Khớp Điểm Học Bạ Trực Quan
          </h3>
          <p class="text-slate-300 text-xs font-normal leading-relaxed">
            Nhờ cơ sở dữ liệu học vụ được đóng gói sẵn trong file, bạn hãy thử kéo thanh trượt điều chỉnh số điểm dự kiến học bạ 3 môn thế mạnh để xem danh mục các ngành học bạn nắm chắc cơ hội trúng tuyển dựa trên phổ điểm năm của HCMUTE:
          </p>
          
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-3">
            <div>
              <label class="text-[10px] font-bold text-slate-300 uppercase tracking-wider font-mono block mb-1">Môn A (Toán): <span id="mock-math-val" class="text-amber-400 font-bold">8.5</span></label>
              <input type="range" id="mock-math" min="0" max="10" step="0.5" value="8.5" oninput="runMockMatching()" class="w-full accent-amber-405 accent-amber-450 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none">
            </div>
            <div>
              <label class="text-[10px] font-bold text-slate-300 uppercase tracking-wider font-mono block mb-1">Môn B (Lý/Hóa): <span id="mock-phy-val" class="text-amber-400 font-bold">8.0</span></label>
              <input type="range" id="mock-phy" min="0" max="10" step="0.5" value="8.0" oninput="runMockMatching()" class="w-full accent-amber-405 accent-amber-450 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none">
            </div>
            <div>
              <label class="text-[10px] font-bold text-slate-300 uppercase tracking-wider font-mono block mb-1">Môn C (Anh/Sinh): <span id="mock-chem-val" class="text-amber-400 font-bold">8.5</span></label>
              <input type="range" id="mock-chem" min="0" max="10" step="0.5" value="8.5" oninput="runMockMatching()" class="w-full accent-amber-405 accent-amber-450 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none">
            </div>
            <div class="bg-slate-900/60 p-3 rounded-2xl border border-slate-700 text-center flex flex-col justify-center">
              <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider">TỔNG ĐIỂM (x3):</span>
              <span id="mock-total" class="text-xl font-mono font-black text-emerald-400">25.0</span>
            </div>
          </div>

          <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h4 class="text-xs font-bold font-mono text-amber-400 flex items-center gap-1">
              <i data-lucide="check-circle" class="h-4 w-4 text-emerald-450"></i>
              Gợi Ý Các Ngành Bạn Đủ Điều Kiện Xét Tuyển:
            </h4>
            <div id="mock-matching-results" class="flex flex-wrap gap-2 text-xs">
              <!-- Instantly updated -->
            </div>
          </div>
        </div>
      </div>

      <!-- List of training departments -->
      <div class="space-y-4 text-left">
        <div class="flex items-center gap-2 border-b border-slate-200 pb-2.5">
          <i data-lucide="award" class="h-5 w-5 text-blue-600"></i>
          <h3 class="font-black text-slate-800 text-base md:text-lg">Danh Sách Các Khoa Nòng Cốt HCMUTE</h3>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm hover:border-blue-400 hover:shadow transition-all group">
            <h4 class="text-xs font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">Khoa Cơ khí Động lực</h4>
            <p class="text-[10px] text-slate-500 mt-1.5 leading-relaxed">Khoa trọng điểm sở hữu các hệ thống mô phỏng ô tô tiên tiến và xe tự hành mới nhất.</p>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm hover:border-blue-400 hover:shadow transition-all group">
            <h4 class="text-xs font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">Khoa Công nghệ Thông tin</h4>
            <p class="text-[10px] text-slate-500 mt-1.5 leading-relaxed">Đơn vị đào tạo chuẩn khắc nghiệt quốc tế đạt tiêu chuẩn AUN-QA danh giá.</p>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm hover:border-blue-400 hover:shadow transition-all group">
            <h4 class="text-xs font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">Khoa Cơ khí Chế tạo máy</h4>
            <p class="text-[10px] text-slate-500 mt-1.5 leading-relaxed">Hội tụ những nghiên cứu lập trình cánh tay Robot tự học và gia công chính xác.</p>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm hover:border-blue-400 hover:shadow transition-all group">
            <h4 class="text-xs font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">Khoa Công nghệ Hóa & Thực phẩm</h4>
            <p class="text-[10px] text-slate-500 mt-1.5 leading-relaxed">Khu xưởng chiết xuất, phát triển sản phẩm Công nghệ Thực phẩm & Vi sinh sinh học đột phá.</p>
          </div>
        </div>
      </div>

    </section>

    <!-- =========================== TAB 2: ADMISSIONS =========================== -->
    <section id="content-admissions" class="tab-section space-y-6">
      
      <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 text-left">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <h3 class="font-black text-slate-900 text-lg tracking-tight flex items-center gap-1.5">
              <i data-lucide="book-open" class="h-5 w-5 text-blue-600"></i>
              <span>Tra Cứu Mã Ngành Tuyển Sinh Hệ Chính Quy 2026</span>
            </h3>
            <p class="text-slate-500 text-xs">Cập nhật nhanh tổ hợp bộ môn thi đại học, điểm nhận hồ sơ xét học bạ của từng ngành đào tạo năm học 2026.</p>
          </div>
          
          <!-- Fast filter combination buttons -->
          <div class="flex flex-wrap gap-1">
            <span class="text-[10px] text-slate-400 font-mono font-bold uppercase py-1 mr-1">Lọc nhanh khối:</span>
            <button onclick="filterByCombi('')" class="combi-tag-btn bg-slate-900 text-white font-mono font-bold text-[9px] px-2 py-1 rounded" id="tag-all">TẤT CẢ</button>
            <button onclick="filterByCombi('A50')" class="combi-tag-btn bg-slate-100 font-mono font-bold text-[9px] px-2 py-1 rounded text-slate-600 hover:bg-slate-200" id="tag-A00">A00</button>
            <button onclick="filterByCombi('A01')" class="combi-tag-btn bg-slate-100 font-mono font-bold text-[9px] px-2 py-1 rounded text-slate-600 hover:bg-slate-200" id="tag-A01">A01</button>
            <button onclick="filterByCombi('B00')" class="combi-tag-btn bg-slate-100 font-mono font-bold text-[9px] px-2 py-1 rounded text-slate-600 hover:bg-slate-200" id="tag-B00">B00</button>
            <button onclick="filterByCombi('D01')" class="combi-tag-btn bg-slate-100 font-mono font-bold text-[9px] px-2 py-1 rounded text-slate-600 hover:bg-slate-200" id="tag-D01">D01</button>
          </div>
        </div>
        
        <!-- Search controls -->
        <div class="relative max-w-md">
          <input
            type="text"
            id="admissions-search"
            oninput="filterAdmissions()"
            placeholder="Gõ tìm nhanh chuyên ngành (VD: Thực phẩm, Ô tô, IT)..."
            class="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold text-slate-800 outline-none transition-colors"
          />
          <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"></i>
        </div>
      </div>

      <!-- Majors Dynamic Grid -->
      <div id="majors-grid" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Live-rendered beautifully via JS -->
      </div>
      
    </section>

    <!-- =========================== TAB 3: GRADES SYSTEM =========================== -->
    <section id="content-grades" class="tab-section space-y-6">
      
      <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm text-left space-y-4">
        <h3 class="font-black text-slate-900 text-lg tracking-tight flex items-center gap-2">
          <i data-lucide="file-spreadsheet" class="h-5.5 w-5.5 text-blue-600"></i>
          <span>Cơ Sơ Tra Cứu Kết Quả Học Tập & Mô Phỏng Điểm GPA</span>
        </h3>
        <p class="text-slate-500 text-xs">
          Hệ thống lưu trữ dữ liệu nòng cốt của các tài khoản danh mục mẫu là <strong class="text-blue-600 font-mono">22110123</strong> (Kỹ sư ô tô Vũ Nguyễn Minh Quân) và <strong class="text-blue-600 font-mono">23110234</strong> (Khoa CNTT Lê Minh Phương Thảo). Nhập bất kỳ mã số sinh viên số mong muốn khác, hệ thống sẽ tự sinh học bạ tương thích tĩnh!
        </p>
        
        <!-- Query Form Wrapper -->
        <div class="flex gap-2 max-w-md">
          <input
            type="text"
            id="student-id-input"
            value="22110123"
            placeholder="Điền MSSV (ví dụ: 22110123)"
            class="flex-1 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl py-2.5 px-3.5 text-xs font-extrabold text-slate-800 outline-none font-mono tracking-wider"
          />
          <button
            onclick="searchStudent()"
            class="bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2.5 px-5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <i data-lucide="search" class="h-4 w-4"></i>
            <span>TRA CỨU</span>
          </button>
        </div>
      </div>

      <!-- Student profile area -->
      <div id="student-profile-area" class="space-y-6 text-left">
        <!-- RENDERED DYNAMICALLY BY JAVASCRIPT -->
      </div>

    </section>

    <!-- =========================== TAB 4: NEWS =========================== -->
    <section id="content-news" class="tab-section space-y-6">
      
      <div class="flex items-center gap-2 border-b border-slate-200 pb-2.5 text-left">
        <i data-lucide="calendar" class="h-5 w-5 text-blue-600 font-black"></i>
        <h3 class="font-black text-slate-900 text-lg">Tin Tức Đào Tạo & Thông Báo Công Khai</h3>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        
        <!-- News Card 1 -->
        <div class="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-sm flex flex-col justify-between hover:border-amber-400/50 hover:shadow-md transition-all">
          <div class="p-5 space-y-3">
            <span class="bg-amber-100 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded text-[10px] tracking-wide font-mono inline-block">
              THÔNG BÁO QUAN TRỌNG
            </span>
            <h4 class="font-extrabold text-sm text-slate-800 leading-snug">Phương thức tuyển sinh các chương trình đại học hệ chính quy năm 2026 chính thức</h4>
            <p class="text-slate-500 text-xs">Phân bổ 5 phương thức: tuyển thẳng, học bạ 5 học kỳ, thi đánh giá năng lực ĐHQG và điểm thi tốt nghiệp THPT.</p>
          </div>
          <div class="p-4 bg-slate-50 border-t border-slate-100 text-[10px] font-mono text-slate-450 flex justify-between">
            <span>Đăng ngày: 20/05/2026</span>
            <span class="text-blue-600 font-bold cursor-pointer hover:underline" onclick="alert('Đã tải hoàn tất thông báo chính thức dạng offline!')">Đọc toàn bản →</span>
          </div>
        </div>

        <!-- News Card 2 -->
        <div class="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-sm flex flex-col justify-between hover:border-blue-400/50 hover:shadow-md transition-all">
          <div class="p-5 space-y-3">
            <span class="bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold px-2 py-0.5 rounded text-[10px] tracking-wide font-mono inline-block">
              KHÁNH THÀNH PHÒNG TỐI TÂN
            </span>
            <h4 class="font-extrabold text-sm text-slate-800 leading-snug">Kiện toàn trung tâm nghiên cứu Công nghệ Lương thực & Thực phẩm vi sinh</h4>
            <p class="text-slate-500 text-xs">Cơ sở vật chất chuẩn xuất khẩu quốc tế châu Âu, tài trợ độc quyền bởi các tập đoàn chế phẩm sinh học vi sinh thực phẩm.</p>
          </div>
          <div class="p-4 bg-slate-50 border-t border-slate-100 text-[10px] font-mono text-slate-450 flex justify-between">
            <span>Đăng ngày: 18/05/2026</span>
            <span class="text-blue-600 font-bold cursor-pointer hover:underline" onclick="alert('Đã tải hoàn tất thông báo chính thức dạng offline!')">Chi tiết xưởng →</span>
          </div>
        </div>

        <!-- News Card 3 -->
        <div class="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-sm flex flex-col justify-between hover:border-rose-450/40 hover:shadow-md transition-all">
          <div class="p-5 space-y-3">
            <span class="bg-blue-100 text-blue-800 border border-blue-250 font-bold px-2 py-0.5 rounded text-[10px] tracking-wide font-mono inline-block">
              SÂN CHƠI CÔNG NGHỆ
            </span>
            <h4 class="font-extrabold text-sm text-slate-800 leading-snug">Hội thi Sáng Tạo Robot sinh viên HCMUTE chuẩn bị bấm chuông khởi cuộc</h4>
            <p class="text-slate-500 text-xs">Giải vô địch quy tụ hơn 40 đội thi tranh tài giải quyết bài toán nông nghiệp thông minh, điều phối xe tự hành AI.</p>
          </div>
          <div class="p-4 bg-slate-50 border-t border-slate-100 text-[10px] font-mono text-slate-450 flex justify-between">
            <span>Đăng ngày: 15/05/2026</span>
            <span class="text-blue-600 font-bold cursor-pointer hover:underline" onclick="alert('Đã tải hoàn tất thông báo chính thức dạng offline!')">Thể lệ lịch trình →</span>
          </div>
        </div>

      </div>

    </section>

    <!-- =========================== TAB 5: ALUMNI =========================== -->
    <section id="content-alumni" class="tab-section hidden space-y-6">
      
      <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm text-left space-y-4">
        <h3 class="font-black text-slate-900 text-lg tracking-tight">Kênh Liên Lạc Cựu Sinh Viên VIP & Chi Hội Mentors</h3>
        <p class="text-slate-500 text-xs">HCMUTE tự hào đồng hành cùng hơn 65,000 cựu học viên nắm giữ chức vụ hàng đầu tại nhiều tập đoàn toàn cầu.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        
        <!-- Mentor card 1 -->
        <div class="bg-white rounded-2xl p-6 border border-slate-150 shadow-sm flex flex-col justify-between hover:shadow transition-all">
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="h-12 w-12 rounded-full overflow-hidden bg-slate-100 shadow border border-slate-200 shrink-0">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80" alt="Nam" class="w-full h-full object-cover">
              </div>
              <div class="min-w-0">
                <h4 class="font-extrabold text-sm text-slate-900 truncate">Nguyễn Hoàng Nam</h4>
                <p class="text-[10px] text-slate-500 font-bold">Kỹ sư Nghiên Cứu Ô Tô (VinFast Việt Nam) - Khóa 2014</p>
              </div>
            </div>
            <p class="text-xs text-slate-550 italic leading-relaxed">"Sự nỗ lực và tính thực chiến từ chương trình xưởng của trường đã rèn dũa tôi chinh phục đỉnh cao chế tạo sản phẩm hiện đại quốc gia."</p>
          </div>
          <div class="pt-4 mt-3 border-t border-slate-100 flex justify-between items-center text-xs">
            <span class="text-[10px] text-slate-400 font-mono">Lĩnh vực: Xe điện thông minh</span>
            <button onclick="requestMentorOffline('Nguyễn Hoàng Nam')" class="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold py-1.5 px-4 rounded-xl cursor-pointer">Xin Kết Nối</button>
          </div>
        </div>

        <!-- Mentor card 2 -->
        <div class="bg-white rounded-2xl p-6 border border-slate-150 shadow-sm flex flex-col justify-between hover:shadow transition-all">
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="h-12 w-12 rounded-full overflow-hidden bg-slate-100 shadow border border-slate-200 shrink-0">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80" alt="Mai Anh" class="w-full h-full object-cover">
              </div>
              <div class="min-w-0">
                <h4 class="font-extrabold text-sm text-slate-900 truncate">Trần Thị Mai Anh</h4>
                <p class="text-[10px] text-slate-500 font-bold">Senior AI Researcher (Google APAC) - Khóa 2016</p>
              </div>
            </div>
            <p class="text-xs text-slate-550 italic leading-relaxed">"Khoa CNTT trường mình dạy rất đúng hướng thực tế, hỗ trợ cho tôi rất lớn khi gia nhập tập đoàn đa quốc gia tại Singapore."</p>
          </div>
          <div class="pt-4 mt-3 border-t border-slate-100 flex justify-between items-center text-xs">
            <span class="text-[10px] text-slate-400 font-mono">Lĩnh vực: Deep Learning & AI</span>
            <button onclick="requestMentorOffline('Trần Thị Mai Anh')" class="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold py-1.5 px-4 rounded-xl cursor-pointer">Xin Kết Nối</button>
          </div>
        </div>

      </div>

    </section>

  </main>

  <!-- FOOTER -->
  <footer class="bg-slate-900 text-slate-450 text-slate-400 py-10 px-4 mt-auto border-t border-slate-800 text-center text-xs leading-relaxed select-none">
    <div class="max-w-7xl mx-auto space-y-2.5">
      <p class="font-extrabold text-slate-100 tracking-wider">TRƯỜNG ĐẠI HỌC SƯ PHẠM KỸ THUẬT TP.HCM</p>
      <p>Số 1 Võ Văn Ngân, Phường Linh Chiểu, Thành phố Thủ Đức, Thành phố Hồ Chí Minh.</p>
      <p class="text-[10px] text-slate-500 border-t border-slate-800 pt-4 mt-3">© 2026 HCMUTE-Portal Offline System. Hệ thống tĩnh chạy độc lập, đáp ứng tra cứu tại chỗ an toàn cao.</p>
    </div>
  </footer>

  <!-- ======================== CORE COMPACT JAVASCRIPT CODES ======================== -->
  <script>
    // 1. DATA REPOS matching real React models
    const MAJORS_DATA = [
      {
        id: "auto",
        code: "7510205",
        name: "Công nghệ Kỹ thuật Ô tô",
        faculty: "Khoa Cơ khí Động lực",
        duration: 4,
        description: "Ngành học danh tiếng hàng đầu, trang bị kỹ sư am hiểu thấu đáo động cơ đốt trong, điều khiển ô tô điện hỗn hợp hybrids và xe tự hành cấp cao.",
        highschoolCombi: ["A00", "A01", "D01", "D90"],
        cutOffScore2025: 26.85,
        highlightPoints: [
          "Xưởng thực tập liên kết bảo trợ bởi Toyota, Bosch, Thaco.",
          "Cơ hội thực địa, tuyển thẳng kỹ sư chính thức tại tập đoàn VinFast.",
          "Đội ngũ giảng viên gạo cội chất lượng, đạt nhiều giải thưởng chế tạo lớn."
        ]
      },
      {
        id: "mechatronics",
        code: "7510203",
        name: "Công nghệ Kỹ thuật Cơ điện tử",
        faculty: "Khoa Cơ khí Chế tạo máy",
        duration: 4,
        description: "Giao thoa đỉnh cao của cơ khí cơ cấu chính xác, vi mạch điện tử điều khiển và hệ điều hành kỹ thuật số lập trình cánh tay robot thông minh.",
        highschoolCombi: ["A00", "A01", "D01", "D07"],
        cutOffScore2025: 26.25,
        highlightPoints: [
          "Phòng LAB hiện cơ cấu Robot tự động hóa thông minh bậc nhất.",
          "Tham dự cuộc thi Robocon toàn quốc thường niên.",
          "Lộ trình đào tạo tối ưu hóa theo chương trình chuẩn giáo dục Hoa Kỳ."
        ]
      },
      {
        id: "it",
        code: "7480101",
        name: "Công nghệ Thông tin",
        faculty: "Khoa Công nghệ Thông tin",
        duration: 4,
        description: "Trọng điểm đào tạo chuyên sâu về Kỹ thuật phần mềm vững chắc, trí tuệ nhân tạo (AI), xử lý phân tích dữ liệu lớn và an toàn thông tin mạng lưới.",
        highschoolCombi: ["A00", "A01", "D01", "D90"],
        cutOffScore2025: 26.9,
        highlightPoints: [
          "Chất lượng đào tạo chuẩn kiểm định khắt khe AUN-QA khu vực.",
          "Cơ hội nhận học bổng tài trợ dự án nghiên cứu từ Samsung, Intel.",
          "Mạng lưới cựu sinh viên thâm niên giữ vị trí then chốt tại Silicon Valley."
        ]
      },
      {
        id: "ee",
        code: "7510301",
        name: "Công nghệ Kỹ thuật Điện, Điện tử",
        faculty: "Khoa Điện - Điện tử",
        duration: 4,
        description: "Học tập thiết chế mạng lưới điện phân phối thông minh, thiết kế bo vi mạch bán dẫn và tối ưu hóa hệ thống IoT cho nhà thông minh thời đại mới.",
        highschoolCombi: ["A00", "A01", "D01", "D07"],
        cutOffScore2025: 25.75,
        highlightPoints: [
          "Mạng lưới phòng thí nghiệm IoT tài trợ bởi Intel Corporation.",
          "Giảng dạy ngôn ngữ tích hợp Anh - Việt chất lượng cao.",
          "Nhận học bổng chuyển tiếp tu nghiệp trực tiếp tại Nhật Bản, Đài Loan."
        ]
      },
      {
        id: "garment",
        code: "7540204",
        name: "Công nghệ May",
        faculty: "Khoa Thời trang và Thiết kế",
        duration: 4,
        description: "Cơ sở nòng cốt đào tạo thiết kế thời trang, lập trình vận hành chuyền may tự động và quản lý chuỗi may dệt may toàn cầu.",
        highschoolCombi: ["A00", "A01", "D01", "D09"],
        cutOffScore2025: 23.5,
        highlightPoints: [
          "Ứng dụng thiết kế ảo ba chiều 3D CAD/CAM hiện đại.",
          "Triệt để thực hành tại Showroom biểu diễn thời trang thực nghiệm.",
          "95% tìm thấy cơ hội việc làm đúng chuyên môn ngay trước khi nhận bằng."
        ]
      },
      {
        id: "logistics",
        code: "7510605",
        name: "Logistics và Quản lý Chuỗi cung ứng",
        faculty: "Khoa Kinh tế",
        duration: 4,
        description: "Chuyên sâu về luân chuyển dòng vật tư đa phương thức, kiểm định kho vận cảng biển quốc tế và tối ưu hóa dòng dịch vụ toàn cầu.",
        highschoolCombi: ["A00", "A01", "D01", "D90"],
        cutOffScore2025: 25.9,
        highlightPoints: [
          "Tự do thao tác tại phần mềm logistics cảng biển Cát Lái.",
          "Giáo trình FIATA hàng đầu thế giới phân bổ chứng chỉ chuẩn hóa quốc tế."
        ]
      },
      {
        id: "foodtech",
        code: "7540101",
        name: "Công nghệ Thực phẩm",
        faculty: "Khoa Công nghệ Hóa học & Thực phẩm",
        duration: 4,
        description: "Đào tạo các kỹ sư làm chuẩn quy trình chế biến lương thực, bảo quản sau thu hoạch, nghiên cứu tối ưu hóa vi sinh, an toàn vệ sinh chất lượng HACCP và phát triển nước giải khát, dinh dưỡng lành mạnh.",
        highschoolCombi: ["A00", "B00", "D07", "D08"],
        cutOffScore2025: 24.85,
        highlightPoints: [
          "Xưởng thực hành dây chuyền đồ uống, chế phẩm vi sinh chuẩn xuất khẩu.",
          "Liên kết kiến tập sâu rộng cùng Acecook, Nestlé và Heineken Việt Nam.",
          "Có thị phần nhu cầu lao động kỹ sư R&D thực phẩm cực kỳ khát nhân lực chất lượng cao."
        ]
      }
    ];

    const SHOWCASE_STUDENTS = {
      "22110123": {
        id: "22110123",
        fullName: "Vũ Nguyễn Minh Quân",
        birthDate: "2004-03-12",
        gender: "Nam",
        major: "Công nghệ Kỹ thuật Ô tô",
        faculty: "Khoa Cơ khí Động lực",
        classCode: "22110OT1A",
        cohort: "K22 (Khóa 2022 - 2026)",
        cumulativeGPA: 3.65,
        cumulativeGPA10: 9.1,
        totalCreditsEarned: 78,
        semesters: [
          {
            semesterName: "Học kỳ I - Năm học 2024-2025",
            semesterGPA: 3.52,
            semesterCredits: 19,
            subjects: [
              { code: "AUTO3301", name: "Lý thuyết động cơ đốt trong", credits: 3, componentScore: 8.5, examScore: 8.7, finalScore: 8.6, letterGrade: "A" },
              { code: "AUTO3402", name: "Hệ thống truyền lực & Di động", credits: 4, componentScore: 7.8, examScore: 8.4, finalScore: 8.2, letterGrade: "B+" },
              { code: "CAD2102", name: "Vẽ kỹ thuật 3D trên máy tính", credits: 2, componentScore: 9.5, examScore: 9.2, finalScore: 9.3, letterGrade: "A+" },
              { code: "MATH1350", name: "Đại số hạt nhân tương đương", credits: 3, componentScore: 6.5, examScore: 7.2, finalScore: 7.0, letterGrade: "B" },
              { code: "SOCI1202", name: "Kỹ năng giao tiếp nâng cao", credits: 2, componentScore: 9.0, examScore: 8.5, finalScore: 8.7, letterGrade: "A" },
              { code: "AUTO2501", name: "Thực hành trang bị điện ô tô", credits: 5, componentScore: 8.8, examScore: 8.8, finalScore: 8.8, letterGrade: "A" }
            ]
          },
          {
            semesterName: "Học kỳ II - Năm học 2024-2025",
            semesterGPA: 3.76,
            semesterCredits: 18,
            subjects: [
              { code: "AUTO3304", name: "Cơ điện tử ô tô thông minh", credits: 3, componentScore: 9.1, examScore: 9.5, finalScore: 9.3, letterGrade: "A+" },
              { code: "AUTO3412", name: "Kiểm định & Chuẩn động cơ", credits: 4, componentScore: 8.2, examScore: 8.8, finalScore: 8.6, letterGrade: "A" },
              { code: "MACO3312", name: "Quản trị cơ học xưởng", credits: 3, componentScore: 8.0, examScore: 8.5, finalScore: 8.3, letterGrade: "B+" },
              { code: "RESE1301", name: "Nghiên cứu công nghệ mới", credits: 2, componentScore: 9.0, examScore: 9.0, finalScore: 9.0, letterGrade: "A" },
              { code: "AUTO4210", name: "Thực hành động cơ xe điện lai Hybrid", credits: 6, componentScore: 9.4, examScore: 8.8, finalScore: 9.0, letterGrade: "A" }
            ]
          }
        ]
      },
      "23110234": {
        id: "23110234",
        fullName: "Lê Minh Phương Thảo",
        birthDate: "2005-07-22",
        gender: "Nữ",
        major: "Công nghệ Thông tin",
        faculty: "Khoa Công nghệ Thông tin",
        classCode: "23110IT2B",
        cohort: "K23 (Khóa 2023 - 2027)",
        cumulativeGPA: 3.88,
        cumulativeGPA10: 9.7,
        totalCreditsEarned: 43,
        semesters: [
          {
            semesterName: "Học kỳ II - Năm học 2024-2025",
            semesterGPA: 3.84,
            semesterCredits: 21,
            subjects: [
              { code: "AI330101", name: "Nhập môn Học máy & Nhận dạng mẫu", credits: 4, componentScore: 9.2, examScore: 9.2, finalScore: 9.2, letterGrade: "A" },
              { code: "COMP3304", name: "Phân tích thiết kế hệ thống phần mềm", credits: 3, componentScore: 8.8, examScore: 9.4, finalScore: 9.1, letterGrade: "A" },
              { code: "COMP3202", name: "Thực hành Kiến trúc hướng dịch vụ SOA", credits: 2, componentScore: 9.5, examScore: 9.5, finalScore: 9.5, letterGrade: "A+" },
              { code: "COMP3305", name: "An toàn bảo mật hệ thống mạng thông tin", credits: 3, componentScore: 8.5, examScore: 8.8, finalScore: 8.7, letterGrade: "A" },
              { code: "DESI3304", name: "Phổ cập Điện toán đám mây Cloud", credits: 3, componentScore: 9.0, examScore: 9.2, finalScore: 9.1, letterGrade: "A" },
              { code: "ENGL2601", name: "Tiếng Anh chuyên ngành - IELTS II", credits: 6, componentScore: 9.4, examScore: 8.8, finalScore: 9.0, letterGrade: "A" }
            ]
          }
        ]
      }
    };

    // 2. TIMEOUT TICKERS ROTATION
    const tickers = [
      "🔥 Tuyển sinh 2026: HCMUTE mở đợt nhận hồ sơ xét tuyển học bạ 5 học kỳ từ ngày 01/06/2026.",
      "🏆 Chúc mừng 2 dự án nghiên cứu AI & Robot cánh tay tự hành đạt giải Nhất Quốc Gia.",
      "🎓 Trường Đại Học Sư Phạm Kỹ Thuật TP.HCM vinh dự xếp vị trí thứ 3 miền Nam về chất lượng kỹ thuật.",
      "🧬 Ngành mới Công nghệ Thực phẩm dẫn dắt chỉ tiêu tuyển sinh khối Khoa học Ứng dụng năm học mới."
    ];
    let tickerIdx = 0;
    setInterval(() => {
      tickerIdx = (tickerIdx + 1) % tickers.length;
      document.getElementById("ticker-text").innerText = tickers[tickerIdx];
    }, 5000);

    // 3. TAB CONTROLLER WITH TRANSITIONS
    function switchTab(tabId) {
      document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.className = "tab-btn py-2 px-3.5 md:px-5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 tracking-tight shrink-0 text-slate-650 hover:text-slate-900 hover:bg-slate-100";
      });
      document.querySelectorAll(".tab-section").forEach(sec => {
        sec.classList.remove("active");
        sec.style.display = "none";
      });

      const activeBtn = document.getElementById("tab-" + tabId);
      if (activeBtn) {
        activeBtn.className = "tab-btn py-2 px-3.5 md:px-5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 tracking-tight shrink-0 bg-blue-50 text-blue-700 active";
      }

      const activeSec = document.getElementById("content-" + tabId);
      if (activeSec) {
        activeSec.style.display = "block";
        setTimeout(() => {
          activeSec.classList.add("active");
        }, 10);
      }

      // Smooth scroll back to navigation
      window.scrollTo({
        top: 300,
        behavior: 'smooth'
      });
    }

    // 4. ADMISSIONS FILTERING ENGINE
    let selectedCombiFilter = "";

    function filterByCombi(combi) {
      selectedCombiFilter = combi;
      document.querySelectorAll(".combi-tag-btn").forEach(btn => {
        btn.className = "combi-tag-btn bg-slate-100 font-mono font-bold text-[9px] px-2 py-1 rounded text-slate-600 hover:bg-slate-200 shadow-sm transition-all";
      });
      
      const activeBtnId = combi ? "tag-" + combi : "tag-all";
      const activeBtn = document.getElementById(activeBtnId);
      if (activeBtn) {
        activeBtn.className = "combi-tag-btn bg-slate-900 font-mono font-bold text-[9px] px-2 py-1 rounded text-white shadow-sm transition-all";
      }

      filterAdmissions();
    }

    function filterAdmissions() {
      const q = document.getElementById("admissions-search").value.trim().toLowerCase();
      const parent = document.getElementById("majors-grid");
      parent.innerHTML = "";

      let filtered = MAJORS_DATA.filter(m => {
        const matchesQ = m.name.toLowerCase().includes(q) || m.code.includes(q) || m.faculty.toLowerCase().includes(q);
        const matchesCombi = selectedCombiFilter ? m.highschoolCombi.includes(selectedCombiFilter) : true;
        return matchesQ && matchesCombi;
      });

      if (filtered.length === 0) {
        parent.innerHTML = "<div class='text-center p-8 bg-white border border-slate-200 rounded-2xl col-span-2 text-xs font-semibold text-slate-500'>Không khớp thông tin mã ngành nào tuyển sinh phù hợp. Bạn hãy tìm từ khoá khác!</div>";
        return;
      }

      filtered.forEach((m) => {
        const combiBadges = m.highschoolCombi.map(c => "<span class='bg-blue-50 text-blue-800 border-2 border-blue-100 px-1.5 py-0.5 rounded font-black font-mono text-[9px]'>" + c + "</span>").join(" ");
        const highlights = m.highlightPoints.map(h => "<li class='flex gap-1.5 items-start text-xs text-slate-650'><span class='text-amber-500 shrink-0 font-bold'>✦</span> <span>" + h + "</span></li>").join("");
        
        const badgeWord = m.id === "foodtech" ? "<span class='bg-orange-500 text-white font-mono text-[9px] font-black px-2 py-0.5 rounded uppercase animate-pulse shrink-0'>HOT NEW ⭐</span>" : "";

        parent.innerHTML += '<div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between text-left relative overflow-hidden group hover:border-blue-400">' +
          '<div class="space-y-4">' +
            '<div class="flex justify-between items-start gap-2">' +
              '<div>' +
                '<div class="flex items-center gap-2">' +
                  '<h4 class="font-extrabold text-sm text-slate-900 tracking-tight leading-snug group-hover:text-blue-700 transition-colors">' + m.name + '</h4>' +
                  badgeWord +
                '</div>' +
                '<p class="text-[10px] font-mono text-slate-400 mt-1 uppercase font-bold">Mã Ngành: <span class="text-blue-600 font-extrabold">' + m.code + '</span></p>' +
              '</div>' +
              '<span class="bg-slate-900 text-white font-mono text-[9px] font-black tracking-wider px-2.5 py-1 rounded-full shrink-0 shadow-sm uppercase">' + m.cutOffScore2025 + ' ĐIỂM</span>' +
            '</div>' +
            '<p class="text-slate-550 text-xs font-normal leading-relaxed">' + m.description + '</p>' +
            '<div class="pt-3 border-t border-dashed border-slate-150 flex flex-wrap gap-2 items-center text-[10px]">' +
              '<span class="text-slate-400 font-mono font-bold">Tổ hợp xét tuyển:</span>' +
              '<div class="flex flex-wrap gap-1">' + combiBadges + '</div>' +
            '</div>' +
            '<div id="points-' + m.id + '" class="hidden space-y-2.5 mt-4 pt-4 border-t border-slate-150 bg-slate-50 p-4 rounded-2xl animate-fade-in text-xs">' +
              '<h5 class="font-bold text-slate-800 uppercase text-[9px] tracking-wider font-mono flex items-center gap-1">' +
                '<span class="h-1.5 w-1.5 bg-blue-650 rounded-full"></span>' + 
                'Đặc Điểm & Điểm Nhấn Toàn Bộ Khóa Học:' +
              '</h5>' +
              '<ul class="space-y-2 font-medium leading-relaxed font-sans">' + highlights + '</ul>' +
            '</div>' +
          '</div>' +
          '<div class="pt-4 mt-3 border-t border-slate-100 flex justify-between items-center text-xs">' +
            '<span class="text-slate-400 font-mono font-semibold">Khoa: ' + m.faculty + '</span>' +
            '<button onclick="togglePoints(\'' + m.id + '\')" id="btn-' + m.id + '" class="text-blue-650 font-bold tracking-tight cursor-pointer hover:underline">Xem đặc điểm đào tạo →</button>' +
          '</div>' +
        '</div>';
      });
    }

    function togglePoints(majorId) {
      const el = document.getElementById("points-" + majorId);
      const btn = document.getElementById("btn-" + majorId);
      if (el.classList.contains("hidden")) {
        el.classList.remove("hidden");
        btn.innerText = "Thu nhỏ thông tin ↑";
      } else {
        el.classList.add("hidden");
        btn.innerText = "Xem đặc điểm đào tạo →";
      }
    }

    // 5. ACADEMIC GRADE RECORD QUERY ENGINE
    let currentOfflineStudent = null;

    function searchStudent() {
      const val = document.getElementById("student-id-input").value.trim();
      const area = document.getElementById("student-profile-area");

      area.innerHTML = "";

      if (!val) return;

      let student = SHOWCASE_STUDENTS[val];
      if (!student) {
        if (/^\\d+$/.test(val) && val.length >= 5) {
          student = generateProceduralProfile(val);
        } else {
          area.innerHTML = "<div class='bg-amber-50 border border-amber-200 text-amber-805 p-5 rounded-2xl text-xs font-semibold text-center animate-bounce-in'>" +
             "❌ Không tìm thấy mã số này trong cơ sở mẫu học tập. Hãy điền số <strong>22110123</strong> hoặc <strong>23110234</strong>!</div>";
          return;
        }
      }

      currentOfflineStudent = student;
      drawStudent(student);
    }

    function generateProceduralProfile(mssv) {
      let hash = 0;
      for (let i = 0; i < mssv.length; i++) {
        hash = mssv.charCodeAt(i) + ((hash << 5) - hash);
      }
      const absHash = Math.abs(hash);

      const femaleNames = ["Nguyễn Khánh Vy", "Lê Phương Thảo", "Trần Việt Hương", "Vũ Mai Hoa", "Hoàng Kim Ngân", "Phạm Trúc Diễm"];
      const maleNames = ["Phạm Nhật Tiến", "Nguyễn Tuấn Kiệt", "Trần Đại Dương", "Lâm Đình Trọng", "Võ Minh Đức", "Đỗ Hải Long"];
      const isFemale = absHash % 2 === 0;
      const fullName = isFemale ? femaleNames[absHash % femaleNames.length] : maleNames[absHash % maleNames.length];

      const yearOfAdmission = mssv.startsWith("22") ? "22" : mssv.startsWith("23") ? "23" : mssv.startsWith("24") ? "24" : "21";
      const actualYearStr = "20" + yearOfAdmission;
      const cohort = "K" + yearOfAdmission + " (Khóa " + actualYearStr + " - " + (Number(actualYearStr) + 4) + ")";

      const selectedMajor = MAJORS_DATA[absHash % MAJORS_DATA.length];
      const classCode = yearOfAdmission + "110" + selectedMajor.id.substring(0, 3).toUpperCase() + (1 + (absHash % 3)) + (isFemale ? "B" : "A");

      const gpaRaw = Math.min(4.0, (2.8 + (absHash % 10) * 0.13));
      const gpaNum = Math.round(gpaRaw * 100) / 100;
      const gpaY = Math.round(gpaNum * 2.5 * 10) / 10;

      const subjectsA = [
        { code: "COMP1301", name: "Nhập môn Kỹ nghệ & Thực hành", credits: 3 },
        { code: "MATH1301", name: "Toán cao cấp đại cương", credits: 3 },
        { code: "CAD2102", name: "Bản vẽ kỹ thuật 3D CAD máy tính", credits: 2 },
        { code: "ENG1201", name: "Tiếng Anh đại cương căn bản I", credits: 2 },
        { code: "SOCI1202", name: "Phương pháp làm việc chuyên môn nhóm", credits: 2 },
        { code: "WORK2301", name: "Thực hành Đề án nòng cốt sản phẩm 1", credits: 3 }
      ];

      const subjectsB = [
        { code: "ADV4502", name: "Khoa học Dữ liệu & AI Ứng Dụng", credits: 4 },
        { code: "MGMT2301", name: "Quản trị quy trình chất lượng QA/QC", credits: 3 },
        { code: "MATH1302", name: "Xác suất thống kê cho kỹ sư", credits: 3 },
        { code: "ENG1202", name: "Tiếng Anh chuyên nghiệp IELTS II", credits: 3 },
        { code: "PRAC3206", name: "Thực hành thiết kế tối đa hóa lực", credits: 2 }
      ];

      function calcs(seed, bGpa) {
        const varScore = (seed % 30) * 0.08 - 1.2;
        const finalScore = Math.min(10.0, Math.max(4.0, Math.round((bGpa * 2.5 + varScore) * 10) / 10));
        let letter = "C";
        if (finalScore >= 9.0) letter = "A+";
        else if (finalScore >= 8.5) letter = "A";
        else if (finalScore >= 8.0) letter = "B+";
        else if (finalScore >= 7.0) letter = "B";
        else if (finalScore >= 6.5) letter = "C+";
        else if (finalScore >= 5.5) letter = "C";
        else letter = "D";

        return {
          componentScore: Math.min(10.0, Math.round((finalScore - 0.4) * 10) / 10),
          examScore: Math.min(10.0, Math.round((finalScore + 0.2) * 10) / 10),
          finalScore: finalScore,
          letterGrade: letter
        }
      }

      const semesterI = {
        semesterName: "Học kỳ I - Năm học " + (Number(actualYearStr)) + "-" + (Number(actualYearStr) + 1),
        semesterGPA: Math.round((gpaNum - 0.08) * 100) / 100,
        semesterCredits: 15,
        subjects: subjectsA.map((s, idx) => {
          const c = calcs(absHash + idx, gpaNum - 0.08);
          return { ...s, ...c };
        })
      };

      const semesterII = {
        semesterName: "Học kỳ II - Năm học " + (Number(actualYearStr)) + "-" + (Number(actualYearStr) + 1),
        semesterGPA: gpaNum,
        semesterCredits: 15,
        subjects: subjectsB.map((s, idx) => {
          const c = calcs(absHash + idx + 10, gpaNum);
          return { ...s, ...c };
        })
      };

      return {
        id: mssv,
        fullName,
        birthDate: "2004-10-18",
        gender: isFemale ? "Nữ" : "Nam",
        major: selectedMajor.name,
        faculty: selectedMajor.faculty,
        classCode,
        cohort,
        cumulativeGPA: gpaNum,
        cumulativeGPA10: gpaY,
        totalCreditsEarned: 30,
        semesters: [semesterI, semesterII]
      }
    }

    function drawStudent(student) {
      const area = document.getElementById("student-profile-area");
      const semOptHtml = student.semesters.map((s, idx) => "<option value='" + idx + "'>" + s.semesterName + "</option>").join("");
      const defaultSemIdx = 0;
      const subjectsTable = makeSubjectsTable(student.semesters[defaultSemIdx].subjects);

      area.className = "space-y-6 text-left animate-bounce-in";
      area.innerHTML = '<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">' +
        '<!-- Student Card Info -->' +
        '<div class="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-3xl text-white border-2 border-amber-400/80 shadow-xl space-y-6 relative overflow-hidden h-max">' +
          '<div class="absolute -top-12 -right-12 h-32 w-32 bg-amber-400/10 rounded-full blur-xl pointer-events-none"></div>' +
          '<div class="flex gap-4 items-center relative z-10">' +
            '<div id="student-avatar-box" class="h-12 w-12 rounded-full overflow-hidden bg-slate-800 p-0.5 border border-slate-700 flex items-center justify-center font-black text-white text-lg font-mono uppercase bg-blue-600 shadow-lg">' +
              student.fullName[0] +
            '</div>' +
            '<div>' +
              '<h4 class="font-extrabold text-base text-slate-100 tracking-tight leading-tight">' + student.fullName + '</h4>' +
              '<p class="text-[9px] text-slate-400 mt-1 uppercase font-mono">MSSV: <span class="text-amber-400 font-bold">' + student.id + '</span></p>' +
            '</div>' +
          '</div>' +
          '<div class="space-y-2.5 border-t border-slate-800 pt-4 text-xs font-semibold text-slate-350 text-slate-300">' +
            '<div class="flex justify-between"><span class="text-slate-500 font-mono">Chuyên ngành:</span><span class="text-slate-100 font-extrabold">' + student.major + '</span></div>' +
            '<div class="flex justify-between"><span class="text-slate-500 font-mono">Lớp sinh hoạt:</span><span class="text-slate-100 font-extrabold">' + student.classCode + '</span></div>' +
            '<div class="flex justify-between"><span class="text-slate-500 font-mono">Niên khóa:</span><span class="text-slate-100 font-bold">' + student.cohort + '</span></div>' +
            '<div class="flex justify-between"><span class="text-slate-500 font-mono">Quản lý khoa:</span><span class="text-slate-100 font-bold">' + student.faculty + '</span></div>' +
          '</div>' +
          '<div class="pt-4 border-t border-slate-850 pt-4 grid grid-cols-2 gap-4 text-center">' +
            '<div class="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 shadow-inner">' +
              '<span class="text-slate-400 text-[9px] font-mono block uppercase font-bold tracking-wider">CUMULATIVE GPA</span>' +
              '<span id="overall-gpa-badge" class="text-2xl font-black text-amber-400 block mt-1">' + student.cumulativeGPA + '</span>' +
            '</div>' +
            '<div class="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 shadow-inner">' +
              '<span class="text-slate-400 text-[9px] font-mono block uppercase font-bold tracking-wider">HỆ ĐIỂM 10</span>' +
              '<span id="overall-gpa10-badge" class="text-2xl font-black text-blue-400 block mt-1">' + student.cumulativeGPA10 + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<!-- Student Transcript Records -->' +
        '<div class="lg:col-span-2 space-y-4 bg-white p-5 rounded-3xl border border-slate-150 shadow-sm relative overflow-hidden">' +
          '<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-150 pb-3">' +
            '<div>' +
              '<h4 class="font-extrabold text-slate-900 text-sm tracking-tight leading-tight">Bảng Trích Lục Học Phần Học Điểm</h4>' +
              '<p class="text-[9px] text-slate-400 uppercase font-black tracking-tight mt-1 font-mono">Cơ sở dữ liệu lưu ngoại tuyến tĩnh</p>' +
            '</div>' +
            '<select id="semester-selector" onchange="changeSemester()" class="bg-slate-100 font-extrabold border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-800 outline-none cursor-pointer">' +
              semOptHtml +
            '</select>' +
          '</div>' +
          '<div class="overflow-x-auto">' +
            '<table class="w-full text-xs text-left text-slate-700">' +
              '<thead>' +
                '<tr class="bg-slate-50 border-b border-slate-150 font-mono text-[9px] text-slate-500 uppercase font-black tracking-widest">' +
                  '<th class="p-3">Mã Môn</th>' +
                  '<th class="p-3">Tên Môn Học Phần</th>' +
                  '<th class="p-3 text-center">Số TC</th>' +
                  '<th class="p-3 text-center">QT (35%)</th>' +
                  '<th class="p-3 text-center">Thi (65%)</th>' +
                  '<th class="p-3 text-center">Điểm Tổng</th>' +
                  '<th class="p-3 text-center">Điểm Chữ</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody id="subjects-table-body" class="font-semibold text-slate-800">' +
                subjectsTable +
              '</tbody>' +
            '</table>' +
          '</div>' +
          '<!-- Slider simulator -->' +
          '<div class="pt-4 border-t border-slate-150 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl space-y-3.5">' +
            '<div class="flex items-center gap-1.5">' +
              '<i data-lucide="calculator" class="h-4.5 w-4.5 text-blue-600"></i>' +
              '<h4 class="font-extrabold text-xs text-blue-900 uppercase tracking-wider font-mono">Trình Mô Phỏng Học Lực Kỳ Học Động Tác</h4>' +
            '</div>' +
            '<p class="text-[11px] text-slate-600 leading-relaxed font-normal">' +
              'Động thái điều chỉnh thanh điểm quá trình và thi của <strong class="text-blue-600">môn đầu tiên</strong> dưới đây để hệ thống tự tái cấu trúc kết quả học tập tức thì:' +
            '</p>' +
            '<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">' +
              '<div class="space-y-1">' +
                '<label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Điểm Quá trình (QT): <strong id="sim-qt-score" class="text-blue-600 font-extrabold text-xs">8.5</strong></label>' +
                '<input type="range" id="simulator-qt" min="0" max="10" step="0.1" value="8.5" oninput="simulateChange()" class="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none">' +
              '</div>' +
              '<div class="space-y-1">' +
                '<label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Điểm Thi Cuối kỳ (Thi): <strong id="sim-exam-score" class="text-rose-500 font-extrabold text-xs">8.7</strong></label>' +
                '<input type="range" id="simulator-exam" min="0" max="10" step="0.1" value="8.7" oninput="simulateChange()" class="w-full accent-rose-500 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none">' +
              '</div>' +
            '</div>' +
            '<div class="p-3 bg-white border border-slate-150 rounded-xl flex items-center justify-between text-xs font-mono font-bold text-slate-700">' +
              '<span class="text-slate-400">KẾT QUẢ QUY ĐỔI MÔN HIỆU QUẢ:</span>' +
              '<span id="sim-letter-grade" class="bg-emerald-100 text-emerald-800 px-3 py-1 rounded text-xs font-black">A (8.6)</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

      lucide.createIcons();
      // Initialize simulator values matching the first element
      if (student.semesters[defaultSemIdx] && student.semesters[defaultSemIdx].subjects[0]) {
        const sub = student.semesters[defaultSemIdx].subjects[0];
        document.getElementById("simulator-qt").value = sub.componentScore;
        document.getElementById("simulator-exam").value = sub.examScore;
        document.getElementById("sim-qt-score").innerText = sub.componentScore;
        document.getElementById("sim-exam-score").innerText = sub.examScore;
        document.getElementById("sim-letter-grade").className = "bg-emerald-100 text-emerald-800 px-3 py-1 rounded text-xs font-black";
        document.getElementById("sim-letter-grade").innerText = sub.letterGrade + " (" + sub.finalScore + ")";
      }
    }

    function makeSubjectsTable(subjects) {
      return subjects.map(s => {
        return '<tr class="border-b border-slate-100 hover:bg-slate-50 font-semibold text-slate-800 transition-colors">' +
          '<td class="p-3 font-mono text-[10px] text-slate-400 font-bold uppercase">' + s.code + '</td>' +
          '<td class="p-3 text-xs text-left font-bold text-slate-800">' + s.name + '</td>' +
          '<td class="p-3 text-center font-mono text-slate-400 font-bold">' + s.credits + '</td>' +
          '<td class="p-3 text-center font-mono text-blue-600">' + s.componentScore + '</td>' +
          '<td class="p-3 text-center font-mono text-rose-500">' + s.examScore + '</td>' +
          '<td class="p-3 text-center font-mono text-slate-900 font-black bg-slate-50">' + s.finalScore + '</td>' +
          '<td class="p-3 text-center font-mono text-emerald-600 font-extrabold">' + s.letterGrade + '</td>' +
        '</tr>';
      }).join("");
    }

    function changeSemester() {
      if (!currentOfflineStudent) return;
      const idx = Number(document.getElementById("semester-selector").value);
      const sem = currentOfflineStudent.semesters[idx];
      if (!sem) return;

      document.getElementById("subjects-table-body").innerHTML = makeSubjectsTable(sem.subjects);

      if (sem.subjects[0]) {
        const sub = sem.subjects[0];
        document.getElementById("simulator-qt").value = sub.componentScore;
        document.getElementById("simulator-exam").value = sub.examScore;
        document.getElementById("sim-qt-score").innerText = sub.componentScore;
        document.getElementById("sim-exam-score").innerText = sub.examScore;
        document.getElementById("sim-letter-grade").className = "bg-emerald-100 text-emerald-800 px-3 py-1 rounded text-xs font-black";
        document.getElementById("sim-letter-grade").innerText = sub.letterGrade + " (" + sub.finalScore + ")";
      }
    }

    function simulateChange() {
      if (!currentOfflineStudent) return;
      const sIdx = Number(document.getElementById("semester-selector").value);
      const sem = currentOfflineStudent.semesters[sIdx];
      if (!sem || !sem.subjects[0]) return;

      const qt = Number(document.getElementById("simulator-qt").value);
      const exam = Number(document.getElementById("simulator-exam").value);

      document.getElementById("sim-qt-score").innerText = qt;
      document.getElementById("sim-exam-score").innerText = exam;

      const finalScore = Math.min(10.0, Math.max(0.0, Math.round((qt * 0.3 + exam * 0.7) * 10) / 10));

      let letter = "F";
      let styleClass = "bg-rose-100 text-rose-800 px-3 py-1 rounded text-xs font-black";
      if (finalScore >= 9.0) { letter = "A+"; styleClass = "bg-emerald-100 text-emerald-800 px-3 py-1 rounded text-xs font-black"; }
      else if (finalScore >= 8.5) { letter = "A"; styleClass = "bg-emerald-100 text-emerald-800 px-3 py-1 rounded text-xs font-black"; }
      else if (finalScore >= 8.0) { letter = "B+"; styleClass = "bg-green-100 text-green-800 px-3 py-1 rounded text-xs font-black"; }
      else if (finalScore >= 7.0) { letter = "B"; styleClass = "bg-blue-100 text-blue-800 px-3 py-1 rounded text-xs font-black"; }
      else if (finalScore >= 6.5) { letter = "C+"; styleClass = "bg-indigo-100 text-indigo-800 px-3 py-1 rounded text-xs font-black"; }
      else if (finalScore >= 5.5) { letter = "C"; styleClass = "bg-slate-100 text-slate-705 px-3 py-1 rounded text-xs font-black"; }
      else if (finalScore >= 5.0) { letter = "D+"; styleClass = "bg-amber-100 text-amber-850 px-3 py-1 rounded text-xs font-black"; }
      else if (finalScore >= 4.0) { letter = "D"; styleClass = "bg-amber-100 text-amber-900 px-3 py-1 rounded text-xs font-black"; }

      const targetBadge = document.getElementById("sim-letter-grade");
      targetBadge.className = styleClass;
      targetBadge.innerText = letter + " (" + finalScore + ")";

      const firstRow = document.getElementById("subjects-table-body").children[0];
      if (firstRow) {
        firstRow.children[3].innerText = qt;
        firstRow.children[4].innerText = exam;
        firstRow.children[5].innerText = finalScore;
        firstRow.children[6].innerText = letter;
      }
    }

    // 6. ADMISSIONS MATH QUIZ MATCHING WIDGET (OFFLINE VALUE ESTIMATE)
    function runMockMatching() {
      const math = Number(document.getElementById("mock-math").value);
      const phy = Number(document.getElementById("mock-phy").value);
      const chem = Number(document.getElementById("mock-chem").value);

      document.getElementById("mock-math-val").innerText = math;
      document.getElementById("mock-phy-val").innerText = phy;
      document.getElementById("mock-chem-val").innerText = chem;

      const sum = Math.round((math + phy + chem) * 10) / 10;
      document.getElementById("mock-total").innerText = sum;

      const itemsDiv = document.getElementById("mock-matching-results");
      itemsDiv.innerHTML = "";

      let qualified = MAJORS_DATA.filter(m => sum >= (m.cutOffScore2025 - 0.5));
      if (qualified.length === 0) {
        itemsDiv.innerHTML = "<span class='text-amber-500 font-bold'>Rất tiếc! Học thế mạnh hiện tại chưa đạt điểm chuẩn ngành mẫu nào (May mặc từ 23.5 điểm). Hãy tiếp tục phấn đấu nhé!</span>";
        return;
      }

      qualified.forEach(m => {
        const star = m.id === "foodtech" ? "⭐ " : "";
        itemsDiv.innerHTML += '<span class="bg-slate-900 text-white border border-slate-700 py-1.5 px-3 rounded-xl font-bold cursor-pointer hover:bg-slate-800 transition-all text-xs flex items-center gap-1">' +
            '<span class="h-1.5 w-1.5 rounded-full bg-emerald-450 bg-emerald-400"></span>' +
            star + m.name + " (" + m.cutOffScore2025 + "đ)</span>";
      });
    }

    // 7. MULTIPURPOSE NOTIFICATION MOCK (REPLACES REPLAY BACK)
    function requestMentorOffline(mentorName) {
      alert("✅ CAMPUS OFFLINE PORTAL: Gửi yêu cầu đăng ký tư vấn sinh viên [" + mentorName + "] thành công! Ban liên lạc Chi hội cựu sinh viên sẽ rà soát học bạ mác số của bạn và liên lạc sớm.");
    }

    // 8. ON STARTUP LIFE CYCLE
    window.onload = function() {
      lucide.createIcons();
      filterAdmissions();
      searchStudent();
      runMockMatching();

      // Attempt login details matching registry
      try {
        const stored = localStorage.getItem("hcmute_registered_accounts");
        if (stored) {
          const list = JSON.parse(stored);
          if (list && list.length > 0) {
            const user = list[list.length - 1];
            document.getElementById("user-fullname").innerText = user.name;
            document.getElementById("user-role").innerText = "Chất lượng cao: " + user.major;
            document.getElementById("user-initial").innerText = user.name[0];
            document.getElementById("student-id-input").value = user.id || "22110123";
            searchStudent();
          }
        }
      } catch(e) {
        console.log("Local static recovery skip, Guest demo active");
      }
    };
  </script>
</body>
</html>`;
}
