import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ACCESOS = [
  { rol: "Administrador", username: "admin", password: "admin123", desc: "Gestión total del sistema" },
  { rol: "Recepción", username: "recepcion", password: "recepcion123", desc: "Agenda y pacientes" },
  { rol: "Médico", username: "medico", password: "medico123", desc: "Consulta y historia clínica" },
];

function LogoMark({ size = 44 }) {
  return (
    <div
      className="flex items-center justify-center rounded-2xl shadow-lg"
      style={{ width: size, height: size, background: "linear-gradient(135deg,#14b8a6,#0e7c86)", boxShadow: "0 12px 28px -10px rgba(20,184,166,.7)" }}
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h4l2.5-6 4 12 2.5-6H21" />
      </svg>
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [ver, setVer] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      await login(form.username, form.password);
      nav("/");
    } catch {
      setError("Usuario o contraseña incorrectos. Verifica e intenta de nuevo.");
      setShakeKey((k) => k + 1);
    } finally {
      setCargando(false);
    }
  };

  const accesoRapido = (a) => {
    setForm({ username: a.username, password: a.password });
    setError("");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Panel marca */}
      <div className="relative overflow-hidden lg:w-[46%] flex flex-col justify-between p-8 sm:p-12 text-white"
        style={{ background: "linear-gradient(150deg,#081c33 0%,#0a2f4a 45%,#0e7c86 100%)" }}>
        <div className="absolute inset-0 brand-grid" />
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle,rgba(20,184,166,.35),transparent 65%)" }} />
        <div className="absolute -left-20 bottom-10 w-80 h-80 rounded-full" style={{ background: "radial-gradient(circle,rgba(56,189,248,.22),transparent 65%)" }} />

        <div className="relative flex items-center gap-3">
          <LogoMark />
          <div>
            <p className="text-xl font-bold tracking-tight">Vitalis</p>
            <p className="text-[11px] uppercase tracking-[0.22em] text-teal-200">Sistema médico integral</p>
          </div>
        </div>

        <div className="relative my-10">
          <svg viewBox="0 0 320 90" className="w-full max-w-md opacity-90" fill="none">
            <path className="pulse-line" d="M0 45h70l14-28 22 56 16-40 12 12h60l14-24 20 48 16-32 10 8H320"
              stroke="#2dd4bf" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1 className="mt-6 text-3xl sm:text-[2.6rem] font-extrabold leading-tight tracking-tight">
            La clínica completa,<br />en una sola plataforma.
          </h1>
          <p className="mt-3 max-w-md text-sm sm:text-base text-slate-300">
            Citas, historia clínica bajo norma colombiana, teleconsulta y anexos. Diseñado para el ritmo real del consultorio.
          </p>
          <div className="mt-7 grid grid-cols-3 gap-3 max-w-md">
            {[["+1.2k", "citas gestionadas"], ["100%", "historia normativa"], ["24/7", "teleconsulta"]].map(([n, t]) => (
              <div key={t} className="rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 backdrop-blur-sm">
                <p className="text-lg font-bold text-teal-300">{n}</p>
                <p className="text-[11px] text-slate-300">{t}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-[11px] text-slate-400">Res. 1995/1999 · Ley 2015/2020 · Res. 2654/2019 telesalud</p>
      </div>

      {/* Panel acceso */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md fade-up">
          <div className="card card-pad">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-700">Bienvenido de nuevo</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight">Iniciar sesión</h2>
            <p className="text-sm section-sub mt-1">Accede según tu rol para continuar</p>

            <form onSubmit={submit} key={shakeKey} className={`mt-6 space-y-4 ${error ? "shake" : ""}`}>
              <div>
                <label className="lbl">Usuario</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.5-6.5 8-6.5s8 2.5 8 6.5" /></svg>
                  </span>
                  <input
                    className="field field-icon" placeholder="ej: medico" autoComplete="username"
                    value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required
                  />
                </div>
              </div>
              <div>
                <label className="lbl">Contraseña</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
                  </span>
                  <input
                    type={ver ? "text" : "password"} className="field field-icon field-icon-r" placeholder="••••••••" autoComplete="current-password"
                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required
                  />
                  <button type="button" onClick={() => setVer(!ver)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-teal-700 hover:text-teal-900 px-1">
                    {ver ? "Ocultar" : "Ver"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">!</span>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button className="btn-primary w-full !py-3" disabled={cargando}>
                {cargando && (
                  <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M12 3a9 9 0 1 0 9 9" /></svg>
                )}
                {cargando ? "Verificando…" : "Entrar a Vitalis"}
              </button>
            </form>

            <div className="mt-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Acceso rápido demo</p>
              <div className="mt-2 grid gap-2">
                {ACCESOS.map((a) => (
                  <button
                    key={a.username} type="button" onClick={() => accesoRapido(a)}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left transition ${
                      form.username === a.username ? "border-teal-500 bg-teal-50/70" : "border-slate-200 hover:border-teal-300 hover:bg-slate-50"
                    }`}
                  >
                    <span>
                      <span className="block text-sm font-semibold">{a.rol} <span className="font-mono text-xs text-slate-400">· {a.username}</span></span>
                      <span className="block text-xs text-slate-500">{a.desc}</span>
                    </span>
                    <span className="text-xs font-semibold text-teal-700">Usar →</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">Backend en localhost:8080 · Tus datos están protegidos</p>
        </div>
      </div>
    </div>
  );
}
