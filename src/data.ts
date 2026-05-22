/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Major, Alumnus, NewsEvent, StudentProfile } from "./types";

export const MAJORS_DATA: Major[] = [
  {
    id: "auto",
    code: "7510205",
    name: "Công nghệ Kỹ thuật Ô tô",
    faculty: "Khoa Cơ khí Động lực",
    duration: 4,
    description: "Ngành mũi nhọn hàng đầu của trường, đào tạo kỹ sư am hiểu sâu sắc về thiết kế, chế tạo, bảo dưỡng và vận hành các loại ô tô hiện đại, hệ thống xe điện và tự hành.",
    highschoolCombi: ["A00", "A01", "D01", "D90"],
    cutOffScore2025: 26.85,
    highlightPoints: [
      "Hệ thống xưởng thực hành hiện đại được tài trợ bởi Toyota, Hyundai, Mitsubishi.",
      "Cơ hội thực tập tại các tập đoàn lớn toàn cầu như VinFast, Bosch, Thaco.",
      "99% sinh viên có việc làm đúng chuyên ngành ngay khi tốt nghiệp."
    ]
  },
  {
    id: "mechatronics",
    code: "7510203",
    name: "Công nghệ Kỹ thuật Cơ điện tử",
    faculty: "Khoa Cơ khí Chế tạo máy",
    duration: 4,
    description: "Sự kết hợp hoàn hảo giữa Cơ khí chính xác, Kỹ thuật Điện tử và Công nghệ thông tin để kiến tạo các hệ thống sản xuất tự động, robot thông minh hàng đầu.",
    highschoolCombi: ["A00", "A01", "D01", "D07"],
    cutOffScore2025: 26.25,
    highlightPoints: [
      "Phòng Lab nghiên cứu về Robot và AI tiên tiến đạt chuẩn khu vực.",
      "Tham gia các cuộc thi công nghệ lớn toàn quốc như Robocon, AI Challenge.",
      "Đối tác đào tạo thân thiết của Samsung, Intel và Omron."
    ]
  },
  {
    id: "it",
    code: "7480101",
    name: "Công nghệ Thông tin",
    faculty: "Khoa Công nghệ Thông tin",
    duration: 4,
    description: "Trọng tâm đào tạo các chuyên gia về Kỹ thuật phần mềm, Trí tuệ nhân tạo (AI), An toàn thông tin, Khoa học dữ liệu đáp ứng nhu cầu khắt khe của cuộc cách mạng số.",
    highschoolCombi: ["A00", "A01", "D01", "D90"],
    cutOffScore2025: 26.9,
    highlightPoints: [
      "Chương trình đào tạo chuẩn kiểm định AUN-QA tiên tiến.",
      "Môi trường học tập cởi mở, kết hợp làm dự án thực tế ngay từ năm 2.",
      "Cựu sinh viên giữ vị trí chủ chốt tại FPT, VNG, Google, Microsoft."
    ]
  },
  {
    id: "ee",
    code: "7510301",
    name: "Công nghệ Kỹ thuật Điện, Điện tử",
    faculty: "Khoa Điện - Điện tử",
    duration: 4,
    description: "Đào tạo kỹ sư có năng lực thiết kế, lập trình vi điều khiển, quản lý lưới điện thông minh, chế tạo chip bán dẫn và thiết bị điện tử thông minh.",
    highschoolCombi: ["A00", "A01", "D01", "D07"],
    cutOffScore2025: 25.75,
    highlightPoints: [
      "Phòng thí nghiệm bán dẫn, IoT hiện đại phục vụ nghiên cứu & ứng dụng.",
      "Chương trình chất lượng cao giảng dạy hoàn toàn bằng tiếng Anh.",
      "Cơ hội nhận học bổng đi học tập và làm việc tại Nhật Bản, Đài Loan."
    ]
  },
  {
    id: "garment",
    code: "7540204",
    name: "Công nghệ May",
    faculty: "Khoa Thời trang và Thiết kế",
    duration: 4,
    description: "Trung tâm đào tạo thiết kế trang phục, quản lý quy trình sản xuất dệt may tối tân và quản trị chuỗi cung ứng thời trang toàn cầu uy tín tại miền Nam.",
    highschoolCombi: ["A00", "A01", "D01", "D09"],
    cutOffScore2025: 23.5,
    highlightPoints: [
      "Trang bị xưởng may công nghiệp và CAD/CAM thiết kế 3D thời trang.",
      "Thường xuyên tổ chức các Show trình diễn thời trang ghi dấu ấn lớn.",
      "Liên kết chặt chẽ với các công ty, nhãn hàng thời trang đa quốc gia."
    ]
  },
  {
    id: "logistics",
    code: "7510605",
    name: "Logistics và Quản lý Chuỗi cung ứng",
    faculty: "Khoa Kinh tế",
    duration: 4,
    description: "Đào tạo kiến thức chuyên sâu về vận tải đa phương thức, quản trị kho bãi quốc tế, thủ tục hải quan và điều phối chuỗi cung ứng toàn cầu.",
    highschoolCombi: ["A00", "A01", "D01", "D90"],
    cutOffScore2025: 25.9,
    highlightPoints: [
      "Được cọ xát với các case-study thực tế từ cảng biển Cát Lái, Tân Sơn Nhất.",
      "Môn học định hướng số hóa chuỗi cung ứng hiện đại.",
      "Chứng chỉ chuẩn nghề nghiệp FIATA được công nhận toàn cầu."
    ]
  },
  {
    id: "foodtech",
    code: "7540101",
    name: "Công nghệ Thực phẩm",
    faculty: "Khoa Công nghệ Hóa học & Thực phẩm",
    duration: 4,
    description: "Đào tạo những kỹ sư có trình độ chuyên môn cao trong khâu bảo quản, chế biến nông thủy hải sản, kiểm tra & chuẩn hóa chất lượng vi sinh, phát triển dòng thực phẩm vì sức khỏe cộng đồng.",
    highschoolCombi: ["A00", "B00", "D07", "D08"],
    cutOffScore2025: 24.85,
    highlightPoints: [
      "Xưởng thực nghiệm chế biến lương thực thực phẩm, nước giải khát quy mô chuẩn HACCP.",
      "Liên kết kiến tập tại các đại siêu thị, công ty Acecook Việt Nam, tập đoàn CP và Nestlé.",
      "Hơn 95% sinh viên tìm được vị trí chuyên môn R&D, quản trị chất lượng QA/QC bền vững."
    ]
  }
];

