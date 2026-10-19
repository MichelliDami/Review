import React, { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Trash2,
  FileText,
  Download,
  Printer,
  Users,
  BarChart3,
  Search,
  Filter,
  ArrowLeft,
  Eye,
  Star,
  RefreshCw,
  Ban,
  TrendingUp,
} from 'lucide-react';
import { Review, User } from '../types';

interface AdminPanelProps {
  currentUser: User | null;
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  allUsers: User[];
  setAllUsers: React.Dispatch<React.SetStateAction<User[]>>;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  reviews,
  setReviews,
  allUsers,
  setAllUsers,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'moderation' | 'reports' | 'users' | 'rules'>('moderation');
  const [moderationFilter, setModerationFilter] = useState<'all' | 'pending' | 'approved' | 'barred'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [barModalReview, setBarModalReview] = useState<Review | null>(null);
  const [barReason, setBarReason] = useState('Violação das regras da comunidade / Spam');

  // Stats calculation
  const totalReviews = reviews.length;
  const pendingReviews = reviews.filter((r) => r.status === 'pending' || r.reported).length;
  const approvedReviews = reviews.filter((r) => r.status === 'approved').length;
  const barredReviews = reviews.filter((r) => r.status === 'barred').length;
  const activeUsersCount = allUsers.filter((u) => u.status === 'active').length;

