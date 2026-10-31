import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Tag, Skeleton, Alert, Button, Tooltip, Progress, Avatar } from 'antd';
import {
  Users,
  MessageSquare,
  ThumbsUp,
  ShoppingBag,
  Star,
  RefreshCw,
  HeartPulse,
  BookOpen,
  Image as ImageIcon,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { getDashboardStats } from '../admin.api';
import { Link } from 'react-router-dom';

const CATEGORY_COLORS = ['#ec4899', '#f43f5e', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#3b82f6'];

export default function AdminDashboard() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: getDashboardStats,
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-2">
        <Skeleton active paragraph={{ rows: 2 }} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="rounded-2xl shadow-sm border-gray-100">
              <Skeleton active paragraph={{ rows: 2 }} />
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-2xl shadow-sm"><Skeleton active paragraph={{ rows: 6 }} /></Card>
          <Card className="rounded-2xl shadow-sm"><Skeleton active paragraph={{ rows: 6 }} /></Card>
        </div>
      </div>
    );
  }

  if (error || !data || data.status !== 'success') {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Alert
          message="Gagal Memuat Data Dashboard"
          description="Terjadi kendala saat menghubungkan ke database server. Silakan muat ulang halaman."
          type="error"
          showIcon
          action={
            <Button size="small" type="primary" danger onClick={() => refetch()}>
              Coba Lagi
            </Button>
          }
        />
      </div>
    );
  }

  const { summary, community, shop, recent_logs } = data.data;

  // Format currency
  const formatRupiah = (val: string | number) => {
    const num = typeof val === 'string' ? parseInt(val.replace(/\D/g, ''), 10) : val;
    if (isNaN(num)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Dashboard Analitik
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ringkasan data real-time ekosistem Prenava.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tag color="green" className="px-3 py-1 text-xs font-medium rounded-full border-0 bg-emerald-50 text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5 animate-pulse" />
            Database Terhubung
          </Tag>
          <Button
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />}
            onClick={() => refetch()}
            loading={isFetching}
            className="rounded-xl flex items-center gap-1.5 text-xs font-medium"
          >
            Segarkan Data
          </Button>
        </div>
      </div>

      {/* Row 1: Primary 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Users */}
        <Card className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-rose-50/70 via-white to-white overflow-hidden relative group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wider text-rose-600 uppercase">Total Pengguna</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{summary.total_users}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-rose-100/60 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-600 font-medium bg-white px-2 py-0.5 rounded-lg border border-gray-100">
              🤰 {summary.total_ibu_hamil} Bumil
            </span>
            <span className="text-xs text-gray-600 font-medium bg-white px-2 py-0.5 rounded-lg border border-gray-100">
              🩺 {summary.total_bidan} Bidan
            </span>
            <span className="text-xs text-gray-600 font-medium bg-white px-2 py-0.5 rounded-lg border border-gray-100">
              🏛️ {summary.total_dinkes} Dinkes
            </span>
          </div>
        </Card>

        {/* Card 2: Community Forum */}
        <Card className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-violet-50/70 via-white to-white overflow-hidden relative group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wider text-violet-600 uppercase">Aktivitas Komunitas</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{summary.total_posts}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-violet-100/60 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-violet-700 font-medium bg-violet-50 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
              <ThumbsUp className="w-3 h-3" /> {summary.total_likes} Likes
            </span>
            <span className="text-xs text-violet-700 font-medium bg-violet-50 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> {summary.total_comments} Komentar
            </span>
          </div>
        </Card>

        {/* Card 3: Shop & Catalog */}
        <Card className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-amber-50/70 via-white to-white overflow-hidden relative group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wider text-amber-600 uppercase">Katalog Shop</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{summary.total_products}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-100/60 flex items-center justify-between">
            <span className="text-xs text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {summary.avg_rating} / 5.0
            </span>
            <span className="text-xs text-gray-500 font-medium">
              {summary.total_reviews} Ulasan
            </span>
          </div>
        </Card>

        {/* Card 4: Health Services */}
        <Card className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-emerald-50/70 via-white to-white overflow-hidden relative group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wider text-emerald-600 uppercase">Kunjungan Bidan (ANC)</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{summary.total_kunjungan}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <HeartPulse className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-100/60 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-600 font-medium bg-white px-2 py-0.5 rounded-lg border border-gray-100 flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-emerald-600" /> {summary.total_tips} Tips
            </span>
            <span className="text-xs text-gray-600 font-medium bg-white px-2 py-0.5 rounded-lg border border-gray-100 flex items-center gap-1">
              <ImageIcon className="w-3 h-3 text-emerald-600" /> {summary.total_banners} Banner
            </span>
          </div>
        </Card>
      </div>

      {/* Row 2: Community Insights & Shop Insights (Side by Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Box: Community Insight */}
        <Card
          className="rounded-2xl shadow-sm border-gray-100"
          title={
            <div className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Community Insight
            </div>
          }
          extra={
            <Tag color="magenta" className="rounded-full px-2.5">
              {summary.total_posts} Total Diskusi
            </Tag>
          }
        >
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Postingan Terpopuler (Top Engagement)
            </h4>

            <div className="space-y-3">
              {community.top_posts && community.top_posts.length > 0 ? (
                community.top_posts.map((post, idx) => (
                  <div
                    key={post.id}
                    className="p-3.5 rounded-xl border border-gray-100 hover:border-rose-200 hover:bg-rose-50/20 transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h5 className="font-semibold text-gray-900 text-sm line-clamp-1">{post.judul}</h5>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
                        <span className="flex items-center gap-1 text-rose-600 font-medium">
                          <ThumbsUp className="w-3 h-3" /> {post.total_likes}
                        </span>
                        <span className="flex items-center gap-1 text-violet-600 font-medium">
                          <MessageSquare className="w-3 h-3" /> {post.total_comments}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {post.deskripsi}
                    </p>
                    <div className="text-[11px] text-gray-400 flex items-center justify-between pt-1">
                      <span>Ditulis oleh: <strong className="text-gray-700">{post.author_name || 'Ibu Hamil'}</strong></span>
                      <span>{new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">Belum ada postingan komunitas</div>
              )}
            </div>

            {/* Recent Comments Snippet */}
            <div className="mt-2 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Komentar Terbaru
              </h4>
              <div className="space-y-2">
                {community.recent_comments && community.recent_comments.slice(0, 3).map((c) => (
                  <div key={c.id} className="text-xs bg-gray-50 p-2.5 rounded-xl flex flex-col gap-1">
                    <div className="flex items-center justify-between text-gray-500">
                      <span className="font-semibold text-gray-800">{c.user_name || 'Pengguna'}</span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(c.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-gray-700 italic">"{c.komentar}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Right Box: Shop Insight */}
        <Card
          className="rounded-2xl shadow-sm border-gray-100"
          title={
            <div className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Shop Insight
            </div>
          }
          extra={
            <Link to="/admin/shop" className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1">
              Buka Katalog <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          <div className="flex flex-col gap-5">
            {/* Category Chart */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Distribusi Kategori Produk
              </h4>
              <div className="h-44 w-full">
                {shop.categories && shop.categories.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={shop.categories} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <XAxis dataKey="category" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                      <RechartsTooltip
                        formatter={(val: number) => [`${val} Produk`, 'Jumlah']}
                        contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                        {shop.categories.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">Belum ada data kategori</div>
                )}
              </div>
            </div>

            {/* Rating Breakdown & Top Products */}
            <div className="pt-3 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Produk Rating Tertinggi
              </h4>
              <div className="space-y-2.5">
                {shop.top_products && shop.top_products.slice(0, 3).map((prod) => (
                  <div key={prod.id} className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        {prod.photo ? (
                          <img src={prod.photo} alt={prod.product_name} className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag className="w-5 h-5 m-2.5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h6 className="font-semibold text-gray-900 text-xs line-clamp-1">{prod.product_name}</h6>
                        <span className="text-[11px] text-gray-500">{formatRupiah(prod.price)}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {prod.average_rating}
                      </span>
                      <span className="text-[10px] text-gray-400">{prod.rating_count} ulasan</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 3: Platform Services & System Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Services Status */}
        <Card className="rounded-2xl shadow-sm border-gray-100 lg:col-span-1" title="Layanan Terintegrasi">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/60 border border-purple-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h6 className="text-xs font-bold text-gray-900">Paket Langganan Bidan</h6>
                  <p className="text-[11px] text-gray-500">{summary.total_subscriptions} Tier Aktif</p>
                </div>
              </div>
              <Link to="/admin/subscriptions" className="text-xs font-semibold text-purple-600 hover:text-purple-700">
                Kelola
              </Link>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h6 className="text-xs font-bold text-gray-900">Pengajuan Akun Bidan</h6>
                  <p className="text-[11px] text-gray-500">{summary.pending_bidan_applications} Menunggu Verifikasi</p>
                </div>
              </div>
              <Link to="/admin/bidan/applications" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                Verifikasi
              </Link>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/60 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h6 className="text-xs font-bold text-gray-900">Banner Informasi</h6>
                  <p className="text-[11px] text-gray-500">{summary.total_banners} Banner Tayang</p>
                </div>
              </div>
              <Link to="/admin/banner" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                Atur
              </Link>
            </div>
          </div>
        </Card>

        {/* Audit Log Activities */}
        <Card
          className="rounded-2xl shadow-sm border-gray-100 lg:col-span-2"
          title="Aktivitas Sistem Terkini (Audit Log)"
          extra={
            <Link to="/admin/history-log" className="text-xs text-rose-600 hover:text-rose-700 font-medium">
              Lihat Semua Log
            </Link>
          }
        >
          <div className="space-y-3">
            {recent_logs && recent_logs.length > 0 ? (
              recent_logs.map((log) => (
                <div key={log.id} className="flex items-start justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100/60">
                  <div className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-900">{log.user_name || 'Sistem'}</span>
                        <Tag color={log.user_role === 'admin' ? 'red' : log.user_role === 'bidan' ? 'blue' : 'green'} className="text-[10px] px-1.5 py-0 rounded">
                          {log.user_role}
                        </Tag>
                        <span className="text-xs font-medium text-gray-700">{log.activity_label}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{log.description}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-gray-400 shrink-0">
                    {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">Belum ada aktivitas terekam</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
