import { useEffect } from "react";
import {
  ArrowUpRight,
  Sparkles,
  Camera,
  Users,
  Image as ImageIcon,
  TrendingUp,
  Plus,
  Search,
  Bell,
  Settings,
  ChevronRight,
  Calendar,
  Eye,
  Heart,
  MoreHorizontal,
  Folder,
  Award,
  Zap,
  LayoutGrid,
  BarChart3,
  Filter,
  ArrowRight,
  Download,
  Share2,
  CheckCircle2,
} from "lucide-react";

const projects = [
  {
    id: 1,
    title: "Casamento Helena & Théo",
    client: "Família Marchetti",
    date: "12 Abr",
    photos: 842,
    selected: 64,
    status: "Em revisão",
    statusColor: "#FF9500",
    cover:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    progress: 72,
  },
  {
    id: 2,
    title: "Editorial Maison Verão",
    client: "Maison Atelier",
    date: "08 Abr",
    photos: 318,
    selected: 42,
    status: "Finalizado",
    statusColor: "#00C16E",
    cover:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
    progress: 100,
  },
  {
    id: 3,
    title: "Ensaio Família Bianchi",
    client: "Lucia Bianchi",
    date: "02 Abr",
    photos: 215,
    selected: 28,
    status: "Aguardando",
    statusColor: "#7C3AED",
    cover:
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=80",
    progress: 18,
  },
  {
    id: 4,
    title: "Corporativo Banca Sevilha",
    client: "Banca Sevilha",
    date: "29 Mar",
    photos: 124,
    selected: 31,
    status: "Finalizado",
    statusColor: "#00C16E",
    cover:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    progress: 100,
  },
  {
    id: 5,
    title: "Gastronomia Osteria Lua",
    client: "Osteria Lua",
    date: "21 Mar",
    photos: 96,
    selected: 18,
    status: "Em revisão",
    statusColor: "#FF9500",
    cover:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
    progress: 55,
  },
  {
    id: 6,
    title: "Coleção Joalheria Aurum",
    client: "Aurum Jewelry",
    date: "14 Mar",
    photos: 76,
    selected: 24,
    status: "Finalizado",
    statusColor: "#00C16E",
    cover:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80",
    progress: 100,
  },
];

const activity = [
  { who: "Família Marchetti", what: "selecionou 24 fotos", when: "4 min", avatar: "FM", color: "#7C3AED" },
  { who: "Maison Atelier", what: "aprovou a galeria", when: "1h", avatar: "MA", color: "#00C16E" },
  { who: "Lucia Bianchi", what: "abriu a galeria", when: "3h", avatar: "LB", color: "#FF9500" },
  { who: "Banca Sevilha", what: "fez download final", when: "6h", avatar: "BS", color: "#FF3B5C" },
  { who: "Osteria Lua", what: "comentou em 6 fotos", when: "1d", avatar: "OL", color: "#0EA5E9" },
];

const chartData = [42, 58, 35, 72, 65, 88, 95, 78, 92, 110, 128, 142];

