/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { NEWS_EVENTS_DATA } from "../data";
import { NewsEvent } from "../types";
import { Calendar, Eye, Search, Filter, Sparkles, FolderOpen, ArrowUpRight, X, Clock, HelpCircle, ThumbsUp, Send } from "lucide-react";

export default function NewsEventsSection() {
  const [activeCategory, setActiveCategory] = useState<"all" | "news" | "event" | "notice">("all");
  const [searchWord, setSearchWord] = useState("");
  const [selectedNews, setSelectedNews] = useState<NewsEvent | null>(NEWS_EVENTS_DATA[0]);
  
  // Custom interaction states
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const [likedArticles, setLikedArticles] = useState<string[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentsList, setCommentsList] = useState<{ [id: string]: string[] }>({
    "ne1": ["Hội thi bổ ích quá, chúc đội tuyển khoa Ô tô đạt kết quả tốt nhất!", "Năm ngoái xem chung kết kéo dài kịch tính hồi hộp ghê."],
    "ne2": ["Năm nay xét học bạ sớm có lợi quá, nộp hồ sơ thôi các bạn ơi."]
  });

  const handleRegisterEvent = (eventId: string, title: string) => {
    if (registeredEvents.includes(eventId)) return;
    setRegisteredEvents([...registeredEvents, eventId]);
    alert(`Chúc mừng! Bạn đã đăng ký tham gia thành công sự kiện:\n"${title}"\n\nHệ thống đã gửi mã QR vé mời điện tử về thông tin đăng nhập của bạn.`);
  };

  const handleLike = (id: string) => {
    if (likedArticles.includes(id)) {
      setLikedArticles(likedArticles.filter((item) => item !== id));
    } else {
      setLikedArticles([...likedArticles, id]);
    }
  };

  const handleAddComment = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const currentComments = commentsList[id] || [];
    setCommentsList({
      ...commentsList,
      [id]: [...currentComments, commentText.trim()]
    });
    setCommentText("");
  };

  const filteredNews = NEWS_EVENTS_DATA.filter((item) => {
    const matchesCat = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchWord.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchWord.toLowerCase()) ||
      item.categoryLabel.toLowerCase().includes(searchWord.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Search and Filters top toolbar */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category triggers */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeCategory === "all"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/10"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Tất cả tin bài
          </button>
          <button
            onClick={() => setActiveCategory("news")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeCategory === "news"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/10"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Tin tức & Đào tạo
          </button>
          <button
            onClick={() => setActiveCategory("event")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeCategory === "event"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/10"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Sự kiện thảo luận
          </button>
          <button
            onClick={() => setActiveCategory("notice")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeCategory === "notice"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/10"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Thông báo bổ ích
          </button>
        </div>

        {/* Text Filter Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm nhanh tin bài..."
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            className="w-full bg-white border border-slate-200 pl-9 pr-3.5 py-2 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 font-sans"
          />
        </div>
      </div>

      {/* Main Grid: list of news Left (2 cols), active detail view Right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* News List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filteredNews.map((item) => {
              const isSelected = selectedNews?.id === item.id;
              const hasLiked = likedArticles.includes(item.id);
              const hasRegistered = registeredEvents.includes(item.id);
              return (
                <div
                  key={item.id}
                  id={`news-card-${item.id}`}
                  onClick={() => setSelectedNews(item)}
                  className={`bg-white rounded-2xl border transition-all duration-350 cursor-pointer overflow-hidden flex flex-col justify-between group ${
                    isSelected
                      ? "border-blue-500 shadow-md ring-2 ring-blue-500/10"
                      : "border-slate-150 hover:border-slate-350 hover:shadow-md"
                  }`}
                >
                  <div>
                    {/* Media representation */}
                    <div className="h-44 w-full overflow-hidden relative">
                      <img
                        src={item.imageUrl}
                        alt="News Cover"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex gap-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm uppercase ${
                          item.category === "event" 
                            ? "bg-red-600" 
                            : item.category === "notice" 
                            ? "bg-purple-600" 
                            : "bg-blue-600"
                        }`}>
                          {item.categoryLabel}
                        </span>
                      </div>
                    </div>

                    {/* Content representation */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{item.date}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          <span>{item.views} lượt đọc</span>
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-800 text-[13px] md:text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed">
                        {item.summary}
                      </p>
                    </div>
                  </div>

                  {/* Actions summary footer */}
                  <div className="p-4 pt-0 border-t border-slate-100/50 flex items-center justify-between mt-3 text-xs">
                    <span className="text-[11px] font-mono text-blue-600 font-bold group-hover:underline flex items-center gap-0.5">
                      ĐỌC BÀI VIẾT
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>

                    <div className="flex items-center gap-2">
                      {item.category === "event" && hasRegistered && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold rounded py-0.5 px-1.5">
                          Đã đăng ký
                        </span>
                      )}
                      {hasLiked && (
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-bold rounded py-0.5 px-1.5">
                          Đã Thích
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredNews.length === 0 && (
            <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
              <FolderOpen className="h-10 w-10 text-slate-350 mx-auto" />
              <p className="text-sm font-semibold text-slate-500 mt-2">Không tìm thấy bài viết/sự kiện phù hợp.</p>
            </div>
          )}
        </div>

        {/* Selected News Content Reading Panels */}
        <div className="lg:col-span-1">
          {selectedNews ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden sticky top-4">
              <div className="h-48 w-full relative">
                <img src={selectedNews.imageUrl} className="h-full w-full object-cover" alt="Detail cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[10px] text-amber-400 font-bold tracking-widest block uppercase font-mono mb-1">
                    {selectedNews.categoryLabel}
                  </span>
                  <h3 className="text-white font-extrabold text-sm md:text-base leading-tight lines-clamp-2">
                    {selectedNews.title}
                  </h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <div className="flex gap-4 items-center text-xs text-slate-400 font-mono border-b border-slate-100 pb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-blue-500" />
                    {selectedNews.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-blue-500" />
                    3 phút đọc
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5 text-blue-500" />
                    {selectedNews.views} xem
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-semibold bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                  {selectedNews.summary}
                </p>

                <p className="text-xs text-slate-600 leading-relaxed font-normal whitespace-pre-wrap">
                  {selectedNews.content}
                </p>

                {/* Event specific registration CTA */}
                {selectedNews.category === "event" && (
                  <button
                    type="button"
                    onClick={() => handleRegisterEvent(selectedNews.id, selectedNews.title)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md tracking-wider transition-all cursor-pointer active:scale-95 text-center flex items-center justify-center gap-1.5 ${
                      registeredEvents.includes(selectedNews.id)
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"
                    }`}
                  >
                    <Sparkles className="h-4 w-4 animate-spin-slow" />
                    <span>
                      {registeredEvents.includes(selectedNews.id)
                        ? "BẠN ĐÃ ĐĂNG KÝ THÀNH CÔNG EVENT"
                        : "ĐĂNG KÝ VÉ THAM GIA MIỄN PHÍ"}
                    </span>
                  </button>
                )}

                {/* Article Appreciation & Interactive Comments Box */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleLike(selectedNews.id)}
                      className={`flex items-center gap-1.5 text-xs font-bold py-1 px-2.5 rounded transition-all cursor-pointer ${
                        likedArticles.includes(selectedNews.id)
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>{likedArticles.includes(selectedNews.id) ? "Đã thích" : "Thiết thực / Thích"}</span>
                    </button>
                    <span className="text-[11px] text-slate-400 font-mono font-semibold">
                      {(commentsList[selectedNews.id] || []).length} bình luận
                    </span>
                  </div>

                  {/* Comment list items */}
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {(commentsList[selectedNews.id] || []).map((cmt, idx) => (
                      <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex gap-2 items-start text-xs text-slate-600">
                        <div className="h-5 w-5 bg-blue-100 text-blue-800 rounded-full shrink-0 flex items-center justify-center font-bold text-[10px] uppercase">
                          S
                        </div>
                        <div>
                          <div className="font-semibold text-[11px] text-slate-800 mb-0.5">Sinh viên HCMUTE</div>
                          <p className="leading-snug">{cmt}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Comment Submit Box Form */}
                  <form onSubmit={(e) => handleAddComment(e, selectedNews.id)} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Viết cảm nghĩ hoặc câu hỏi..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 outline-none focus:border-blue-500 font-sans"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 border border-slate-200 rounded-2xl">
              <HelpCircle className="h-10 w-10 text-slate-350 mx-auto" />
              <p className="text-sm font-semibold text-slate-500 mt-2">Chọn một bài viết để đọc nội dung đầy đủ.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
