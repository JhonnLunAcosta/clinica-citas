import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import AtenderConsulta from "./AtenderConsulta";
import Historia from "./Historia";
import Panel from "./Panel";
import Usuarios from "./Usuarios";
import Modal from "./Modal";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const badge = (estado) => {
  if (estado === "CONFIRMADA") return "badge badge-green";
  if (estado === "CANCELADA") return "badge badge-red";
  if (estado === "COMPLETADA") return "badge badge-slate";
  return "badge badge-amber";
};

const BASE_ESPECIALIDADES = [
  "Medicina General", "Pediatria", "Otorrinolaringologia", "Cardiologia",
  "Dermatologia", "Ginecologia", "Ortopedia", "Oftalmologia", "Neurologia", "Psicologia",
];

const SLOTS = [];
for (let h = 7; h < 19; h++) {
  for (const m of [0, 20, 40]) {
    SLOTS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
}

const ICONS = {
  panel: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 20V10M10 20V4M16 20v-8M22 20H2" /></svg>,
  citas: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></svg>,
  agendar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></svg>,
  medicos: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 3h6v6l3 3v9H6v-9l3-3V3z" /><path d="M12 13v5M9.5 15.5h5" /></svg>,
  pacientes: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20c0-3-2.5-5-5.5-5.4" /></svg>,
  atender: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l2.5-6 4 12 2.5-6H21" /></svg>,
  historia: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 3h9l4 4v14H6V3z" /><path d="M9 12h7M9 16h7M9 8h3" /></svg>,
  usuarios: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.5-6.5 8-6.5s8 2.5 8 6.5" /></svg>,
};

const TITULOS = {
  panel: ["Panel", "Indicadores de la clínica"],
  citas: ["Citas", "Agenda del día y estados"],
  agendar: ["Agendar cita", "Asignación automática por especialidad"],
  medicos: ["Médicos", "Directorio de profesionales"],
  pacientes: ["Pacientes", "Registro y datos clínicos básicos"],
  atender: ["Atender consulta", "Acto médico con CIE-10 y fórmula"],
  historia: ["Historia clínica", "Documento clínico por paciente"],
  usuarios: ["Usuarios", "Cuentas y roles (solo ADMIN)"],
};

const rolBadge = (rol) => {
  if (rol === "ADMIN") return "badge badge-violet";
  if (rol === "MEDICO") return "badge badge-teal";
  return "badge badge-slate";
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("panel");
  const [citas, setCitas] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [epsList, setEpsList] = useState([]);
  const [aviso, setAviso] = useState(null);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ pacienteId: "", especialidad: "Pediatria", fecha: "", hora: "08:00", motivo: "", modalidad: "PRESENCIAL" });
  const [np, setNp] = useState({ nombre: "", email: "", telefono: "", documento: "", eps: "", alergias: "" });
  const [nm, setNm] = useState({ nombre: "", especialidad: "", email: "" });
  const [created, setCreated] = useState(null);
  const [formError, setFormError] = useState("");
  const [editM, setEditM] = useState(null);
  const [editP, setEditP] = useState(null);
  const [qPac, setQPac] = useState("");
  const [qAgen, setQAgen] = useState("");

  const canClinico = user?.rol === "ADMIN" || user?.rol === "MEDICO";
  const esAdmin = user?.rol === "ADMIN";
  const tabs = ["panel", "citas", "agendar", "medicos", "pacientes", ...(canClinico ? ["atender", "historia"] : []), ...(esAdmin ? ["usuarios"] : [])];

  const pacientesFiltrados = pacientes.filter((p) =>
    `${p.nombre} ${p.email}`.toLowerCase().includes(qPac.toLowerCase())
  );
  const pacientesAgendar = pacientes.filter((p) =>
    `${p.nombre} ${p.email}`.toLowerCase().includes(qAgen.toLowerCase())
  );

  const especialidades = [...new Set([...BASE_ESPECIALIDADES, ...medicos.map((m) => m.especialidad).filter(Boolean)])].sort();
  const hayMedico = (esp) => medicos.some((m) => m.especialidad?.toLowerCase() === esp?.toLowerCase());

  const load = async () => {
    setMsg("");
    try {
      const [c, m, p, e] = await Promise.all([
        api.get("/api/citas"),
        api.get("/api/medicos"),
        api.get("/api/pacientes"),
        api.get("/api/catalogo/eps"),
      ]);
      setCitas(c.data);
      setMedicos(m.data);
      setPacientes(p.data);
      setEpsList(e.data);
      if (p.data[0] && !form.pacienteId) setForm((f) => ({ ...f, pacienteId: p.data[0].id }));
    } catch (e) {
      setMsg(e.response?.data?.error || "Error cargando datos. ¿Backend en :8080 con token?");
    }
  };

  useEffect(() => { load(); }, []);

  const crearAutomatica = async (e) => {
    e.preventDefault();
    setMsg("");
    setFormError("");
    if (!form.fecha) {
      setFormError("Elige la fecha de la cita.");
      return;
    }
    const dow = new Date(form.fecha + "T12:00:00").getDay();
    if (dow === 0) {
      setFormError("No se agenda los domingos. Elige Lun–Sáb.");
      return;
    }
    if (!hayMedico(form.especialidad)) {
      setFormError(`No hay médicos registrados con "${form.especialidad}". Pide a un ADMIN que lo cree en la pestaña Médicos.`);
      return;
    }
    try {
      const { data } = await api.post("/api/citas/automatica", {
        pacienteId: Number(form.pacienteId),
        especialidad: form.especialidad,
        fechaHora: `${form.fecha}T${form.hora}:00`,
        motivo: form.motivo,
        modalidad: form.modalidad,
      });
      setCreated(data);
      load();
    } catch (e) {
      setFormError(e.response?.data?.error || JSON.stringify(e.response?.data) || "No se pudo agendar");
    }
  };

  const cambiarEstado = async (id, estado) => {
    try {
      await api.patch(`/api/citas/${id}/estado`, { estado });
      load();
    } catch (e) {
      setMsg(e.response?.data?.error || "Error cambiando estado");
    }
  };

  const crearPaciente = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!EMAIL_RE.test(np.email)) {
      setAviso({ tipo: "error", titulo: "Email inválido", mensaje: `“${np.email}” no es un correo válido. Revísalo antes de guardar.` });
      return;
    }
    try {
      const { data } = await api.post("/api/pacientes", np);
      setNp({ nombre: "", email: "", telefono: "", documento: "", eps: "", alergias: "" });
      setAviso({ tipo: "exito", titulo: "Paciente registrado", mensaje: `${data.nombre} quedó registrado con éxito. Ya puedes elegirlo en Agendar.` });
      await load();
      setForm((f) => ({ ...f, pacienteId: data.id }));
    } catch (e) {
      const detalle = e.response?.data?.error || e.response?.data?.email || JSON.stringify(e.response?.data);
      setAviso({ tipo: "error", titulo: "No se pudo registrar", mensaje: detalle || "Revisa los datos e intenta de nuevo." });
    }
  };

  const crearMedico = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await api.post("/api/medicos", nm);
      setNm({ nombre: "", especialidad: "", email: "" });
      setAviso({ tipo: "exito", titulo: "Médico creado", mensaje: "El profesional quedó registrado." });
      load();
    } catch (e) {
      setAviso({ tipo: "error", titulo: "No se pudo crear", mensaje: e.response?.data?.error || "Solo ADMIN puede crear médicos." });
    }
  };

  const guardarMedico = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/medicos/${editM.id}`, { nombre: editM.nombre, especialidad: editM.especialidad, email: editM.email });
      setEditM(null);
      setAviso({ tipo: "exito", titulo: "Médico actualizado", mensaje: "Los datos se guardaron con éxito." });
      load();
    } catch (e) {
      setAviso({ tipo: "error", titulo: "No se pudo actualizar", mensaje: e.response?.data?.error || "Revisa los datos." });
    }
  };

  const guardarPaciente = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(editP.email)) {
      setAviso({ tipo: "error", titulo: "Email inválido", mensaje: `“${editP.email}” no es un correo válido. Revísalo antes de guardar.` });
      return;
    }
    try {
      await api.put(`/api/pacientes/${editP.id}`, { nombre: editP.nombre, email: editP.email, telefono: editP.telefono, documento: editP.documento, eps: editP.eps, alergias: editP.alergias });
      setEditP(null);
      setAviso({ tipo: "exito", titulo: "Paciente actualizado", mensaje: "Los datos se guardaron con éxito." });
      load();
    } catch (e) {
      const detalle = e.response?.data?.error || e.response?.data?.email || JSON.stringify(e.response?.data);
      setAviso({ tipo: "error", titulo: "No se pudo actualizar", mensaje: detalle || "Revisa los datos e intenta de nuevo." });
    }
  };

  const pendientes = citas.filter((c) => c.estado === "PENDIENTE").length;
  const tele = citas.filter((c) => c.modalidad === "TELECONSULTA").length;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col p-5 text-white sticky top-0 h-screen"
        style={{ background: "linear-gradient(180deg,#081c33 0%,#0a2c46 60%,#0c4a56 100%)" }}>
        <div className="flex items-center gap-2.5 px-1">
          <div className="flex items-center justify-center rounded-xl" style={{ width: 38, height: 38, background: "linear-gradient(135deg,#14b8a6,#0e7c86)" }}>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l2.5-6 4 12 2.5-6H21" /></svg>
          </div>
          <div>
            <p className="font-bold tracking-tight leading-none">Vitalis</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-teal-300 mt-0.5">Sistema médico</p>
          </div>
        </div>

        <nav className="mt-7 space-y-1 flex-1">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`navlink ${tab === t ? "active" : ""}`}>
              {ICONS[t]}
              <span className="capitalize">{t === "agendar" ? "Agendar" : t === "atender" ? "Atender" : t}</span>
              {t === "citas" && pendientes > 0 && (
                <span className="ml-auto text-[11px] font-bold bg-amber-400 text-amber-950 rounded-full px-2 py-0.5">{pendientes}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-sm font-semibold truncate">{user?.username}</p>
          <p className="mt-1"><span className={rolBadge(user?.rol)}>{user?.rol}</span></p>
          <button onClick={logout} className="mt-2.5 w-full text-xs font-medium rounded-lg border border-white/15 py-1.5 hover:bg-white/10 transition">
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/85 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center gap-3">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight truncate">{TITULOS[tab][0]}</h1>
              <p className="text-xs section-sub truncate">{TITULOS[tab][1]}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden sm:inline-flex badge badge-teal">{citas.length} citas</span>
              {tele > 0 && <span className="hidden sm:inline-flex badge badge-violet">{tele} virtual</span>}
              <span className="lg:hidden"><span className={rolBadge(user?.rol)}>{user?.rol}</span></span>
              <button onClick={logout} className="lg:hidden btn-ghost !py-1.5">Salir</button>
            </div>
          </div>
          <nav className="lg:hidden max-w-6xl mx-auto px-4 pb-2.5 flex gap-1.5 overflow-x-auto chip-slot">
            {tabs.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`shrink-0 text-xs capitalize px-3.5 py-1.5 rounded-full border transition ${tab === t ? "text-white border-transparent" : "bg-white text-slate-600 border-slate-200"}`}
                style={tab === t ? { background: "linear-gradient(135deg,#0e7c86,#0aa08f)" } : undefined}>
                {t}
              </button>
            ))}
          </nav>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 fade-up" key={tab}>
          {msg && <p className="mb-4 text-sm card card-pad !py-3 text-slate-700 border-l-4 !border-l-amber-400">{msg}</p>}

          {tab === "panel" && <Panel rol={user?.rol} citas={citas} medicos={medicos} />}
          {tab === "agendar" && (
            <form onSubmit={crearAutomatica} className="card card-pad max-w-xl space-y-4">
              <div>
                <h2 className="section-title">Agendar cita automática</h2>
                <p className="section-sub">El sistema asigna el primer profesional libre de la especialidad.</p>
              </div>
              <div>
                <label className="lbl">Paciente</label>
                <input className="field mb-2" placeholder="Buscar por nombre o email…" value={qAgen} onChange={(e) => setQAgen(e.target.value)} />
                <select className="field" value={form.pacienteId} onChange={(e) => setForm({ ...form, pacienteId: e.target.value })} required>
                  <option value="">— Elige paciente —</option>
                  {pacientesAgendar.slice(0, 20).map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre} — {p.email}</option>
                  ))}
                </select>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="lbl">Especialidad</label>
                  <select className="field" value={form.especialidad} onChange={(e) => setForm({ ...form, especialidad: e.target.value })}>
                    {especialidades.map((esp) => (
                      <option key={esp} value={esp}>{esp}{hayMedico(esp) ? "" : " (sin médicos)"}</option>
                    ))}
                  </select>
                  {!hayMedico(form.especialidad) && (
                    <p className="mt-1 text-xs text-amber-600">Sin médicos registrados. Un ADMIN debe crearlo en Médicos.</p>
                  )}
                </div>
                <div>
                  <label className="lbl">Modalidad</label>
                  <select className="field" value={form.modalidad} onChange={(e) => setForm({ ...form, modalidad: e.target.value })}>
                    <option value="PRESENCIAL">Presencial</option>
                    <option value="TELECONSULTA">Teleconsulta (video)</option>
                  </select>
                  {form.modalidad === "TELECONSULTA" && (
                    <p className="mt-1 text-xs text-violet-600">Se generará un enlace de video automático.</p>
                  )}
                </div>
              </div>
              <div>
                <label className="lbl">Fecha (Lun–Sáb)</label>
                <input type="date" required min={new Date().toISOString().slice(0, 10)} className="field"
                  value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
              </div>
              <div>
                <label className="lbl">Turno · 20 min · {form.hora || "elige uno"}</label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-2 chip-slot">
                  {SLOTS.map((s) => (
                    <button type="button" key={s} onClick={() => setForm({ ...form, hora: s })}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border transition ${form.hora === s ? "text-white border-transparent" : "bg-white text-slate-600 border-slate-200 hover:border-teal-400"}`}
                      style={form.hora === s ? { background: "linear-gradient(135deg,#0e7c86,#0aa08f)" } : undefined}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="lbl">Motivo</label>
                <input className="field" value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} placeholder="Control" />
              </div>
              <button className="btn-primary">Agendar cita</button>
              {formError && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{formError}</p>
              )}
            </form>
          )}

          {tab === "citas" && (
            <div className="grid gap-3">
              {citas.map((c) => (
                <div key={c.id} className="card card-pad !p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{c.paciente?.nombre} <span className="text-slate-400 font-normal">→</span> {c.medico?.nombre}</p>
                    <p className="text-sm text-slate-500">{c.medico?.especialidad} · {c.fechaHora?.replace("T", " ")} · {c.motivo}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <span className={`badge ${c.modalidad === "TELECONSULTA" ? "badge-violet" : "badge-slate"}`}>
                        {c.modalidad === "TELECONSULTA" ? "Teleconsulta" : "Presencial"}
                      </span>
                      {(c.estado === "PENDIENTE" || c.estado === "CONFIRMADA") && new Date(c.fechaHora) < new Date() && (
                        <span className="badge badge-amber">Hora vencida: aún puedes atenderla</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={badge(c.estado)}>{c.estado}</span>
                    {c.modalidad === "TELECONSULTA" && c.linkTeleconsulta && (
                      <a href={c.linkTeleconsulta} target="_blank" rel="noreferrer"
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                        style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>Unirse al video</a>
                    )}
                    {c.estado === "PENDIENTE" && (
                      <>
                        <button onClick={() => cambiarEstado(c.id, "CONFIRMADA")} className="btn-primary !text-xs !px-3 !py-1.5">Confirmar</button>
                        <button onClick={() => cambiarEstado(c.id, "CANCELADA")} className="btn-ghost !text-xs">Cancelar</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {citas.length === 0 && <div className="card card-pad text-sm text-slate-500">Sin citas. Ve a Agendar.</div>}
            </div>
          )}

          {tab === "medicos" && (
            <div className="space-y-3">
              {user?.rol === "ADMIN" && (
                <form onSubmit={crearMedico} className="card card-pad grid sm:grid-cols-4 gap-2">
                  <input className="field" placeholder="Nombre" value={nm.nombre} onChange={(e) => setNm({ ...nm, nombre: e.target.value })} required />
                  <input className="field" placeholder="Especialidad" value={nm.especialidad} onChange={(e) => setNm({ ...nm, especialidad: e.target.value })} required />
                  <input className="field" placeholder="Email" value={nm.email} onChange={(e) => setNm({ ...nm, email: e.target.value })} />
                  <button className="btn-primary">+ Médico</button>
                </form>
              )}
              <div className="grid sm:grid-cols-2 gap-3">
                {medicos.map((m) => (
                  <div key={m.id} className="card card-pad !p-4">
                    {editM?.id === m.id ? (
                      <form onSubmit={guardarMedico} className="space-y-2">
                        <input className="field" value={editM.nombre} onChange={(e) => setEditM({ ...editM, nombre: e.target.value })} required />
                        <input className="field" value={editM.especialidad} onChange={(e) => setEditM({ ...editM, especialidad: e.target.value })} required />
                        <input className="field" value={editM.email || ""} onChange={(e) => setEditM({ ...editM, email: e.target.value })} />
                        <div className="flex gap-2">
                          <button className="btn-primary !text-xs">Guardar</button>
                          <button type="button" onClick={() => setEditM(null)} className="btn-ghost !text-xs">Cancelar</button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                            style={{ background: "linear-gradient(135deg,#0e7c86,#14b8a6)" }}>
                            {m.nombre?.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold truncate">{m.nombre}</p>
                            <p className="text-sm text-slate-500 truncate">{m.especialidad} · {m.email}</p>
                          </div>
                        </div>
                        {user?.rol === "ADMIN" && (
                          <button onClick={() => setEditM({ id: m.id, nombre: m.nombre, especialidad: m.especialidad, email: m.email || "" })} className="mt-2.5 btn-ghost !text-xs">
                            Editar
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "pacientes" && (
            <div className="space-y-3">
              <form onSubmit={crearPaciente} className="card card-pad">
                <h2 className="section-title">Nuevo paciente</h2>
                <div className="mt-3 grid sm:grid-cols-3 gap-2">
                  <input className="field" placeholder="Nombre completo" value={np.nombre} onChange={(e) => setNp({ ...np, nombre: e.target.value })} required />
                  <input className="field" placeholder="Email" value={np.email} onChange={(e) => setNp({ ...np, email: e.target.value })} required />
                  <input className="field" placeholder="Teléfono" value={np.telefono} onChange={(e) => setNp({ ...np, telefono: e.target.value })} />
                  <input className="field" placeholder="Documento" value={np.documento} onChange={(e) => setNp({ ...np, documento: e.target.value })} />
                  <select className="field bg-white" value={np.eps} onChange={(e) => setNp({ ...np, eps: e.target.value })}>
                    <option value="">— EPS —</option>
                    {epsList.map((x) => <option key={x.id} value={x.nombre}>{x.nombre}</option>)}
                  </select>
                  <input className="field" placeholder="Alergias (separadas por comas)" value={np.alergias} onChange={(e) => setNp({ ...np, alergias: e.target.value })} />
                </div>
                <button className="btn-primary mt-3">+ Registrar paciente</button>
              </form>
              <input className="field bg-white" placeholder="Buscar paciente por nombre o email…"
                value={qPac} onChange={(e) => setQPac(e.target.value)} />
              <div className="grid sm:grid-cols-2 gap-3">
                {(qPac ? pacientesFiltrados : []).map((p) => (
                  <div key={p.id} className="card card-pad !p-4">
                    {editP?.id === p.id ? (
                      <form onSubmit={guardarPaciente} className="space-y-2">
                        <input className="field" value={editP.nombre} onChange={(e) => setEditP({ ...editP, nombre: e.target.value })} required />
                        <input className="field" value={editP.email} onChange={(e) => setEditP({ ...editP, email: e.target.value })} required />
                        <input className="field" value={editP.telefono || ""} onChange={(e) => setEditP({ ...editP, telefono: e.target.value })} />
                        <input className="field" placeholder="Documento" value={editP.documento || ""} onChange={(e) => setEditP({ ...editP, documento: e.target.value })} />
                        <select className="field bg-white" value={editP.eps || ""} onChange={(e) => setEditP({ ...editP, eps: e.target.value })}>
                          <option value="">— EPS —</option>
                          {epsList.map((x) => <option key={x.id} value={x.nombre}>{x.nombre}</option>)}
                        </select>
                        <input className="field" placeholder="Alergias (separadas por comas)" value={editP.alergias || ""} onChange={(e) => setEditP({ ...editP, alergias: e.target.value })} />
                        <div className="flex gap-2">
                          <button className="btn-primary !text-xs">Guardar</button>
                          <button type="button" onClick={() => setEditP(null)} className="btn-ghost !text-xs">Cancelar</button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{p.nombre}</p>
                          <p className="text-sm text-slate-500 truncate">{p.email} · {p.telefono}</p>
                          {(p.documento || p.eps) && (
                            <p className="text-xs text-slate-400 truncate">{p.documento || "—"} · {p.eps || "sin EPS"}</p>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => setEditP({ id: p.id, nombre: p.nombre, email: p.email, telefono: p.telefono || "", documento: p.documento || "", eps: p.eps || "", alergias: p.alergias || "" })} className="btn-ghost !text-xs">
                            Editar
                          </button>
                          <button onClick={() => { setForm((f) => ({ ...f, pacienteId: p.id })); setTab("agendar"); }} className="btn-ghost !text-xs">
                            Agendar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {!qPac && <p className="text-sm text-slate-500">Escribe para buscar. No mostramos la lista completa por privacidad.</p>}
              {qPac && pacientesFiltrados.length === 0 && <p className="text-sm text-slate-500">Sin resultados. Puedes crearlo arriba.</p>}
            </div>
          )}

          {tab === "atender" && canClinico && <AtenderConsulta citas={citas} onDone={load} />}
          {tab === "historia" && canClinico && <Historia pacientes={pacientes} />}
          {tab === "usuarios" && esAdmin && <Usuarios aviso={aviso} setAviso={setAviso} />}
        </main>
      </div>

      {created && (
        <Modal tipo="exito" titulo="¡Cita creada con éxito!"
          mensaje={`${created.paciente?.nombre} → ${created.medico?.nombre}\n${created.medico?.especialidad} · ${created.fechaHora?.replace("T", " ")}${created.linkTeleconsulta ? `\nVideo: ${created.linkTeleconsulta}` : ""}`}
          textoBoton="Ver citas" onCerrar={() => { setCreated(null); setTab("citas"); }} />
      )}
      {aviso && (
        <Modal tipo={aviso.tipo} titulo={aviso.titulo} mensaje={aviso.mensaje} onCerrar={() => setAviso(null)} />
      )}
    </div>
  );
}