export const ALUMNI_DATA: Alumnus[] = [
  {
    id: "a1",
    name: "Nguyễn Hoàng Nam",
    classCode: "14110OT1",
    graduationYear: 2018,
    currentRole: "Trưởng phòng Nghiên cứu Công nghệ Động cơ",
    company: "VinFast Việt Nam",
    quote: "Những đêm thức trắng tại xưởng động cơ HCMUTE đã cho tôi bản lĩnh và tư duy sắc bén để vượt qua những giới hạn trong nghiên cứu ô tô điện ngày nay.",
    achievement: "Đạt danh hiệu Gương mặt trẻ tiêu biểu thủ đô và dẫn dắt đội ngũ kỹ sư tối ưu hóa hệ thống pin xe điện VF8.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "a2",
    name: "Trần Thị Mai Anh",
    classCode: "16110IT2",
    graduationYear: 2020,
    currentRole: "Kỹ sư Trí tuệ Nhân tạo Cao cấp (Senior AI Engineer)",
    company: "Google APAC",
    quote: "Trường không chỉ dạy tôi làm quen với mã code mà còn dạy tôi cách học tập không ngừng nghỉ. Slogan 'Sáng tạo - Hội nhập' chính là kim chỉ nam cho sự nghiệp của tôi.",
    achievement: "Đạt danh hiệu Thủ khoa tốt nghiệp toàn khóa, tác giả 3 bài báo khoa học chuẩn quốc tế IEEE hàng đầu.",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "a3",
    name: "Lê Quốc Bảo",
    classCode: "12142ME1",
    graduationYear: 2016,
    currentRole: "Founder & CEO",
    company: "TechVina Automation Jsc",
    quote: "Tinh thần khởi nghiệp sáng tạo được thổi bùng từ các hội thi nghiên cứu khoa học của HCMUTE. Cảm ơn thầy cô đã luôn tạo điều kiện tốt nhất cho những ý tưởng bứt phá.",
    achievement: "Xây dựng công ty tự động hóa quy mô hơn 100 nhân sự cung cấp dây chuyền lắp ráp thông minh đạt doanh thu triệu USD.",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "a4",
    name: "Vũ Phương Thanh",
    classCode: "15115FT3",
    graduationYear: 2019,
    currentRole: "Giám đốc Thiết kế Nhãn hiệu",
    company: "An Phuoc Group",
    quote: "Các cuộc thi thiết kế tài năng tại khoa Thời trang & Thiết kế là bệ phóng giúp tôi hiểu được giá trị của sự sáng tạo gắn liền với chuỗi cung ứng thực tế.",
    achievement: "Đạt giải Nhất bộ sưu tập 'Hồn Việt' trong tuần lễ thời trang quốc tế và dẫn dắt nhiều dự án thương mại thành công.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
  }
];