  // Actions
  const handleApprove = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, status: 'approved', reported: false, reportCount: 0 }
          : r
      )
    );
  };

  const handleOpenBarModal = (review: Review) => {
    setBarModalReview(review);
  };

  const handleConfirmBar = () => {
    if (!barModalReview) return;
    setReviews((prev) =>
      prev.map((r) =>
        r.id === barModalReview.id
          ? { ...r, status: 'barred', barReason: barReason }
          : r
      )
    );
    setBarModalReview(null);
  };

  const handleDeletePermanent = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  const handleToggleUserStatus = (userId: string) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'active' ? 'suspended' : 'active';
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  // CSV Report Generator
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Produto',
      'Categoria',
      'Autor',
      'Handle',
      'Nota',
      'Status',
      'Curtidas',
      'Comentarios',
      'Denunciada',
      'Motivo_Barrada',
    ];

    const rows = reviews.map((r) => [
      `"${r.id}"`,
      `"${r.productName.replace(/"/g, '""')}"`,
      `"${r.category}"`,
      `"${r.userName}"`,
      `"${r.userHandle}"`,
      r.rating,
      r.status,
      r.likes,
      r.commentsCount || 0,
      r.reported ? 'SIM' : 'NAO',
      `"${(r.barReason || r.reportReason || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_review_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print PDF View
  const handlePrint = () => {
    window.print();
  };

  // Filtered reviews for moderation tab
  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.content.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (moderationFilter === 'pending') {
      return r.status === 'pending' || r.reported;
    }
    if (moderationFilter === 'approved') {
      return r.status === 'approved';
    }
    if (moderationFilter === 'barred') {
      return r.status === 'barred';
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#090514] text-white flex flex-col">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-[#120a28]/95 border-b border-purple-900/50 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            id="back-to-app-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-purple-950/60 hover:bg-purple-900 text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Review</span>
          </button>

          <div className="h-5 w-[1px] bg-purple-900/60" />

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                Painel Administrativo
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-600/40 text-purple-300 border border-purple-500/40">
                  ADM Nicole
                </span>
              </h1>
              <p className="text-[11px] text-zinc-400">
                Gestão de moderação, barrar postagens, relatórios e controle de usuários +18 anos
              </p>
            </div>
          </div>
        </div>

        {/* User identification badge */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block text-xs text-zinc-400">
            Logada como: <strong className="text-white">{currentUser?.email}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors cursor-pointer"
          >
            Sair do Painel
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="cosmic-card p-4 rounded-2xl border border-purple-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-medium">Total de Avaliações</span>
              <FileText className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-black text-white mt-2">{totalReviews}</p>
            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="w-3 h-3" /> Comunidade ativa
            </span>
          </div>

          <div className="cosmic-card p-4 rounded-2xl border border-amber-900/40 bg-amber-950/15">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-300 font-medium">Pendentes / Denúncias</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-300 mt-2">{pendingReviews}</p>
            <span className="text-[10px] text-zinc-400 mt-0.5 block">Requerem atenção</span>
          </div>

          <div className="cosmic-card p-4 rounded-2xl border border-red-900/40 bg-red-950/15">
            <div className="flex items-center justify-between">
              <span className="text-xs text-red-300 font-medium">Postagens Barradas</span>
              <Ban className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-2xl font-black text-red-400 mt-2">{barredReviews}</p>
            <span className="text-[10px] text-zinc-400 mt-0.5 block">Removidas do feed público</span>
          </div>

          <div className="cosmic-card p-4 rounded-2xl border border-purple-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-medium">Usuários (+18 Verificados)</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-black text-white mt-2">{activeUsersCount}</p>
            <span className="text-[10px] text-purple-300 mt-0.5 block">Membros cadastrados</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-purple-900/50 pb-2 overflow-x-auto">
          {[
            { id: 'moderation', label: 'Moderação de Postagens', icon: AlertTriangle, badge: pendingReviews },
            { id: 'reports', label: 'Gerar Relatórios', icon: BarChart3 },
            { id: 'users', label: 'Gerenciamento de Usuários', icon: Users },
            { id: 'rules', label: 'Diretrizes e Regras (+18)', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`admin-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-purple-950/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-500 text-black">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ================= TAB 1: MODERAÇÃO DE POSTAGENS ================= */}
        {activeTab === 'moderation' && (
          <div className="space-y-4">
            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 cosmic-card p-3 rounded-2xl">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {[
                  { id: 'pending', label: 'Pendentes / Denúncias' },
                  { id: 'all', label: 'Todas as Postagens' },
                  { id: 'approved', label: 'Aprovadas' },
                  { id: 'barred', label: 'Barradas' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setModerationFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      moderationFilter === f.id
                        ? 'bg-purple-600 text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-purple-950/40'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300/60" />
                <input
                  type="text"
                  placeholder="Buscar por produto ou usuário..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-purple-950/40 border border-purple-900/60 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* List of Reviews to Moderate */}
            <div className="space-y-3">
              {filteredReviews.length === 0 ? (
                <div className="p-12 text-center cosmic-card rounded-2xl">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                  <h3 className="text-base font-bold text-white">Nenhuma postagem nesta categoria</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Todas as avaliações foram revisadas ou não correspondem ao filtro atual.
                  </p>
                </div>
              ) : (
                filteredReviews.map((rev) => (
                  <div
                    key={rev.id}
                    id={`moderation-row-${rev.id}`}
                    className={`p-4 rounded-2xl cosmic-card border transition-all ${
                      rev.status === 'barred'
                        ? 'border-red-900/50 bg-red-950/10'
                        : rev.reported || rev.status === 'pending'
                        ? 'border-amber-700/60 bg-amber-950/10'
                        : 'border-purple-900/40'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Review Details */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <img
                            src={rev.userAvatar}
                            alt={rev.userName}
                            className="w-8 h-8 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="text-xs font-bold text-white">{rev.userName}</span>
                            <span className="text-[11px] text-zinc-400 ml-1.5">@{rev.userHandle}</span>
                          </div>

                          <span className="text-xs text-zinc-500">•</span>
                          <span className="text-xs font-semibold text-purple-300">{rev.category}</span>
                          <span className="text-xs text-zinc-500">•</span>
                          <span className="text-xs font-bold text-white">{rev.productName}</span>

                          {/* Status Badge */}
                          {rev.status === 'barred' && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-600/30 text-red-300 border border-red-500/40">
                              Barrada / Bloqueada
                            </span>
                          )}
                          {rev.status === 'approved' && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-600/30 text-emerald-300 border border-emerald-500/40">
                              Aprovada no Feed
                            </span>
                          )}
                          {rev.status === 'pending' && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-600/30 text-amber-300 border border-amber-500/40">
                              Pendente de Moderação
                            </span>
                          )}
                          {rev.reported && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-600 text-white animate-pulse">
                              Denunciada ({rev.reportCount || 1} denúncias)
                            </span>
                          )}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1.5 text-xs text-amber-300">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-bold">{rev.rating.toFixed(1)}</span>
                        </div>

                        {/* Text */}
                        <p className="text-xs text-zinc-200 bg-purple-950/30 p-2.5 rounded-xl border border-purple-900/30">
                          "{rev.content}"
                        </p>

                        {/* Flag / Bar Reason */}
                        {(rev.barReason || rev.reportReason) && (
                          <p className="text-[11px] text-red-300 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                            <span>Motivo: {rev.barReason || rev.reportReason}</span>
                          </p>
                        )}
                      </div>

                      {/* Right: Administrative Actions (Barrar, Aprovar, Deletar) */}
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {rev.status !== 'approved' && (
                          <button
                            id={`approve-btn-${rev.id}`}
                            onClick={() => handleApprove(rev.id)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                            title="Aprovar e publicar no feed"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Aprovar Post</span>
                          </button>
                        )}

                        {rev.status !== 'barred' && (
                          <button
                            id={`bar-btn-${rev.id}`}
                            onClick={() => handleOpenBarModal(rev)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                            title="Barrar esta postagem"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Barrar Postagem</span>
                          </button>
                        )}

                        <button
                          id={`delete-btn-${rev.id}`}
                          onClick={() => handleDeletePermanent(rev.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-400 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 flex items-center gap-1.5 cursor-pointer transition-all"
                          title="Deletar permanentemente"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Deletar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: GERAR RELATÓRIOS ================= */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Action Bar for Exporting and Printing */}
            <div className="cosmic-card p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white">Central de Relatórios Estatísticos</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Gere relatórios completos de avaliações, produtos líderes, nichos e dados da moderação.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  id="admin-export-csv-btn"
                  onClick={handleExportCSV}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors cursor-pointer shadow-md shadow-emerald-900/30"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar CSV</span>
                </button>

                <button
                  id="admin-print-report-btn"
                  onClick={handlePrint}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors cursor-pointer shadow-md shadow-purple-900/30"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Salvar PDF</span>
                </button>
              </div>
            </div>

            {/* Visual Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nichos mais avaliados */}
              <div className="cosmic-card p-5 rounded-2xl space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  <span>Avaliações por Nicho</span>
                </h4>
                <div className="space-y-2 text-xs">
                  {[
                    { niche: 'Tecnologia', count: 48, percentage: 38 },
                    { niche: 'Beleza & Skincare', count: 32, percentage: 25 },
                    { niche: 'Restaurantes & Gastronomia', count: 18, percentage: 14 },
                    { niche: 'Casa & Eletro', count: 14, percentage: 11 },
                    { niche: 'Moda & Perfumes', count: 15, percentage: 12 },
                  ].map((item) => (
                    <div key={item.niche} className="space-y-1">
                      <div className="flex justify-between text-zinc-300">
                        <span>{item.niche}</span>
                        <span className="font-bold text-white">{item.count} avaliações ({item.percentage}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-purple-950 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Auditoria de Moderação */}
              <div className="cosmic-card p-5 rounded-2xl space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Auditoria da Moderação</span>
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-purple-950/40 flex justify-between items-center">
                    <span className="text-zinc-300">Taxa de Aprovação de Conteúdo</span>
                    <span className="font-black text-emerald-400 text-sm">
                      {Math.round((approvedReviews / (totalReviews || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-950/40 flex justify-between items-center">
                    <span className="text-zinc-300">Tempo Médio de Moderação</span>
                    <span className="font-black text-purple-300 text-sm">&lt; 15 minutos</span>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-950/40 flex justify-between items-center">
                    <span className="text-zinc-300">Postagens Bloqueadas por Spam/Violação</span>
                    <span className="font-black text-red-400 text-sm">{barredReviews} postagens</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Printable Detailed Table Preview */}
            <div className="cosmic-card p-5 rounded-2xl space-y-3 overflow-x-auto">
              <h4 className="text-sm font-bold text-white">Extrato de Avaliações Registradas</h4>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-purple-900/50 text-zinc-400">
                    <th className="pb-2 font-semibold">Produto</th>
                    <th className="pb-2 font-semibold">Nicho</th>
                    <th className="pb-2 font-semibold">Autor</th>
                    <th className="pb-2 font-semibold">Nota</th>
                    <th className="pb-2 font-semibold">Status</th>
                    <th className="pb-2 font-semibold">Interações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-950">
                  {reviews.slice(0, 8).map((r) => (
                    <tr key={r.id} className="text-zinc-300">
                      <td className="py-2.5 font-bold text-white">{r.productName}</td>
                      <td className="py-2.5">{r.category}</td>
                      <td className="py-2.5">@{r.userHandle}</td>
                      <td className="py-2.5 text-amber-300 font-bold">★ {r.rating.toFixed(1)}</td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r.status === 'approved'
                              ? 'bg-emerald-950 text-emerald-400'
                              : r.status === 'barred'
                              ? 'bg-red-950 text-red-400'
                              : 'bg-amber-950 text-amber-400'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-2.5">{r.likes} likes • {r.commentsCount || 0} com.</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: GERENCIAMENTO DE USUÁRIOS (+18) ================= */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between cosmic-card p-4 rounded-2xl">
              <div>
                <h3 className="text-sm font-bold text-white">Usuários da Rede Social</h3>
                <p className="text-xs text-zinc-400">
                  Controle de contas, verificação de maioridade (+18 anos) e suspensões.
                </p>
              </div>
              <span className="text-xs font-bold text-purple-300">
                {allUsers.length} usuários cadastrados
              </span>
            </div>

            <div className="space-y-2.5">
              {allUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-3.5 rounded-2xl cosmic-card border border-purple-900/40 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border border-purple-600/40"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{user.name}</span>
                        <span className="text-[11px] text-zinc-400">@{user.username}</span>
                        {user.isAdmin && (
                          <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            ADM
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                        <span>{user.email}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">{user.age} anos (+18 verificado)</span>
                        <span>•</span>
                        <span>{user.reviewCount} avaliações</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {!user.isAdmin && (
                    <button
                      onClick={() => handleToggleUserStatus(user.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        user.status === 'active'
                          ? 'bg-red-950/60 text-red-300 border border-red-800/40 hover:bg-red-900'
                          : 'bg-emerald-600 text-white hover:bg-emerald-500'
                      }`}
                    >
                      {user.status === 'active' ? 'Suspender Conta' : 'Reativar Conta'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: DIRETRIZES (+18) ================= */}
        {activeTab === 'rules' && (
          <div className="cosmic-card p-6 rounded-2xl space-y-4 max-w-3xl">
            <div className="flex items-center gap-2 pb-3 border-b border-purple-900/40">
              <Shield className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">Regras e Políticas do Review</h3>
            </div>

            <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-900/40 space-y-1">
                <h5 className="font-bold text-amber-300">1. Restrição Estrita de Idade (+18 anos)</h5>
                <p>
                  O Review é estritamente proibido para menores de 18 anos. Todo usuário deve comprovar data de nascimento válida no cadastro. Contas suspeitas de pertencerem a menores de idade são barradas imediatamente pelo administrador.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-900/40 space-y-1">
                <h5 className="font-bold text-purple-300">2. Avaliações Autênticas & Proibição de Spam</h5>
                <p>
                  Não é tolerado o uso de bots promocionais, links de afiliados enganosos ou avaliações falsas pagas. Postagens deste teor devem ser barradas pelo botão de moderação do administrador.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-900/40 space-y-1">
                <h5 className="font-bold text-purple-300">3. Liberdade de Opinião com Respeito</h5>
                <p>
                  Críticas negativas sinceras a produtos, lojas ou restaurantes são 100% incentivadas, desde que não contenham calúnia, discurso de ódio ou palavrões ofensivos.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: BARRAR POSTAGEM (Specify Reason) */}
      {barModalReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md cosmic-card p-6 rounded-3xl border border-red-800/60 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-red-400">
              <Ban className="w-5 h-5" />
              <h4 className="text-base font-bold">Barrar Postagem de Avaliação</h4>
            </div>

            <p className="text-xs text-zinc-300">
              Você está prestes a barrar a postagem sobre{' '}
              <strong className="text-white">"{barModalReview.productName}"</strong> de{' '}
              <strong className="text-white">@{barModalReview.userHandle}</strong>. Esta postagem deixará de aparecer no feed da comunidade.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Motivo para barrar:</label>
              <select
                value={barReason}
                onChange={(e) => setBarReason(e.target.value)}
                className="w-full p-2.5 text-xs bg-purple-950/60 border border-purple-900/60 rounded-xl text-white focus:outline-none focus:border-red-500"
              >
                <option value="Spam / Promoção Enganosa / Golpe">Spam / Promoção Enganosa / Golpe</option>
                <option value="Linguagem Ofensiva / Violação de Diretrizes">Linguagem Ofensiva / Violação de Diretrizes</option>
                <option value="Suspeita de Usuário Menor de 18 Anos">Suspeita de Usuário Menor de 18 Anos</option>
                <option value="Conteúdo Pirata ou Ilegal">Conteúdo Pirata ou Ilegal</option>
                <option value="Desinformação / Avaliação Falsa">Desinformação / Avaliação Falsa</option>
              </select>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setBarModalReview(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white rounded-xl bg-purple-950/40 hover:bg-purple-900/40 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmBar}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl cursor-pointer"
              >
                Confirmar e Barrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
