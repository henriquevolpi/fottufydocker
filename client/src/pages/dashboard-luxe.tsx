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
  CircleDot,
  Award,
  Zap,
} from "lucide-react";

const projects = [
  {
    id: 1,
    title: "Casamento Helena & Théo",
    client: "Família Marchetti",
    date: "12 Abr 2026",
    photos: 842,
    selected: 64,
    status: "Em revisão",
    accent: "#C9A961",
    cover:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    progress: 72,
  },
  {
    id: 2,
    title: "Editorial Maison Verão",
    client: "Maison Atelier",
    date: "08 Abr 2026",
    photos: 318,
    selected: 42,
    status: "Finalizado",
    accent: "#1F1F1F",
    cover:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
    progress: 100,
  },
  {
    id: 3,
    title: "Ensaio Família Bianchi",
    client: "Lucia Bianchi",
    date: "02 Abr 2026",
    photos: 215,
    selected: 28,
    status: "Aguardando",
    accent: "#7B6F5F",
    cover:
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=80",
    progress: 18,
  },
  {
    id: 4,
    title: "Corporativo Banca Sevilha",
    client: "Banca Sevilha & Co.",
    date: "29 Mar 2026",
    photos: 124,
    selected: 31,
    status: "Finalizado",
    accent: "#2A3F33",
    cover:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    progress: 100,
  },
  {
    id: 5,
    title: "Gastronomia Osteria Lua",
    client: "Osteria Lua",
    date: "21 Mar 2026",
    photos: 96,
    selected: 18,
    status: "Em revisão",
    accent: "#8B3A1F",
    cover:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
    progress: 55,
  },
  {
    id: 6,
    title: "Coleção Joalheria Aurum",
    client: "Aurum Fine Jewelry",
    date: "14 Mar 2026",
    photos: 76,
    selected: 24,
    status: "Finalizado",
    accent: "#C9A961",
    cover:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80",
    progress: 100,
  },
];

const activity = [
  { who: "Família Marchetti", what: "selecionou 24 fotos", when: "há 4 min", color: "#C9A961" },
  { who: "Maison Atelier", what: "aprovou a galeria", when: "há 1h", color: "#1F1F1F" },
  { who: "Lucia Bianchi", what: "abriu a galeria", when: "há 3h", color: "#7B6F5F" },
  { who: "Banca Sevilha", what: "fez download final", when: "há 6h", color: "#2A3F33" },
  { who: "Osteria Lua", what: "comentou em 6 fotos", when: "ontem", color: "#8B3A1F" },
];

