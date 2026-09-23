import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const badge = (estado) => {
  const base = "text-xs px-2 py-1 rounded-full";
  if (estado === "CONFIRMADA") return `${base} bg-emerald-100 text-emerald-700`;
  if (estado === "CANCELADA") return `${base} bg-red-100 text-red-600`;
  if (estado === "COMPLETADA") return `${base} bg-slate-200 text-slate-600`;
  return `${base} bg-amber-100 text-amber-700`;
};

const BASE_ESPECIALIDADES = [
  "Medicina General",
  "Pediatria",
  "Otorrinolaringologia",
  "Cardiologia",
  "Dermatologia",
  "Ginecologia",
  "Ortopedia",
  "Oftalmologia",
  "Neurologia",
  "Psicologia",
];

const SLOTS = [];
for (let h = 7; h < 19; h++) {
  for (const m of [0, 20, 40]) {
    SLOTS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("citas");
  const [citas, setCitas] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ pacienteId: "", especialidad: "Pediatria", fecha: "", hora: "08:00", motivo: "" });
  const [np, setNp] = useState({ nombre: "", email: "", telefono: "" });
  const [nm, setNm] = useState({ nombre: "", especialidad: "", email: "" });
  const [created, setCreated] = useState(null);
  const [formError, setFormError] = useState("");
  const [editM, setEditM] = useState(null);
  const [editP, setEditP] = useState(null);
  const [qPac, setQPac] = useState("");
  const [qAgen, setQAgen] = useState("");

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
      const [c, m, p] = await Promise.all([
        api.get("/api/citas"),
        api.get("/api/medicos"),
        api.get("/api/pacientes"),
      ]);
      setCitas(c.data);
      setMedicos(m.data);
      setPacientes(p.data);
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
    try {
      const { data } = await api.post("/api/pacientes", np);
      setNp({ nombre: "", email: "", telefono: "" });
      setMsg(`Paciente ${data.nombre} creado. Ya puedes elegirlo en Agendar.`);
      await load();
      setForm((f) => ({ ...f, pacienteId: data.id }));
    } catch (e) {
      setMsg(e.response?.data?.error || JSON.stringify(e.response?.data) || "No se pudo crear paciente (¿email duplicado?)");
    }
  };

  const crearMedico = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await api.post("/api/medicos", nm);
      setNm({ nombre: "", especialidad: "", email: "" });
      setMsg("Médico creado");
      load();
    } catch (e) {
      setMsg(e.response?.data?.error || "No se pudo crear (solo ADMIN puede)");
    }
  };

  const guardarMedico = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/medicos/${editM.id}`, { nombre: editM.nombre, especialidad: editM.especialidad, email: editM.email });
      setEditM(null);
      setMsg("Médico actualizado");
      load();
    } catch (e) {
      setMsg(e.response?.data?.error || "No se pudo actualizar");
    }
  };

  const guardarPaciente = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/pacientes/${editP.id}`, { nombre: editP.nombre, email: editP.email, telefono: editP.telefono });
      setEditP(null);
      setMsg("Paciente actualizado");
      load();
    } catch (e) {
      setMsg(e.response?.data?.error || JSON.stringify(e.response?.data) || "No se pudo actualizar");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Clínica · Citas médicas</h1>
            <p className="text-xs text-slate-500">{user?.username} · {user?.rol}</p>
          </div>
          <button onClick={logout} className="text-sm rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-100">
            Salir
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          {["citas", "agendar", "medicos", "pacientes"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-sm capitalize px-4 py-2 rounded-full border transition ${
                tab === t ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {t === "agendar" ? "Agendar" : t}
            </button>
          ))}
        </div>

        {msg && <p className="mb-4 text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700">{msg}</p>}

        {tab === "agendar" && (
          <form onSubmit={crearAutomatica} className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg space-y-4">
            <h2 className="font-medium text-slate-800">Agendar cita automática</h2>
            <div>
              <label className="text-sm text-slate-600">Paciente</label>
              <input
                className="mt-1 mb-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                placeholder="Buscar por nombre o email…"
                value={qAgen}
                onChange={(e) => setQAgen(e.target.value)}
              />
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={form.pacienteId}
                onChange={(e) => setForm({ ...form, pacienteId: e.target.value })}
                required
              >
                <option value="">— Elige paciente —</option>
                {pacientesAgendar.slice(0, 20).map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre} — {p.email}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-600">Especialidad</label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={form.especialidad}
                onChange={(e) => setForm({ ...form, especialidad: e.target.value, })}
              >
                {especialidades.map((esp) => (
                  <option key={esp} value={esp}>{esp}{hayMedico(esp) ? "" : " (sin médicos)"}</option>
                ))}
              </select>
              {!hayMedico(form.especialidad) && (
                <p className="mt-1 text-xs text-amber-600">
                  Sin médicos registrados. Un ADMIN debe crearlo en Médicos.
                </p>
              )}
            </div>
            <div>
              <label className="text-sm text-slate-600">Fecha (Lun–Sáb)</label>
              <input
                type="date"
                required
                min={new Date().toISOString().slice(0, 10)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 bg-white"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-slate-600">Turno (20 min · {form.hora || "elige uno"})</label>
              <div className="mt-1 flex flex-wrap gap-1.5 max-h-28 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 p-2">
                {SLOTS.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setForm({ ...form, hora: s })}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition ${
                      form.hora === s ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-200 hover:border-teal-400"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">Motivo</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={form.motivo}
                onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                placeholder="Control"
              />
            </div>
            <button className="rounded-lg bg-teal-600 text-white px-4 py-2 hover:bg-teal-700">Agendar</button>
            {formError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>
            )}
          </form>
        )}

        {tab === "citas" && (
          <div className="grid gap-3">
            {citas.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-800">{c.paciente?.nombre} → {c.medico?.nombre}</p>
                  <p className="text-sm text-slate-500">{c.medico?.especialidad} · {c.fechaHora?.replace("T", " ")} · {c.motivo}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={badge(c.estado)}>{c.estado}</span>
                  {c.estado === "PENDIENTE" && (
                    <>
                      <button onClick={() => cambiarEstado(c.id, "CONFIRMADA")} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white">Confirmar</button>
                      <button onClick={() => cambiarEstado(c.id, "CANCELADA")} className="text-xs px-3 py-1.5 rounded-lg border border-slate-200">Cancelar</button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {citas.length === 0 && <p className="text-sm text-slate-500">Sin citas. Ve a Agendar.</p>}
          </div>
        )}

        {tab === "medicos" && (
          <div className="space-y-3">
            {user?.rol === "ADMIN" && (
              <form onSubmit={crearMedico} className="bg-white rounded-2xl border border-slate-200 p-4 grid sm:grid-cols-4 gap-2">
                <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Nombre" value={nm.nombre} onChange={(e) => setNm({ ...nm, nombre: e.target.value })} required />
                <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Especialidad" value={nm.especialidad} onChange={(e) => setNm({ ...nm, especialidad: e.target.value })} required />
                <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Email" value={nm.email} onChange={(e) => setNm({ ...nm, email: e.target.value })} />
                <button className="rounded-lg bg-teal-600 text-white px-3 py-2">+ Médico</button>
              </form>
            )}
            <div className="grid sm:grid-cols-2 gap-3">
              {medicos.map((m) => (
                <div key={m.id} className="bg-white rounded-2xl border border-slate-200 p-4">
                  {editM?.id === m.id ? (
                    <form onSubmit={guardarMedico} className="space-y-2">
                      <input className="w-full rounded-lg border border-slate-200 px-3 py-1.5" value={editM.nombre} onChange={(e) => setEditM({ ...editM, nombre: e.target.value })} required />
                      <input className="w-full rounded-lg border border-slate-200 px-3 py-1.5" value={editM.especialidad} onChange={(e) => setEditM({ ...editM, especialidad: e.target.value })} required />
                      <input className="w-full rounded-lg border border-slate-200 px-3 py-1.5" value={editM.email || ""} onChange={(e) => setEditM({ ...editM, email: e.target.value })} />
                      <div className="flex gap-2">
                        <button className="text-xs px-3 py-1.5 rounded-lg bg-teal-600 text-white">Guardar</button>
                        <button type="button" onClick={() => setEditM(null)} className="text-xs px-3 py-1.5 rounded-lg border border-slate-200">Cancelar</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p className="font-medium text-slate-800">{m.nombre}</p>
                      <p className="text-sm text-slate-500">{m.especialidad} · {m.email}</p>
                      {user?.rol === "ADMIN" && (
                        <button onClick={() => setEditM({ id: m.id, nombre: m.nombre, especialidad: m.especialidad, email: m.email || "" })} className="mt-2 text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100">
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
            <form onSubmit={crearPaciente} className="bg-white rounded-2xl border border-slate-200 p-4 grid sm:grid-cols-4 gap-2">
              <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Nombre completo" value={np.nombre} onChange={(e) => setNp({ ...np, nombre: e.target.value })} required />
              <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Email" value={np.email} onChange={(e) => setNp({ ...np, email: e.target.value })} required />
              <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Teléfono" value={np.telefono} onChange={(e) => setNp({ ...np, telefono: e.target.value })} />
              <button className="rounded-lg bg-teal-600 text-white px-3 py-2">+ Paciente</button>
            </form>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-white"
              placeholder="Buscar paciente por nombre o email (no se listan todos por privacidad)…"
              value={qPac}
              onChange={(e) => setQPac(e.target.value)}
            />
            <div className="grid sm:grid-cols-2 gap-3">
              {(qPac ? pacientesFiltrados : []).map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-4">
                  {editP?.id === p.id ? (
                    <form onSubmit={guardarPaciente} className="space-y-2">
                      <input className="w-full rounded-lg border border-slate-200 px-3 py-1.5" value={editP.nombre} onChange={(e) => setEditP({ ...editP, nombre: e.target.value })} required />
                      <input className="w-full rounded-lg border border-slate-200 px-3 py-1.5" value={editP.email} onChange={(e) => setEditP({ ...editP, email: e.target.value })} required />
                      <input className="w-full rounded-lg border border-slate-200 px-3 py-1.5" value={editP.telefono || ""} onChange={(e) => setEditP({ ...editP, telefono: e.target.value })} />
                      <div className="flex gap-2">
                        <button className="text-xs px-3 py-1.5 rounded-lg bg-teal-600 text-white">Guardar</button>
                        <button type="button" onClick={() => setEditP(null)} className="text-xs px-3 py-1.5 rounded-lg border border-slate-200">Cancelar</button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-800">{p.nombre}</p>
                        <p className="text-sm text-slate-500">{p.email} · {p.telefono}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setEditP({ id: p.id, nombre: p.nombre, email: p.email, telefono: p.telefono || "" })} className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100">
                          Editar
                        </button>
                        <button
                          onClick={() => { setForm((f) => ({ ...f, pacienteId: p.id })); setTab("agendar"); }}
                          className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100"
                        >
                          Agendar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {!qPac && <p className="text-sm text-slate-500">Escribe para buscar. No mostramos la lista completa por privacidad.</p>}
            {qPac && pacientesFiltrados.length === 0 && <p className="text-sm text-slate-500">Sin resultados. Puedes crearlo arriba con + Paciente.</p>}
          </div>
        )}
      </main>

      {created && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl shadow-lg max-w-sm w-full p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl">✓</div>
            <h2 className="mt-3 text-lg font-semibold text-slate-800">¡Cita creada con éxito!</h2>
            <p className="mt-1 text-sm text-slate-500">
              {created.paciente?.nombre} → {created.medico?.nombre}<br />
              {created.medico?.especialidad} · {created.fechaHora?.replace("T", " ")}
            </p>
            <div className="mt-4 flex gap-2 justify-center">
              <button
                onClick={() => { setCreated(null); setTab("citas"); }}
                className="rounded-lg bg-teal-600 text-white px-4 py-2 text-sm hover:bg-teal-700"
              >
                Ver citas
              </button>
              <button
                onClick={() => setCreated(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-100"
              >
                Agendar otra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