export const NEWS_EVENTS_DATA: NewsEvent[] = [
  {
    id: "ne1",
    title: "HCMUTE rộn ràng Hội thi tay nghề 'Bàn tay vàng' lần thứ 13 năm 2026",
    date: "2026-05-20",
    category: "event",
    categoryLabel: "Tin tức - Sự kiện",
    summary: "Hội thi quy tụ hơn 500 sinh viên xuất sắc tranh tài tại các xưởng công nghệ với giải thưởng kỷ lục và cơ hội tuyển dụng đặc quyền từ các doanh nghiệp lớn.",
    content: "Hội thi 'Bàn tay vàng' truyền thống của HCMUTE năm nay quy mô lớn nhất từ trước đến nay. Sinh viên tranh tài qua các hạng mục: Sửa chữa ô tô, Hàn robot số hóa, Thiết kế web 3D, Lập trình tự động hóa PLC và Thiết kế thời trang bền vững. Cuộc thi thu hút 15 tổ chức quốc tế đến chứng kiến và trao học bổng trực tiếp.",
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
    views: 1420
  },
  {
    id: "ne2",
    title: "Phương thức tuyển sinh trình độ đại học hệ chính quy năm 2026 chính thức",
    date: "2026-05-05",
    category: "notice",
    categoryLabel: "Thông báo tuyển sinh",
    summary: "HCMUTE công bố 5 phương thức tuyển sinh cho năm học 2026, tối ưu hóa cơ hội xét điểm học bạ, đánh giá năng lực ĐHQG và tuyển thẳng đặc cách nghề nghiệp.",
    content: "Trường Đại học Sư phạm Kỹ thuật TP.HCM thông báo phương thức tuyển sinh cụ thể: Phương thức 1: Xét tuyển dựa vào điểm thi tốt nghiệp THPT 2026; Phương thức 2: Xét điểm học bạ 5 học kỳ lớp 10, 11 và học kỳ 1 lớp 12; Phương thức 3: Xét kết quả thi Đánh giá năng lực của ĐHQG-HCM; Phương thức 4: Xét tuyển ưu tiên diện IELTS học thuật kết hợp; Phương thức 5: Tuyển thẳng đặc cách tài năng trẻ đoạt giải quốc gia.",
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
    views: 3120
  },
  {
    id: "ne3",
    title: "Khánh thành trung tâm Nghiên cứu Đào tạo Robot thông minh & AI toàn cầu",
    date: "2026-05-18",
    category: "news",
    categoryLabel: "Tin nhà trường",
    summary: "Hợp tác chiến lược trị giá 5 triệu USD hỗ trợ đào tạo thế hệ chuyên gia tự động hóa và nâng tầm năng lực số cho toàn bộ sinh viên khối kỹ thuật.",
    content: "Phối hợp với tập đoàn công nghệ hàng đầu thế giới, Trung tâm Nghiên cứu Đào tạo Robot thông minh & AI chính thức đi vào hoạt động tại tòa nhà Trung tâm HCMUTE. Phòng lab tích hợp cánh tay robot tự động hóa 6 trục, hệ thống mô phỏng sinh đôi kỹ thuật số (Digital Twins) và siêu máy tính xử lý trí tuệ nhân tạo chuyên sâu.",
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    views: 2280
  },
  {
    id: "ne4",
    title: "Hội thảo quốc tế lần thứ 28 về Công nghệ Cơ điện tử tiên tiến (ICMT 2026)",
    date: "2026-04-20",
    category: "event",
    categoryLabel: "Tin quốc tế",
    summary: "Quy tụ hàng trăm học giả lớn toàn cầu thảo luận sâu về thế hệ bán dẫn mới, pin thể rắn cao cấp và y học thông minh tại khuôn viên Hội trường Thư viện trung tâm.",
    content: "Hội thảo ghi dấu bước tiến hội nhập mạnh mẽ của HCMUTE trên bản đồ khoa học kỹ thuật thế giới. Hơn 150 báo cáo khoa học chất lượng cao từ các nhà bác học khắp 20 quốc gia thảo luận trọng tâm về vật liệu nano bán dẫn, xe tự hành an toàn, robot hỗ trợ phẫu thuật chính xác và các thuật toán AI giảm thiểu phát thải carbon.",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
    views: 980
  },
  {
    id: "ne5",
    title: "Chương trình liên kết Quốc tế 2+2 HCMUTE hợp tác với Đan Mạch và Anh Quốc",
    date: "2026-05-10",
    category: "notice",
    categoryLabel: "Tuyển sinh liên kết",
    summary: "Tuyển sinh 150 chỉ tiêu chương trình cử nhân và kỹ sư song bằng cấp bởi Đại học danh tiếng Anh Quốc với chi phí ưu đãi tới 50% học bổng chính phủ.",
    content: "Văn phòng Đào tạo Quốc tế HCMUTE kết hợp mở đợt tuyển sinh mới cho các chuyên ngành Công nghệ thông tin, Quản trị Logistics quốc tế và Điện tử ứng dụng. Sinh viên học 2 năm đầu tại Việt Nam và 2 năm cuối chuyển tiếp chất lượng sang trường đối tác Anh Quốc, Đan Mạch để nhận bằng chuẩn Châu Âu chất lượng tuyệt hảo.",
    imageUrl: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80",
    views: 1840
  },
  {
    id: "ne6",
    title: "Đội tuyển sáng tạo HCMUTE giành giải Nhất Cuộc thi sinh viên lái xe xanh quốc tế",
    date: "2026-04-12",
    category: "news",
    categoryLabel: "Thành tích nổi bật",
    summary: "Đội ngũ kỹ sư trẻ chế tạo thành công mẫu xe siêu tiết kiệm pin với quãng đường tương đương một chuyến đi xuyên Việt cực kỳ ngoạn mục.",
    content: "Vượt qua hơn 50 đội tuyển mạnh khu vực Châu Á - Thái Bình Dương, đội tuyển UTE-Power Car của trường giành chức vô địch cao quý nhờ sáng tạo cơ cấu truyền động tối ưu dạng khí động học kết hợp bộ thu hồi động năng phanh hiệu suất vượt trội.",
    imageUrl: "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=800&q=80",
    views: 2750
  }
];

