import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  CalendarCheck,
  User,
  ShieldCheck,
  Send,
  X,
  AlertTriangle,
  Stethoscope,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  useBidanForumThreads,
  useBidanThreadDetail,
  useBidanReplyThread,
  ForumThreadItem,
} from '../forum.api';

const CATEGORIES = [
  { key: 'semua', label: 'Semua Kategori' },
  { key: 'keluhan_gejala', label: 'Keluhan & Gejala' },
  { key: 'nutrisi', label: 'Nutrisi & Gizi' },
  { key: 'persalinan', label: 'Persiapan Persalinan' },
  { key: 'mitos_fakta', label: 'Mitos & Fakta' },
  { key: 'parenting', label: 'Parenting & Pascapersalinan' },
];

export default function BidanForumPage() {
  const [selectedTab, setSelectedTab] = useState<'needs_reply' | 'validated' | 'all'>('needs_reply');
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePostId, setActivePostId] = useState<number | null>(null);

  // Reply drawer state
  const [replyText, setReplyText] = useState<string>('');
  const [suggestAppointment, setSuggestAppointment] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: forumData, isLoading, isError, refetch } = useBidanForumThreads({
    tab: selectedTab,
    kategori: selectedCategory,
    search: searchQuery,
  });

  const { data: detailData, isLoading: isDetailLoading } = useBidanThreadDetail(activePostId);
  const replyMutation = useBidanReplyThread();

  const handleOpenDrawer = (postId: number) => {
    setActivePostId(postId);
    setReplyText('');
    setSuggestAppointment(false);
    setFeedbackMessage(null);
  };

  const handleCloseDrawer = () => {
    setActivePostId(null);
    setReplyText('');
    setSuggestAppointment(false);
    setFeedbackMessage(null);
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePostId || !replyText.trim()) return;

    try {
      await replyMutation.mutateAsync({
        postId: activePostId,
        payload: {
          komentar: replyText.trim(),
          suggest_appointment: suggestAppointment,
        },
      });

      setFeedbackMessage({
        type: 'success',
        text: 'Tanggapan klinis berhasil dikirim dan disematkan di kolom komentar pasien.',
      });
      setReplyText('');
      setSuggestAppointment(false);
      refetch();
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Gagal mengirim tanggapan klinis.',
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Clinical Context */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Stethoscope className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-gray-900">Validasi Forum Ibu Hamil</h1>
          </div>
          <p className="text-sm text-gray-600">
            Pantau pertanyaan ibu hamil, verifikasi mitos, dan berikan tanggapan klinis resmi tersemat.
          </p>
        </div>

        {/* Counter Stats */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 text-center">
            <span className="block text-xs font-semibold text-amber-800">Perlu Respon</span>
            <span className="text-xl font-bold text-amber-900">
              {forumData?.stats?.needs_reply ?? 0}
            </span>
          </div>
          <div className="px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
            <span className="block text-xs font-semibold text-emerald-800">Sudah Divalidasi</span>
            <span className="text-xl font-bold text-emerald-900">
              {forumData?.stats?.validated ?? 0}
            </span>
          </div>
          <div className="px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <span className="block text-xs font-semibold text-slate-700">Total Thread</span>
            <span className="text-xl font-bold text-slate-800">
              {forumData?.stats?.total ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-4">
          {/* Tab Navigation */}
          <div className="flex rounded-lg bg-gray-100 p-1 w-full sm:w-auto">
            <button
              onClick={() => setSelectedTab('needs_reply')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedTab === 'needs_reply'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Perlu Respon ({forumData?.stats?.needs_reply ?? 0})
            </button>
            <button
              onClick={() => setSelectedTab('validated')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedTab === 'validated'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sudah Divalidasi ({forumData?.stats?.validated ?? 0})
            </button>
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedTab === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Semua Diskusi
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari topik atau keluhan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors ${
                selectedCategory === cat.key
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Threads List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
          <h3 className="text-base font-semibold text-gray-900">Gagal Memuat Antrean Forum</h3>
          <p className="text-sm text-gray-500">Terjadi kendala saat menyinkronkan data forum bidan.</p>
          <button
            onClick={() => refetch()}
            className="mt-3 px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Coba Lagi
          </button>
        </div>
      ) : forumData?.data?.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">
            {selectedTab === 'needs_reply'
              ? 'Tidak Ada Pertanyaan Tertunda'
              : 'Belum Ada Diskusi Ditemukan'}
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            {selectedTab === 'needs_reply'
              ? 'Semua pertanyaan ibu hamil pada antrean ini telah tervalidasi atau tidak sesuai filter yang dipilih.'
              : 'Gunakan filter atau kata kunci lain untuk mencari diskusi forum.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {forumData?.data?.map((thread: ForumThreadItem) => (
            <div
              key={thread.id}
              className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition shadow-sm p-6 space-y-4"
            >
              {/* Header Info */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-sm">
                    {thread.patient?.name ? thread.patient.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {thread.patient?.name}
                      </span>
                      {thread.is_anonymous && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          Anonim di Publik
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      Diposting pada {new Date(thread.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Gestational Age Context Badge */}
                {thread.gestational_context?.label && (
                  <div className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Usia Kehamilan: {thread.gestational_context.label}</span>
                  </div>
                )}
              </div>

              {/* Thread Content */}
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-1">{thread.judul}</h2>
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {thread.deskripsi}
                </p>
              </div>

              {/* Footer Meta & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                    {thread.kategori_label}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{thread.komen} Komentar</span>
                  </span>
                  {thread.has_bidan_reply ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Sudah Divalidasi
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Menunggu Respon Bidan
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleOpenDrawer(thread.id)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                >
                  <span>{thread.has_bidan_reply ? 'Lihat Diskusi & Tambah Advis' : 'Validasi & Beri Respon'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-over Drawer for Clinical Reply */}
      {activePostId && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-emerald-100 text-emerald-800">
                  <Stethoscope className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Validasi Klinis Bidan</h3>
                  <p className="text-xs text-gray-500">Tanggapan resmi tersemat di puncak postingan pasien</p>
                </div>
              </div>
              <button
                onClick={handleCloseDrawer}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isDetailLoading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-16 bg-gray-100 rounded"></div>
                </div>
              ) : detailData?.data ? (
                <>
                  {/* Patient Question Card */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-semibold text-slate-900">
                          {detailData.data.patient?.name}
                        </span>
                        {detailData.data.is_anonymous && (
                          <span className="text-[11px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                            Anonim Publik
                          </span>
                        )}
                      </div>
                      {detailData.data.gestational_context?.label && (
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {detailData.data.gestational_context.label}
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-gray-900">{detailData.data.judul}</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                      {detailData.data.deskripsi}
                    </p>
                  </div>

                  {/* Previous Comments */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Riwayat Komentar ({detailData.data.comments?.length || 0})
                    </h4>
                    {detailData.data.comments?.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">Belum ada komentar dari pasien lain.</p>
                    ) : (
                      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                        {detailData.data.comments?.map((c) => (
                          <div
                            key={c.id}
                            className={`p-3 rounded-lg text-xs leading-relaxed border ${
                              c.is_bidan_reply
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                                : 'bg-gray-50 border-gray-200 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold flex items-center gap-1">
                                {c.is_bidan_reply && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
                                {c.author_name}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {new Date(c.created_at).toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="whitespace-pre-line">{c.komentar}</p>
                            {c.suggest_appointment && (
                              <div className="mt-2 text-[11px] font-medium text-emerald-800 bg-emerald-100/60 p-1.5 rounded flex items-center gap-1">
                                <CalendarCheck className="w-3 h-3 text-emerald-600" />
                                <span>Menyertakan rekomendasi periksa fisik langsung.</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Feedback Message */}
                  {feedbackMessage && (
                    <div
                      className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                        feedbackMessage.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {feedbackMessage.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      )}
                      <span>{feedbackMessage.text}</span>
                    </div>
                  )}

                  {/* Clinical Response Form */}
                  <form onSubmit={handleSubmitReply} className="space-y-4 pt-2 border-t border-gray-200">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Tanggapan Klinis & Edukasi Bidan
                      </label>
                      <textarea
                        rows={5}
                        required
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Tuliskan penjelasan medis, verifikasi keluhan, atau penanganan awal yang aman untuk ibu hamil..."
                        className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                      <span className="text-[11px] text-gray-400 block text-right mt-0.5">
                        {replyText.length} karakter (minimum 5 karakter)
                      </span>
                    </div>

                    {/* Appointment Suggestion Toggle */}
                    <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200 flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="suggestAppointment"
                        checked={suggestAppointment}
                        onChange={(e) => setSuggestAppointment(e.target.checked)}
                        className="mt-0.5 h-4 w-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                      />
                      <label htmlFor="suggestAppointment" className="text-xs text-gray-700 cursor-pointer">
                        <span className="font-semibold text-gray-900 block">
                          Sertakan Anjuran Janji Temu ANC Fisik
                        </span>
                        Akan menampilkan kartu aksi rujukan klinis dan tombol langsung{' '}
                        <strong>[ Buat Janji Temu dengan Bidan Ini ]</strong> pada aplikasi ibu hamil.
                      </label>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleCloseDrawer}
                        className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 rounded-lg"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={replyMutation.isPending || !replyText.trim()}
                        className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition"
                      >
                        {replyMutation.isPending ? (
                          <span>Menyimpan...</span>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Kirim Tanggapan Resmi</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