export default function DashboardLuxe() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const maxChart = Math.max(...chartData);

  return (
    <div
      className="min-h-screen w-full bg-white"
      style={{
        fontFamily: "'Poppins', system-ui, sans-serif",
        color: "#0A0A0A",
      }}
    >
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-[240px] flex-shrink-0 flex-col justify-between border-r border-zinc-100 bg-white px-5 py-6 lg:flex">
          <div>
            {/* Logo */}
            <div className="mb-10 flex items-center gap-2.5 px-2">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{
                  background:
                    "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
                }}
              >
                <Camera className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <span
                className="text-[20px] tracking-tight"
                style={{ fontWeight: 800, letterSpacing: "-0.02em" }}
              >
                Fottufy
              </span>
            </div>

            {/* Nav */}
            <nav className="space-y-1">
              {[
                { icon: LayoutGrid, label: "Início", active: true },
                { icon: Folder, label: "Projetos", count: 24 },
                { icon: Users, label: "Clientes", count: 18 },
                { icon: ImageIcon, label: "Galerias" },
                { icon: BarChart3, label: "Analytics" },
                { icon: Calendar, label: "Agenda" },
              ].map((item) => (
                <button
                  key={item.label}
                  className="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all"
                  style={{
                    backgroundColor: item.active ? "#F4F4F5" : "transparent",
                    color: item.active ? "#0A0A0A" : "#52525B",
                  }}
                  data-testid={`luxe-nav-${item.label}`}
                  onMouseEnter={(e) => {
                    if (!item.active) e.currentTarget.style.backgroundColor = "#FAFAFA";
                  }}
                  onMouseLeave={(e) => {
                    if (!item.active) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className="h-[18px] w-[18px]"
                      strokeWidth={item.active ? 2.5 : 2}
                    />
                    <span
                      className="text-[14px]"
                      style={{ fontWeight: item.active ? 600 : 500 }}
                    >
                      {item.label}
                    </span>
                  </div>
                  {item.count && (
                    <span
                      className="rounded-md px-2 py-0.5 text-[11px] tabular-nums"
                      style={{
                        backgroundColor: item.active ? "#0A0A0A" : "#F4F4F5",
                        color: item.active ? "#FFFFFF" : "#71717A",
                        fontWeight: 600,
                      }}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Plan card */}
            <div
              className="mt-8 overflow-hidden rounded-2xl p-5"
              style={{
                background:
                  "linear-gradient(135deg, #0A0A0A 0%, #18181B 100%)",
                color: "#FFFFFF",
              }}
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" style={{ color: "#A855F7" }} strokeWidth={2.5} />
                <span
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: "#A1A1AA", fontWeight: 600 }}
                >
                  Plano Estúdio
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span
                  className="text-3xl tabular-nums"
                  style={{ fontWeight: 800, letterSpacing: "-0.03em" }}
                >
                  6.481
                </span>
                <span className="text-[12px]" style={{ color: "#71717A", fontWeight: 500 }}>
                  / 17.000
                </span>
              </div>
              <div className="mt-3">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: "38%",
                      background:
                        "linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)",
                    }}
                  />
                </div>
              </div>
              <button
                className="mt-4 w-full rounded-lg py-2 text-[12px]"
                style={{
                  backgroundColor: "#FFFFFF",
                  color: "#0A0A0A",
                  fontWeight: 600,
                }}
              >
                Fazer upgrade
              </button>
            </div>
          </div>

          {/* User */}
          <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[12px] text-white"
              style={{
                background:
                  "linear-gradient(135deg, #FF3B5C 0%, #FF9500 100%)",
                fontWeight: 700,
              }}
            >
              HF
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="truncate text-[13px]" style={{ fontWeight: 600 }}>
                Henrique
              </div>
              <div className="truncate text-[11px]" style={{ color: "#71717A", fontWeight: 500 }}>
                Fotógrafo Pro
              </div>
            </div>
            <Settings className="h-4 w-4 cursor-pointer text-zinc-400" strokeWidth={2} />
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-x-hidden">
          {/* Top bar */}
          <div className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-100 bg-white/80 px-6 py-4 backdrop-blur-xl lg:px-10">
            <div
              className="flex items-center gap-2.5 rounded-xl bg-zinc-50 px-4 py-2.5"
              style={{ width: "min(420px, 50vw)" }}
            >
              <Search className="h-[18px] w-[18px] text-zinc-400" strokeWidth={2} />
              <input
                placeholder="Buscar projeto, cliente ou galeria…"
                className="flex-1 border-none bg-transparent text-[13px] outline-none placeholder:text-zinc-400"
                style={{ fontWeight: 500 }}
              />
              <kbd
                className="hidden rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] text-zinc-400 sm:block"
                style={{ fontWeight: 600 }}
              >
                ⌘K
              </kbd>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 transition-all hover:bg-zinc-100">
                <Bell className="h-[18px] w-[18px] text-zinc-700" strokeWidth={2} />
                <span
                  className="absolute right-2 top-2 h-2 w-2 rounded-full ring-2 ring-zinc-50"
                  style={{ backgroundColor: "#FF3B5C" }}
                />
              </button>
              <button
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] text-white transition-all hover:opacity-90"
                style={{
                  background:
                    "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
                  fontWeight: 600,
                  boxShadow: "0 4px 14px 0 rgba(124, 58, 237, 0.25)",
                }}
                data-testid="button-luxe-new-project"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                Novo projeto
              </button>
            </div>
          </div>

          <div className="px-6 py-8 lg:px-10 lg:py-10">
            {/* Greeting */}
            <div className="mb-8">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👋</span>
                <span
                  className="text-[14px]"
                  style={{ color: "#71717A", fontWeight: 500 }}
                >
                  Sexta-feira, 17 de Abril
                </span>
              </div>
              <h1
                className="mt-2 text-[36px] leading-tight md:text-[42px]"
                style={{ fontWeight: 800, letterSpacing: "-0.03em" }}
              >
                Olá, Henrique 
              </h1>
              <p className="mt-1 text-[15px]" style={{ color: "#52525B", fontWeight: 500 }}>
                Você tem{" "}
                <span style={{ color: "#7C3AED", fontWeight: 700 }}>3 galerias</span>{" "}
                aguardando revisão e{" "}
                <span style={{ color: "#7C3AED", fontWeight: 700 }}>1 nova seleção</span>{" "}
                de cliente.
              </p>
            </div>

            {/* Stats cards */}
            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                {
                  label: "Total de fotos",
                  value: "6.481",
                  trend: "+12%",
                  trendUp: true,
                  icon: ImageIcon,
                  bg: "#F5F3FF",
                  fg: "#7C3AED",
                },
                {
                  label: "Selecionadas",
                  value: "1.247",
                  trend: "+24%",
                  trendUp: true,
                  icon: Heart,
                  bg: "#FFF1F2",
                  fg: "#FF3B5C",
                },
                {
                  label: "Visualizações",
                  value: "8.392",
                  trend: "+8%",
                  trendUp: true,
                  icon: Eye,
                  bg: "#ECFDF5",
                  fg: "#00C16E",
                },
                {
                  label: "Receita do mês",
                  value: "R$ 24,8k",
                  trend: "+18%",
                  trendUp: true,
                  icon: TrendingUp,
                  bg: "#FFF7ED",
                  fg: "#FF9500",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-zinc-100 bg-white p-5 transition-all hover:border-zinc-200 hover:shadow-sm"
                  data-testid={`luxe-stat-${stat.label}`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: stat.bg }}
                    >
                      <stat.icon
                        className="h-[18px] w-[18px]"
                        style={{ color: stat.fg }}
                        strokeWidth={2.5}
                      />
                    </div>
                    <span
                      className="rounded-md px-1.5 py-0.5 text-[10px] tabular-nums"
                      style={{
                        backgroundColor: stat.trendUp ? "#ECFDF5" : "#FEF2F2",
                        color: stat.trendUp ? "#00A65A" : "#DC2626",
                        fontWeight: 700,
                      }}
                    >
                      {stat.trend}
                    </span>
                  </div>
                  <div
                    className="mt-4 text-[28px] leading-none tabular-nums"
                    style={{ fontWeight: 800, letterSpacing: "-0.02em" }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="mt-1.5 text-[13px]"
                    style={{ color: "#71717A", fontWeight: 500 }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Chart + Quick actions row */}
            <div className="mb-8 grid gap-4 lg:grid-cols-3">
              {/* Chart */}
              <div className="rounded-2xl border border-zinc-100 bg-white p-6 lg:col-span-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3
                      className="text-[18px]"
                      style={{ fontWeight: 700, letterSpacing: "-0.01em" }}
                    >
                      Atividade da galeria
                    </h3>
                    <p
                      className="mt-1 text-[13px]"
                      style={{ color: "#71717A", fontWeight: 500 }}
                    >
                      Visualizações nos últimos 12 meses
                    </p>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-zinc-50 p-1">
                    {["12M", "30D", "7D"].map((p, i) => (
                      <button
                        key={p}
                        className="rounded-md px-3 py-1 text-[11px] transition-all"
                        style={{
                          backgroundColor: i === 0 ? "#FFFFFF" : "transparent",
                          color: i === 0 ? "#0A0A0A" : "#71717A",
                          fontWeight: 600,
                          boxShadow: i === 0 ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex items-baseline gap-3">
                  <span
                    className="text-[36px] leading-none tabular-nums"
                    style={{ fontWeight: 800, letterSpacing: "-0.03em" }}
                  >
                    8.392
                  </span>
                  <span
                    className="rounded-md px-2 py-0.5 text-[11px]"
                    style={{
                      backgroundColor: "#ECFDF5",
                      color: "#00A65A",
                      fontWeight: 700,
                    }}
                  >
                    ↑ 18,2%
                  </span>
                  <span
                    className="text-[12px]"
                    style={{ color: "#71717A", fontWeight: 500 }}
                  >
                    vs. período anterior
                  </span>
                </div>

                {/* Bar chart */}
                <div className="mt-8 flex h-[160px] items-end gap-2">
                  {chartData.map((v, i) => {
                    const h = (v / maxChart) * 100;
                    const isLast = i === chartData.length - 1;
                    return (
                      <div key={i} className="group flex flex-1 flex-col items-center gap-2">
                        <div
                          className="w-full rounded-t-md transition-all"
                          style={{
                            height: `${h}%`,
                            background: isLast
                              ? "linear-gradient(180deg, #7C3AED 0%, #A855F7 100%)"
                              : "linear-gradient(180deg, #F4F4F5 0%, #E4E4E7 100%)",
                          }}
                        />
                        <span
                          className="text-[10px] tabular-nums"
                          style={{ color: isLast ? "#7C3AED" : "#A1A1AA", fontWeight: 600 }}
                        >
                          {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick actions */}
              <div className="rounded-2xl border border-zinc-100 bg-white p-6">
                <h3
                  className="text-[18px]"
                  style={{ fontWeight: 700, letterSpacing: "-0.01em" }}
                >
                  Ações rápidas
                </h3>
                <p
                  className="mt-1 text-[13px]"
                  style={{ color: "#71717A", fontWeight: 500 }}
                >
                  Comece em um clique
                </p>

                <div className="mt-5 space-y-2">
                  {[
                    { icon: Plus, label: "Novo projeto", desc: "Criar galeria", color: "#7C3AED", bg: "#F5F3FF" },
                    { icon: Share2, label: "Compartilhar link", desc: "Copiar URL pública", color: "#0EA5E9", bg: "#F0F9FF" },
                    { icon: Download, label: "Exportar fotos", desc: "Download em lote", color: "#00C16E", bg: "#ECFDF5" },
                  ].map((a) => (
                    <button
                      key={a.label}
                      className="group flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all hover:bg-zinc-50"
                      data-testid={`luxe-quick-${a.label}`}
                    >
                      <div
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: a.bg }}
                      >
                        <a.icon
                          className="h-[18px] w-[18px]"
                          style={{ color: a.color }}
                          strokeWidth={2.5}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-[13px]" style={{ fontWeight: 600 }}>
                          {a.label}
                        </div>
                        <div
                          className="text-[11px]"
                          style={{ color: "#71717A", fontWeight: 500 }}
                        >
                          {a.desc}
                        </div>
                      </div>
                      <ArrowRight
                        className="h-4 w-4 text-zinc-300 transition-all group-hover:translate-x-0.5 group-hover:text-zinc-700"
                        strokeWidth={2}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Projects + Activity */}
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              {/* Projects */}
              <div>
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2
                      className="text-[22px]"
                      style={{ fontWeight: 700, letterSpacing: "-0.02em" }}
                    >
                      Projetos recentes
                    </h2>
                    <p
                      className="mt-0.5 text-[13px]"
                      style={{ color: "#71717A", fontWeight: 500 }}
                    >
                      24 projetos no total
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[12px] transition-all hover:bg-zinc-50"
                      style={{ fontWeight: 600 }}
                    >
                      <Filter className="h-3.5 w-3.5" strokeWidth={2.5} />
                      Filtrar
                    </button>
                    <button
                      className="flex items-center gap-1 rounded-xl px-3 py-2 text-[12px]"
                      style={{ color: "#7C3AED", fontWeight: 600 }}
                    >
                      Ver todos
                      <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {projects.map((p) => (
                    <article
                      key={p.id}
                      className="group cursor-pointer overflow-hidden rounded-2xl border border-zinc-100 bg-white transition-all hover:border-zinc-200 hover:shadow-lg hover:shadow-zinc-200/50"
                      data-testid={`luxe-card-${p.id}`}
                    >
                      <div className="relative h-[180px] overflow-hidden bg-zinc-100">
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                          style={{ backgroundImage: `url(${p.cover})` }}
                        />
                        {/* status pill */}
                        <div className="absolute left-3 top-3">
                          <span
                            className="flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] backdrop-blur-md"
                            style={{ color: "#0A0A0A", fontWeight: 700 }}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: p.statusColor }}
                            />
                            {p.status}
                          </span>
                        </div>
                        <button
                          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 backdrop-blur-md transition-all hover:bg-white"
                        >
                          <MoreHorizontal className="h-4 w-4 text-zinc-700" />
                        </button>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 overflow-hidden">
                            <div
                              className="text-[11px]"
                              style={{ color: "#71717A", fontWeight: 600 }}
                            >
                              {p.client} · {p.date}
                            </div>
                            <h3
                              className="mt-1 truncate text-[15px]"
                              style={{
                                fontWeight: 700,
                                letterSpacing: "-0.01em",
                              }}
                            >
                              {p.title}
                            </h3>
                          </div>
                        </div>

                        {/* metrics */}
                        <div className="mt-4 flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <ImageIcon
                              className="h-3.5 w-3.5 text-zinc-400"
                              strokeWidth={2.5}
                            />
                            <span
                              className="text-[12px] tabular-nums"
                              style={{ color: "#52525B", fontWeight: 600 }}
                            >
                              {p.photos}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Heart
                              className="h-3.5 w-3.5"
                              style={{ color: "#FF3B5C" }}
                              strokeWidth={2.5}
                              fill="#FF3B5C"
                            />
                            <span
                              className="text-[12px] tabular-nums"
                              style={{ color: "#52525B", fontWeight: 600 }}
                            >
                              {p.selected}
                            </span>
                          </div>
                          {p.progress === 100 && (
                            <div className="ml-auto flex items-center gap-1">
                              <CheckCircle2
                                className="h-3.5 w-3.5"
                                style={{ color: "#00C16E" }}
                                strokeWidth={2.5}
                              />
                            </div>
                          )}
                        </div>

                        {/* progress */}
                        <div className="mt-3">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${p.progress}%`,
                                backgroundColor: p.statusColor,
                              }}
                            />
                          </div>
                          <div className="mt-1.5 flex justify-between text-[10px]" style={{ color: "#A1A1AA", fontWeight: 600 }}>
                            <span>{p.progress}% completo</span>
                            <span>{p.selected}/{p.photos}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* Right column */}
              <aside className="space-y-6">
                {/* Activity */}
                <div className="rounded-2xl border border-zinc-100 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <h3
                      className="text-[15px]"
                      style={{ fontWeight: 700, letterSpacing: "-0.01em" }}
                    >
                      Atividade
                    </h3>
                    <button
                      className="text-[11px]"
                      style={{ color: "#7C3AED", fontWeight: 600 }}
                    >
                      Ver tudo
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {activity.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div
                          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[10px] text-white"
                          style={{ backgroundColor: item.color, fontWeight: 700 }}
                        >
                          {item.avatar}
                        </div>
                        <div className="flex-1">
                          <p className="text-[13px] leading-snug" style={{ color: "#0A0A0A" }}>
                            <span style={{ fontWeight: 700 }}>{item.who}</span>{" "}
                            <span style={{ color: "#52525B", fontWeight: 500 }}>
                              {item.what}
                            </span>
                          </p>
                          <p
                            className="mt-0.5 text-[11px]"
                            style={{ color: "#A1A1AA", fontWeight: 600 }}
                          >
                            há {item.when}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Promo card */}
                <div
                  className="relative overflow-hidden rounded-2xl p-6 text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #7C3AED 0%, #A855F7 60%, #EC4899 100%)",
                  }}
                >
                  <div
                    className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-30"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                  <div
                    className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full opacity-20"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />

                  <div className="relative">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                      <Sparkles className="h-4 w-4 text-white" strokeWidth={2.5} />
                    </div>
                    <h3
                      className="mt-4 text-[20px] leading-tight"
                      style={{ fontWeight: 800, letterSpacing: "-0.02em" }}
                    >
                      Portfólio Pro
                    </h3>
                    <p
                      className="mt-1 text-[12px] leading-relaxed"
                      style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}
                    >
                      Sua vitrine recebeu 248 visitas esta semana. 4 novos contatos.
                    </p>
                    <button
                      className="mt-4 flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-[12px]"
                      style={{ color: "#7C3AED", fontWeight: 700 }}
                    >
                      Editar portfólio
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