export const SHOWCASE_STUDENTS: StudentProfile[] = [
  {
    id: "22110123",
    fullName: "Vũ Nguyễn Minh Quân",
    birthDate: "2004-08-15",
    gender: "Nam",
    major: "Công nghệ Kỹ thuật Ô tô",
    faculty: "Khoa Cơ khí Động lực",
    classCode: "22110OT1A",
    cohort: "K22 (Khóa 2022 - 2026)",
    cumulativeGPA: 3.73,
    cumulativeGPA10: 9.15,
    totalCreditsEarned: 112,
    semesters: [
      {
        semesterName: "Học kỳ I - Năm học 2024-2025",
        semesterGPA: 3.82,
        semesterCredits: 19,
        subjects: [
          { code: "AUTO330101", name: "Động cơ đốt trong lý thuyết", credits: 3, componentScore: 9.0, examScore: 9.5, finalScore: 9.3, letterGrade: "A+" },
          { code: "AUTO320202", name: "Thực hành bảo dưỡng Động cơ nâng cao", credits: 2, componentScore: 10, examScore: 9.0, finalScore: 9.4, letterGrade: "A+" },
          { code: "ELEC230510", name: "Hệ thống điện - Điện tử ô tô", credits: 3, componentScore: 8.5, examScore: 8.5, finalScore: 8.5, letterGrade: "A" },
          { code: "MATH140130", name: "Toán chuyên đề cho kỹ sư", credits: 4, componentScore: 8.0, examScore: 8.2, finalScore: 8.1, letterGrade: "B+" },
          { code: "PHYL130240", name: "Vật lý kỹ thuật thực nghiệm", credits: 3, componentScore: 9.2, examScore: 9.0, finalScore: 9.1, letterGrade: "A" },
          { code: "INDS240620", name: "Quản trị sản xuất ô tô công nghiệp", credits: 4, componentScore: 9.5, examScore: 8.8, finalScore: 9.1, letterGrade: "A" }
        ]
      },
      {
        semesterName: "Học kỳ II - Năm học 2024-2025",
        semesterGPA: 3.65,
        semesterCredits: 20,
        subjects: [
          { code: "AUTO330903", name: "Hệ thống truyền động lực ô tô", credits: 3, componentScore: 8.8, examScore: 8.5, finalScore: 8.6, letterGrade: "A" },
          { code: "EVEH330412", name: "Công nghệ xe Hybrid và xe Điện", credits: 3, componentScore: 9.5, examScore: 9.0, finalScore: 9.2, letterGrade: "A+" },
          { code: "AUTO321204", name: "Thiết kế ô tô trên máy tính (CAD/CAE)", credits: 2, componentScore: 8.2, examScore: 9.0, finalScore: 8.6, letterGrade: "A" },
          { code: "CONT230105", name: "Hệ thống điều khiển tự động trên ô tô", credits: 3, componentScore: 7.8, examScore: 8.2, finalScore: 8.0, letterGrade: "B+" },
          { code: "ENGL240102", name: "Tiếng Anh chuyên ngành Động lực II", credits: 4, componentScore: 9.2, examScore: 8.5, finalScore: 8.8, letterGrade: "A" },
          { code: "SOCI130101", name: "Kỹ năng mềm và Đổi mới sáng tạo", credits: 5, componentScore: 9.8, examScore: 9.2, finalScore: 9.5, letterGrade: "A+" }
        ]
      }
    ]
  },
  {
    id: "23110234",
    fullName: "Lê Minh Phương Thảo",
    birthDate: "2005-11-20",
    gender: "Nữ",
    major: "Công nghệ Thông tin",
    faculty: "Khoa Công nghệ Thông tin",
    classCode: "23110IT1B",
    cohort: "K23 (Khóa 2023 - 2027)",
    cumulativeGPA: 3.88,
    cumulativeGPA10: 9.38,
    totalCreditsEarned: 84,
    semesters: [
      {
        semesterName: "Học kỳ I - Năm học 2024-2025",
        semesterGPA: 3.92,
        semesterCredits: 22,
        subjects: [
          { code: "COMP330201", name: "Cấu trúc dữ liệu và Giải thuật", credits: 4, componentScore: 9.5, examScore: 9.5, finalScore: 9.5, letterGrade: "A+" },
          { code: "COMP330102", name: "Cơ sở dữ liệu nâng cao (SQL/NoSQL)", credits: 3, componentScore: 9.2, examScore: 9.0, finalScore: 9.1, letterGrade: "A" },
          { code: "MATH130120", name: "Toán rời rạc và Đại số tính toán", credits: 3, componentScore: 8.8, examScore: 9.6, finalScore: 9.3, letterGrade: "A+" },
          { code: "COMP340305", name: "Lập trình mạng và Lập trình Web", credits: 4, componentScore: 10, examScore: 9.5, finalScore: 9.7, letterGrade: "A+" },
          { code: "DESN230110", name: "Trải nghiệm người dùng và UI/UX", credits: 3, componentScore: 9.0, examScore: 8.8, finalScore: 8.9, letterGrade: "A" },
          { code: "SOFT350112", name: "Quản trị dự án phát triển phần mềm", credits: 5, componentScore: 9.4, examScore: 9.0, finalScore: 9.2, letterGrade: "A+" }
        ]
      },
      {
        semesterName: "Học kỳ II - Năm học 2024-2025",
        semesterGPA: 3.84,
        semesterCredits: 21,
        subjects: [
          { code: "AI330101", name: "Nhập môn Học máy & Nhận dạng mẫu", credits: 4, componentScore: 9.2, examScore: 9.2, finalScore: 9.2, letterGrade: "A" },
          { code: "COMP330410", name: "Phân tích thiết kế hệ thống phần mềm", credits: 3, componentScore: 8.8, examScore: 9.4, finalScore: 9.1, letterGrade: "A" },
          { code: "COMP320231", name: "Thực hành Kiến trúc hướng dịch vụ", credits: 2, componentScore: 9.5, examScore: 9.5, finalScore: 9.5, letterGrade: "A+" },
          { code: "COMP330550", name: "An toàn và bảo mật hệ thống mạng", credits: 3, componentScore: 8.5, examScore: 8.8, finalScore: 8.7, letterGrade: "A" },
          { code: "DESI330412", name: "Phổ cập Điện toán đám mây (AWS/GCP)", credits: 3, componentScore: 9.0, examScore: 9.2, finalScore: 9.1, letterGrade: "A" },
          { code: "ENGL260105", name: "Tiếng Anh nâng cao - Luyện IELTS II", credits: 6, componentScore: 9.4, examScore: 8.8, finalScore: 9.0, letterGrade: "A" }
        ]
      }
    ]
  }
];