export default function DashboardLuxe() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundColor: "#F7F4EE",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#1A1A1A",
      }}
    >
      {/* Subtle grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <aside
          className="hidden w-[260px] flex-shrink-0 flex-col justify-between border-r px-8 py-10 lg:flex"
          style={{ borderColor: "rgba(26,26,26,0.08)" }}
        >
          <div>
            {/* Logo */}
            <div className="mb-16 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: "#1A1A1A" }}
              >
                <Sparkles className="h-4 w-4" style={{ color: "#C9A961" }} />
              </div>
              <div>
                <div
                  className="text-2xl leading-none"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 500,
                    letterSpacing: "0.02em",
                  }}
                >
                  Fottufy
                </div>
                <div
                  className="mt-1 text-[9px] uppercase tracking-[0.3em]"
                  style={{ color: "#8A8174" }}
                >
                  Atelier
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="space-y-1">
              {[
                { icon: Folder, label: "Estúdio", active: true },
                { icon: ImageIcon, label: "Galerias", count: 24 },
                { icon: Users, label: "Clientes", count: 18 },
                { icon: Calendar, label: "Agenda" },
                { icon: TrendingUp, label: "Insights" },
              ].map((item) => (
                <button
                  key={item.label}
                  className="group flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-all"
                  style={{
                    backgroundColor: item.active ? "#1A1A1A" : "transparent",
                    color: item.active ? "#F7F4EE" : "#3A3A3A",
                  }}
                  data-testid={`luxe-nav-${item.label}`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-[15px] w-[15px]" strokeWidth={1.5} />
                    <span className="text-[13px] font-normal tracking-wide">
                      {item.label}
                    </span>
                  </div>
                  {item.count && (
                    <span
                      className="text-[10px] tabular-nums"
                      style={{
                        color: item.active ? "#C9A961" : "#8A8174",
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
              className="mt-16 rounded-2xl border p-6"
              style={{
                borderColor: "rgba(26,26,26,0.08)",
                backgroundColor: "#FBFAF6",
              }}
            >
              <div className="flex items-center gap-2">
                <Award className="h-3 w-3" style={{ color: "#C9A961" }} strokeWidth={2} />
                <span
                  className="text-[9px] uppercase tracking-[0.3em]"
                  style={{ color: "#8A8174" }}
                >
                  Plano Atelier
                </span>
              </div>
              <div
                className="mt-4 text-3xl"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 500,
                }}
              >
                17.000
              </div>
              <div className="text-[11px]" style={{ color: "#6B6358" }}>
                fotos do plano
              </div>
              <div className="mt-5">
                <div
                  className="h-[2px] w-full overflow-hidden rounded-full"
                  style={{ backgroundColor: "rgba(26,26,26,0.06)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: "38%", backgroundColor: "#C9A961" }}
                  />
                </div>
                <div
                  className="mt-3 flex justify-between text-[10px] tabular-nums"
                  style={{ color: "#8A8174" }}
                >
                  <span>6.481 usadas</span>
                  <span>38%</span>
                </div>
              </div>
            </div>
          </div>

          {/* User */}
          <div className="flex items-center gap-3 border-t pt-6" style={{ borderColor: "rgba(26,26,26,0.08)" }}>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-[11px]"
              style={{
                background:
                  "linear-gradient(135deg, #C9A961 0%, #8B7340 100%)",
                color: "#1A1A1A",
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
              }}
            >
              HF
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="truncate text-[12px] font-medium">Henrique Ferreira</div>
              <div className="truncate text-[10px]" style={{ color: "#8A8174" }}>
                Fotógrafo · São Paulo
              </div>
            </div>
            <Settings className="h-4 w-4 cursor-pointer" strokeWidth={1.5} style={{ color: "#8A8174" }} />
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-x-hidden">
          {/* Top bar */}
          <div
            className="sticky top-0 z-30 flex items-center justify-between border-b px-6 py-5 backdrop-blur-xl lg:px-12"
            style={{
              borderColor: "rgba(26,26,26,0.06)",
              backgroundColor: "rgba(247,244,238,0.85)",
            }}
          >
            <div className="flex items-center gap-3">
              <Search className="h-4 w-4" strokeWidth={1.5} style={{ color: "#8A8174" }} />
              <input
                placeholder="Buscar projeto, cliente, galeria…"
                className="w-[280px] border-none bg-transparent text-[13px] outline-none placeholder:text-[#8A8174] sm:w-[360px]"
                style={{ color: "#1A1A1A" }}
              />
            </div>
            <div className="flex items-center gap-5">
              <div
                className="hidden items-center gap-2 rounded-full border px-3 py-1.5 sm:flex"
                style={{ borderColor: "rgba(26,26,26,0.1)" }}
              >
                <CircleDot className="h-3 w-3" strokeWidth={2} style={{ color: "#2A7F4F" }} />
                <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "#3A3A3A" }}>
                  Online
                </span>
              </div>
              <button className="relative">
                <Bell className="h-[18px] w-[18px]" strokeWidth={1.5} style={{ color: "#3A3A3A" }} />
                <span
                  className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full"
                  style={{ backgroundColor: "#C9A961" }}
                />
              </button>
              <button
                className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-medium tracking-wide transition-all hover:opacity-90"
                style={{ backgroundColor: "#1A1A1A", color: "#F7F4EE" }}
                data-testid="button-luxe-new-project"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                Novo Projeto
              </button>
            </div>
          </div>

          <div className="px-6 py-12 lg:px-12 lg:py-16">
            {/* Hero / Greeting */}
            <div className="mb-16 flex flex-col items-end justify-between gap-6 md:flex-row md:items-end">
              <div>
                <div
                  className="mb-3 text-[11px] uppercase tracking-[0.4em]"
                  style={{ color: "#8A8174" }}
                >
                  Sexta-feira, 17 de Abril
                </div>
                <h1
                  className="text-[56px] leading-[0.95] md:text-[72px]"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 400,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Bom dia,
                  <br />
                  <span style={{ fontStyle: "italic", fontWeight: 500 }}>
                    Henrique
                  </span>
                  <span style={{ color: "#C9A961" }}>.</span>
                </h1>
                <p
                  className="mt-5 max-w-md text-[14px] leading-relaxed"
                  style={{ color: "#5A5247" }}
                >
                  Você tem <span style={{ color: "#1A1A1A", fontWeight: 500 }}>3 galerias</span> aguardando
                  revisão e <span style={{ color: "#1A1A1A", fontWeight: 500 }}>1 nova seleção</span> de cliente
                  desde ontem.
                </p>
              </div>

              <div className="flex gap-8">
                {[
                  { label: "Receita do mês", value: "R$ 24.8k", trend: "+18%" },
                  { label: "Galerias ativas", value: "12", trend: "+3" },
                ].map((stat) => (
                  <div key={stat.label} className="text-right">
                    <div
                      className="text-[10px] uppercase tracking-[0.3em]"
                      style={{ color: "#8A8174" }}
                    >
                      {stat.label}
                    </div>
                    <div
                      className="mt-2 text-4xl tabular-nums"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 500,
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      className="mt-1 inline-flex items-center gap-1 text-[10px]"
                      style={{ color: "#2A7F4F" }}
                    >
                      <ArrowUpRight className="h-2.5 w-2.5" strokeWidth={2.5} />
                      {stat.trend} vs. anterior
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats row */}
            <div className="mb-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl md:grid-cols-4" style={{ backgroundColor: "rgba(26,26,26,0.08)" }}>
              {[
                { label: "Total de Fotos", value: "6.481", sub: "neste mês", icon: ImageIcon },
                { label: "Selecionadas", value: "1.247", sub: "pelos clientes", icon: Heart },
                { label: "Galerias Vistas", value: "8.392", sub: "visualizações", icon: Eye },
                { label: "Tempo Médio", value: "4m 12s", sub: "por galeria", icon: Zap },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="group relative bg-[#FBFAF6] px-7 py-8 transition-all hover:bg-[#F2EEE5]"
                  data-testid={`luxe-stat-${stat.label}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div
                        className="text-[10px] uppercase tracking-[0.25em]"
                        style={{ color: "#8A8174" }}
                      >
                        {stat.label}
                      </div>
                      <div
                        className="mt-3 text-[40px] leading-none tabular-nums"
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontWeight: 400,
                        }}
                      >
                        {stat.value}
                      </div>
                      <div className="mt-2 text-[11px]" style={{ color: "#6B6358" }}>
                        {stat.sub}
                      </div>
                    </div>
                    <stat.icon
                      className="h-4 w-4 opacity-40 transition-opacity group-hover:opacity-100"
                      strokeWidth={1.5}
                      style={{ color: "#C9A961" }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Featured project */}
            <div className="mb-20">
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <div
                    className="text-[10px] uppercase tracking-[0.4em]"
                    style={{ color: "#8A8174" }}
                  >
                    Em destaque
                  </div>
                  <h2
                    className="mt-2 text-3xl"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 500,
                    }}
                  >
                    Projeto da semana
                  </h2>
                </div>
                <button
                  className="flex items-center gap-1 text-[11px] uppercase tracking-[0.25em]"
                  style={{ color: "#1A1A1A" }}
                >
                  Ver todos
                  <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
                </button>
              </div>

              <div
                className="relative h-[460px] overflow-hidden rounded-3xl"
                style={{ backgroundColor: "#1A1A1A" }}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${projects[0].cover})`,
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.85) 100%)",
                  }}
                />

                <div className="relative flex h-full flex-col justify-between p-10 lg:p-14">
                  <div className="flex justify-between">
                    <span
                      className="rounded-full border px-4 py-1.5 text-[10px] uppercase tracking-[0.3em] backdrop-blur-md"
                      style={{
                        borderColor: "rgba(247,244,238,0.3)",
                        color: "#F7F4EE",
                      }}
                    >
                      Em revisão
                    </span>
                    <button
                      className="flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md"
                      style={{
                        backgroundColor: "rgba(247,244,238,0.15)",
                        border: "1px solid rgba(247,244,238,0.2)",
                      }}
                    >
                      <MoreHorizontal className="h-4 w-4" style={{ color: "#F7F4EE" }} />
                    </button>
                  </div>

                  <div>
                    <div
                      className="text-[11px] uppercase tracking-[0.35em]"
                      style={{ color: "rgba(247,244,238,0.7)" }}
                    >
                      Família Marchetti · 12 Abril
                    </div>
                    <h3
                      className="mt-3 text-5xl leading-tight md:text-6xl"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 400,
                        color: "#F7F4EE",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Casamento <em style={{ fontWeight: 500 }}>Helena & Théo</em>
                    </h3>

                    <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
                      <div className="flex gap-10">
                        {[
                          { label: "Fotos", value: "842" },
                          { label: "Selecionadas", value: "64" },
                          { label: "Visualizações", value: "1.2k" },
                        ].map((m) => (
                          <div key={m.label}>
                            <div
                              className="text-[9px] uppercase tracking-[0.3em]"
                              style={{ color: "rgba(247,244,238,0.6)" }}
                            >
                              {m.label}
                            </div>
                            <div
                              className="mt-1 text-3xl tabular-nums"
                              style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: 400,
                                color: "#F7F4EE",
                              }}
                            >
                              {m.value}
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        className="flex items-center gap-2 rounded-full px-6 py-3 text-[12px] font-medium"
                        style={{ backgroundColor: "#F7F4EE", color: "#1A1A1A" }}
                      >
                        Abrir galeria
                        <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project grid + activity */}
            <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
              <div>
                <div className="mb-8 flex items-end justify-between">
                  <div>
                    <div
                      className="text-[10px] uppercase tracking-[0.4em]"
                      style={{ color: "#8A8174" }}
                    >
                      Coleção
                    </div>
                    <h2
                      className="mt-2 text-3xl"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 500,
                      }}
                    >
                      Projetos recentes
                    </h2>
                  </div>
                  <div className="hidden items-center gap-1 rounded-full border p-1 sm:flex" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
                    {["Todos", "Em revisão", "Finalizados"].map((tab, i) => (
                      <button
                        key={tab}
                        className="rounded-full px-4 py-1.5 text-[11px] tracking-wide transition-all"
                        style={{
                          backgroundColor: i === 0 ? "#1A1A1A" : "transparent",
                          color: i === 0 ? "#F7F4EE" : "#5A5247",
                        }}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  {projects.slice(1).map((p) => (
                    <article
                      key={p.id}
                      className="group cursor-pointer"
                      data-testid={`luxe-card-${p.id}`}
                    >
                      <div className="relative mb-5 aspect-[4/5] overflow-hidden rounded-2xl bg-[#1A1A1A]">
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                          style={{ backgroundImage: `url(${p.cover})` }}
                        />
                        <div
                          className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                          style={{
                            background:
                              "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.6) 100%)",
                          }}
                        />

                        {/* status pill */}
                        <div className="absolute left-4 top-4">
                          <span
                            className="rounded-full px-3 py-1 text-[9px] uppercase tracking-[0.25em] backdrop-blur-md"
                            style={{
                              backgroundColor: "rgba(247,244,238,0.9)",
                              color: "#1A1A1A",
                            }}
                          >
                            {p.status}
                          </span>
                        </div>

                        {/* number */}
                        <div className="absolute right-4 top-4">
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-md"
                            style={{
                              backgroundColor: "rgba(26,26,26,0.4)",
                              border: "1px solid rgba(247,244,238,0.2)",
                            }}
                          >
                            <span
                              className="text-lg tabular-nums"
                              style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                color: "#F7F4EE",
                              }}
                            >
                              {String(p.id).padStart(2, "0")}
                            </span>
                          </div>
                        </div>

                        {/* progress bar bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-black/20">
                          <div
                            className="h-full transition-all"
                            style={{
                              width: `${p.progress}%`,
                              backgroundColor: p.accent,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div
                            className="text-[10px] uppercase tracking-[0.3em]"
                            style={{ color: "#8A8174" }}
                          >
                            {p.client} · {p.date}
                          </div>
                          <h3
                            className="mt-2 text-[22px] leading-tight transition-colors group-hover:text-[#5A5247]"
                            style={{
                              fontFamily: "'Cormorant Garamond', serif",
                              fontWeight: 500,
                              letterSpacing: "-0.01em",
                            }}
                          >
                            {p.title}
                          </h3>
                          <div className="mt-3 flex items-center gap-4 text-[11px]" style={{ color: "#6B6358" }}>
                            <span className="tabular-nums">{p.photos} fotos</span>
                            <span className="h-[3px] w-[3px] rounded-full" style={{ backgroundColor: "#C9A961" }} />
                            <span className="tabular-nums">{p.selected} selecionadas</span>
                          </div>
                        </div>

                        <div
                          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border transition-all group-hover:bg-[#1A1A1A] group-hover:text-[#F7F4EE]"
                          style={{ borderColor: "rgba(26,26,26,0.15)", color: "#1A1A1A" }}
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.8} />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* Right column: activity + quick actions */}
              <aside className="space-y-10">
                {/* Activity */}
                <div>
                  <div
                    className="mb-6 text-[10px] uppercase tracking-[0.4em]"
                    style={{ color: "#8A8174" }}
                  >
                    Atividade
                  </div>
                  <div className="space-y-5">
                    {activity.map((item, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="relative flex flex-col items-center pt-1.5">
                          <div
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          {i < activity.length - 1 && (
                            <div
                              className="mt-2 w-px flex-1"
                              style={{ backgroundColor: "rgba(26,26,26,0.08)", minHeight: "32px" }}
                            />
                          )}
                        </div>
                        <div className="flex-1 pb-2">
                          <p className="text-[13px] leading-snug" style={{ color: "#1A1A1A" }}>
                            <span style={{ fontWeight: 500 }}>{item.who}</span>{" "}
                            <span style={{ color: "#5A5247" }}>{item.what}</span>
                          </p>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.2em]" style={{ color: "#8A8174" }}>
                            {item.when}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick actions / promo */}
                <div
                  className="relative overflow-hidden rounded-3xl p-8"
                  style={{ backgroundColor: "#1A1A1A", color: "#F7F4EE" }}
                >
                  <div
                    className="absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-30"
                    style={{
                      background:
                        "radial-gradient(circle, #C9A961 0%, transparent 70%)",
                    }}
                  />
                  <Sparkles className="h-4 w-4" style={{ color: "#C9A961" }} strokeWidth={1.5} />
                  <h3
                    className="mt-5 text-2xl leading-tight"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 500,
                    }}
                  >
                    Portfólio público
                  </h3>
                  <p
                    className="mt-2 text-[12px] leading-relaxed"
                    style={{ color: "rgba(247,244,238,0.65)" }}
                  >
                    Sua vitrine recebeu 248 visitas esta semana. 4 novos contatos.
                  </p>
                  <button
                    className="mt-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.25em]"
                    style={{ color: "#C9A961" }}
                  >
                    Editar portfólio
                    <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
                  </button>
                </div>

                {/* Tip */}
                <div
                  className="rounded-2xl border p-6"
                  style={{ borderColor: "rgba(26,26,26,0.08)", backgroundColor: "#FBFAF6" }}
                >
                  <div
                    className="text-[9px] uppercase tracking-[0.3em]"
                    style={{ color: "#C9A961" }}
                  >
                    Dica do Atelier
                  </div>
                  <p
                    className="mt-3 text-[14px] leading-relaxed"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: "italic",
                      color: "#3A3A3A",
                    }}
                  >
                    "A entrega rápida é o novo luxo. Galerias enviadas em até 7 dias têm 3× mais aprovações imediatas."
                  </p>
                </div>
              </aside>
            </div>

            {/* Footer signature */}
            <div
              className="mt-24 flex items-center justify-between border-t pt-8 text-[10px] uppercase tracking-[0.3em]"
              style={{ borderColor: "rgba(26,26,26,0.08)", color: "#8A8174" }}
            >
              <span>Fottufy Atelier · Edição 2026</span>
              <div className="flex items-center gap-2">
                <Camera className="h-3 w-3" strokeWidth={1.5} />
                <span>Crafted with intention</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