// Fallback search procedural generator
export function generateProceduralProfile(mssv: string): StudentProfile {
  // Extract number or use standard hash
  let hash = 0;
  for (let i = 0; i < mssv.length; i++) {
    hash = mssv.charCodeAt(i) + ((hash << 5) - hash);
  }
  const absHash = Math.abs(hash);

  const femaleNames = ["Nguyễn Hoài Thương", "Lê Khánh Linh", "Trần Mai Phương", "Đoàn Thị Tuyết", "Hoàng Kim Ngân", "Phạm Trúc Diễm"];
  const maleNames = ["Phạm Nhật Tiến", "Nguyễn Tuấn Kiệt", "Trần Đại Dương", "Lâm Đình Trọng", "Võ Minh Đức", "Đỗ Hải Long"];
  const isFemale = absHash % 2 === 0;
  const fullName = isFemale ? femaleNames[absHash % femaleNames.length] : maleNames[absHash % maleNames.length];

  const yearOfAdmission = mssv.startsWith("22") ? "2022" : mssv.startsWith("23") ? "2023" : mssv.startsWith("24") ? "2024" : "2021";
  const cohort = `K${yearOfAdmission.slice(2)} (Khóa ${yearOfAdmission} - ${Number(yearOfAdmission) + 4})`;

  const majors = [
    { name: "Công nghệ Kỹ thuật Ô tô", faculty: "Khoa Cơ khí Động lực", classPrefix: "OT" },
    { name: "Công nghệ Thông tin", faculty: "Khoa Công nghệ Thông tin", classPrefix: "IT" },
    { name: "Công nghệ Kỹ thuật Cơ điện tử", faculty: "Khoa Cơ khí Chế tạo máy", classPrefix: "ME" },
    { name: "Công nghệ Kỹ thuật Điện, Điện tử", faculty: "Khoa Điện - Điện tử", classPrefix: "DDT" },
    { name: "Công nghệ May", faculty: "Khoa Thời trang và Thiết kế", classPrefix: "MAY" },
    { name: "Logistics và Quản lý Chuỗi cung ứng", faculty: "Khoa Kinh tế", classPrefix: "LOG" },
    { name: "Công nghệ Thực phẩm", faculty: "Khoa Công nghệ Hóa học & Thực phẩm", classPrefix: "TP" }
  ];
  const selectedMajor = majors[absHash % majors.length];

  const classCode = `${yearOfAdmission.slice(2)}110${selectedMajor.classPrefix}${1 + (absHash % 3)}${isFemale ? "B" : "A"}`;

  // Procedural grades
  const factor = 1 + (absHash % 10) * 0.15; // varying high/mid score styles
  const gpaRaw = Math.min(4.0, (2.8 + (absHash % 10) * 0.13));
  const cumulativeGPA = Math.round(gpaRaw * 100) / 100;
  const cumulativeGPA10 = Math.round(cumulativeGPA * 2.5 * 10) / 10;

  const subjectsA = [
    { code: "COMP1301", name: "Nhập môn lập trình chuyên ngành", credits: 3 },
    { code: "MATH1301", name: "Toán học nâng cao đại cương", credits: 3 },
    { code: "CAD2102", name: "Vẽ kỹ thuật 3D trên máy tính", credits: 2 },
    { code: "ENG1201", name: "Tiếng Anh giao tiếp căn bản I", credits: 2 },
    { code: "SOCI1202", name: "Kỹ năng làm việc nhóm & Dự án", credits: 2 },
    { code: "WORK2301", name: "Thực hành Nhập môn kỹ thuật ứng dụng", credits: 3 }
  ];

  const subjectsB = [
    { code: "ADV4502", name: "Công nghệ thông minh ứng dụng", credits: 4 },
    { code: "MGMT2301", name: "Quản trị chất lượng & Tiêu chuẩn", credits: 3 },
    { code: "MATH1302", name: "Xác suất thống kê cho kỹ sư", credits: 3 },
    { code: "ENG1202", name: "Luyện thi IELTS nội bộ II", credits: 3 },
    { code: "PRAC3206", name: "Thực hành mô phỏng số hóa doanh nghiệp", credits: 2 },
    { code: "RESE1301", name: "Phương pháp nghiên cứu khoa học cơ bản", credits: 2 }
  ];

  const calculateFinalScoreAndLetter = (seed: number, baseGpa: number) => {
    const randomVariation = (seed % 30) * 0.08 - 1.2;
    const finalScore = Math.min(10.0, Math.max(4.0, Math.round((baseGpa * 2.5 + randomVariation) * 10) / 10));
    let letterGrade = "F";
    if (finalScore >= 9.0) letterGrade = "A+";
    else if (finalScore >= 8.5) letterGrade = "A";
    else if (finalScore >= 8.0) letterGrade = "B+";
    else if (finalScore >= 7.0) letterGrade = "B";
    else if (finalScore >= 6.5) letterGrade = "C+";
    else if (finalScore >= 5.5) letterGrade = "C";
    else if (finalScore >= 5.0) letterGrade = "D+";
    else if (finalScore >= 4.0) letterGrade = "D";

    return {
      componentScore: Math.min(10.0, Math.round((finalScore - 0.5 + (seed % 5) * 0.22) * 10) / 10),
      examScore: Math.min(10.0, Math.round((finalScore + 0.3 - (seed % 3) * 0.15) * 10) / 10),
      finalScore,
      letterGrade
    };
  };

  const mapSubjectsToGrades = (list: typeof subjectsA, baseGpa: number) => {
    return list.map((sub, index) => {
      const gradesCalc = calculateFinalScoreAndLetter(absHash + index + 17, baseGpa);
      return {
        ...sub,
        ...gradesCalc
      };
    });
  };

  const getDayMonth = (seed: number) => {
    const days = ["05", "12", "18", "22", "27"];
    const months = ["02", "04", "07", "09", "11"];
    return `${yearOfAdmission}-${months[seed % 5]}-${days[(seed + 3) % 5]}`;
  };

  const semesterI = {
    semesterName: "Học kỳ I - Năm học 2024-2025",
    semesterGPA: Math.round((cumulativeGPA - 0.15 + (absHash % 10) * 0.03) * 100) / 100,
    semesterCredits: 15,
    subjects: mapSubjectsToGrades(subjectsA, cumulativeGPA - 0.1)
  };

  const semesterII = {
    semesterName: "Học kỳ II - Năm học 2024-2025",
    semesterGPA: Math.round((cumulativeGPA + 0.1 - (absHash % 12) * 0.02) * 100) / 100,
    semesterCredits: 17,
    subjects: mapSubjectsToGrades(subjectsB, cumulativeGPA + 0.05)
  };

  return {
    id: mssv,
    fullName,
    birthDate: `2004-10-${Math.min(28, 1 + (absHash % 28))}`,
    gender: isFemale ? "Nữ" : "Nam",
    major: selectedMajor.name,
    faculty: selectedMajor.faculty,
    classCode,
    cohort,
    cumulativeGPA,
    cumulativeGPA10,
    totalCreditsEarned: 60 + (absHash % 40),
    semesters: [semesterI, semesterII]
  };
}
