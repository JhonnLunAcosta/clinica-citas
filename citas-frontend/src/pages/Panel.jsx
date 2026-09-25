import { useCallback, useEffect, useState } from "react";
import api from "../api/client";

const TEAL = "#0e7c86";
const TEAL_LT = "#14b8a6";
const NAVY = "#0a2540";
const AMBER = "#d97706";
const RED = "#dc2626";
const VIOLET = "#7c3aed";

function Kpi({ titulo, valor, sub, color = TEAL }) {
  return (
    <div className="card card-pad !p-4 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: color }} />
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{titulo}</p>
      <p className="mt-1 text-3xl font-extrabold tracking-tight" style={{ color: NAVY }}>{valor ?? "—"}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function Titulo({ t, s }) {
  return (
    <div className="mb-3">
      <h3 className="section-title">{t}</h3>
      {s && <p className="section-sub">{s}</p>}
    </div>
  );
}

function BarrasDias({ datos, onDia }) {
  const W = 640, H = 220, PAD = 34;
  const max = Math.max(1, ...datos.map((d) => d.total));
  const n = Math.max(datos.length, 1);
  const gw = (W - PAD * 2) / n;
  const bw = Math.min(22, gw * 0.32);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0.25, 0.5, 0.75, 1].map((f) => {
        const y = H - PAD - (H - PAD * 2) * f;
        return <g key={f}><line x1={PAD} y1={y} x2={W - 8} y2={y} stroke="#edf2f5" /><text x={4} y={y + 4} fontSize="10" fill="#9db0bc">{Math.round(max * f)}</text></g>;
      })}
      {datos.map((d, i) => {
        const x = PAD + i * gw + gw / 2;
        const hT = ((H - PAD * 2) * d.total) / max;
        const hC = ((H - PAD * 2) * d.completadas) / max;
        return (
          <g key={d.fecha} onClick={() => onDia && onDia(d.fecha)} style={{ cursor: onDia ? "pointer" : "default" }}>
            <rect x={x - bw - 2} y={H - PAD - hT} width={bw} height={Math.max(hT, 2)} rx="3" fill={TEAL_LT} opacity="0.85">
              <title>{d.fecha}: {d.total} citas (clic para ver)</title>
            </rect>
            <rect x={x + 2} y={H - PAD - hC} width={bw} height={Math.max(hC, 2)} rx="3" fill={NAVY}>
              <title>{d.fecha}: {d.completadas} atendidas</title>
            </rect>
            {i % 2 === 0 && <text x={x} y={H - 12} fontSize="10" fill="#7b93a5" textAnchor="middle">{d.fecha.slice(5)}</text>}
          </g>
        );
      })}
    </svg>
  );
}

function Dona({ partes, onParte }) {
  const total = partes.reduce((a, p) => a + p.valor, 0) || 1;
  const R = 62, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="flex items-center gap-5 flex-wrap">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={R} fill="none" stroke="#eef3f6" strokeWidth="20" />
        {partes.map((p) => {
          const frac = p.valor / total;
          const el = (
            <circle key={p.nombre} cx="80" cy="80" r={R} fill="none" stroke={p.color} strokeWidth="20"
              strokeDasharray={`${frac * C} ${C}`} strokeDashoffset={-acc * C} strokeLinecap="butt"
              transform="rotate(-90 80 80)" style={{ cursor: onParte ? "pointer" : "default" }}
              onClick={() => onParte && onParte(p)}>
              <title>{p.nombre}: {p.valor} (clic para ver)</title>
            </circle>
          );
          acc += frac;
          return el;
        })}
        <text x="80" y="76" textAnchor="middle" fontSize="24" fontWeight="800" fill={NAVY}>{total}</text>
        <text x="80" y="94" textAnchor="middle" fontSize="11" fill="#7b93a5">citas</text>
      </svg>
      <div className="space-y-1.5">
        {partes.map((p) => (
          <button key={p.nombre} onClick={() => onParte && onParte(p)} className="flex items-center gap-2 text-sm hover:opacity-75">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: p.color }} />
            <span className="text-slate-600">{p.nombre}</span>
            <b>{p.valor}</b>
          </button>
        ))}
      </div>
    </div>
  );
}

function BarrasH({ items, etiqueta, color = TEAL, onItem }) {
  const max = Math.max(1, ...items.map((x) => x.total));
  if (items.length === 0) return <p className="text-sm text-slate-400">Sin datos para estos filtros.</p>;
  return (
    <div className="space-y-2.5">
      {items.map((x, i) => (
        <button key={i} onClick={() => onItem && onItem(x)} className="w-full text-left group">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-slate-700 truncate group-hover:text-teal-700">{x[etiqueta]}</span>
            <b>{x.total}</b>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${(x.total / max) * 100}%`, background: `linear-gradient(90deg,${TEAL_LT},${color})` }} />
          </div>
        </button>
      ))}
    </div>
  );
}

const paramsFiltros = (f) => {
  const p = {};
  if (f.desde) p.desde = f.desde;
  if (f.hasta) p.hasta = f.hasta;
  if (f.medicoId) p.medicoId = f.medicoId;
  if (f.modalidad) p.modalidad = f.modalidad;
  return p;
};

export default function Panel({ rol, citas = [], medicos = [] }) {
  const clinico = rol === "ADMIN" || rol === "MEDICO";
  const [f, setF] = useState({ desde: "", hasta: "", medicoId: "", modalidad: "" });
  const [auto, setAuto] = useState(false);
  const [ultima, setUltima] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [dias, setDias] = useState([]);
  const [dx, setDx] = useState([]);
  const [med, setMed] = useState([]);
  const [sig, setSig] = useState(null);
  const [msg, setMsg] = useState("");
  const [detalle, setDetalle] = useState(null);

  const cargar = useCallback(async () => {
    try {
      const p = paramsFiltros(f);
      const [r, d] = await Promise.all([
        api.get("/api/stats/resumen", { params: p }),
        api.get("/api/stats/citas-por-dia", { params: { dias: 14, ...p } }),
      ]);
      setResumen(r.data);
      setDias(d.data);
      setMsg("");
      if (clinico) {
        const pc = { ...p };
        delete pc.modalidad;
        const [t, m, s] = await Promise.all([
          api.get("/api/stats/top-diagnosticos", { params: pc }),
          api.get("/api/stats/consultas-por-medico", { params: pc }),
          api.get("/api/stats/signos", { params: pc }),
        ]);
        setDx(t.data);
        setMed(m.data);
        setSig(s.data);
      }
      setUltima(new Date());
    } catch (e) {
      const status = e.response?.status || "sin conexión";
      setMsg(`No se pudo cargar (HTTP ${status}): ${e.response?.data?.error || "revisa el backend"}`);
    }
  }, [f, clinico]);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => { if (!document.hidden) cargar(); }, 30000);
    return () => clearInterval(t);
  }, [auto, cargar]);

  const enRango = (fechaHora) => {
    if (!fechaHora) return true;
    const d = fechaHora.slice(0, 10);
    if (f.desde && d < f.desde) return false;
    if (f.hasta && d > f.hasta) return false;
    return true;
  };

  const verEstado = (parte) => {
    const estado = parte.nombre.toUpperCase();
    const filas = citas.filter((c) => c.estado === estado && enRango(c.fechaHora));
    setDetalle({ titulo: `Citas ${parte.nombre} (${filas.length})`, tipo: "citas", filas });
  };

  const verDia = (fecha) => {
    const filas = citas.filter((c) => c.fechaHora?.slice(0, 10) === fecha);
    setDetalle({ titulo: `Citas del ${fecha} (${filas.length})`, tipo: "citas", filas });
  };

  const verDx = async (x) => {
    try {
      const { data } = await api.get("/api/stats/detalle-consultas", { params: { codigo: x.codigo, ...paramsFiltros({ ...f, modalidad: "" }) } });
      setDetalle({ titulo: `${x.codigo} · ${x.descripcion} (${data.length})`, tipo: "consultas", filas: data });
    } catch (e) {
      setMsg("No se pudo cargar el detalle");
    }
  };

  const verMedico = async (x) => {
    if (!x.medicoId) return;
    try {
      const { data } = await api.get("/api/stats/detalle-consultas", { params: { medicoId: x.medicoId, ...paramsFiltros({ ...f, modalidad: "" }) } });
      setDetalle({ titulo: `Consultas de ${x.medico} (${data.length})`, tipo: "consultas", filas: data });
    } catch (e) {
      setMsg("No se pudo cargar el detalle");
    }
  };

  const limpiar = () => { setF({ desde: "", hasta: "", medicoId: "", modalidad: "" }); setDetalle(null); };

  return (
    <div className="space-y-4">
      <div className="card card-pad !py-3.5 flex flex-wrap items-end gap-2.5">
        <div>
          <label className="lbl">Desde</label>
          <input type="date" className="field !w-auto" value={f.desde} onChange={(e) => setF({ ...f, desde: e.target.value })} />
        </div>
        <div>
          <label className="lbl">Hasta</label>
          <input type="date" className="field !w-auto" value={f.hasta} onChange={(e) => setF({ ...f, hasta: e.target.value })} />
        </div>
        <div>
          <label className="lbl">Médico</label>
          <select className="field !w-auto bg-white" value={f.medicoId} onChange={(e) => setF({ ...f, medicoId: e.target.value })}>
            <option value="">Todos</option>
            {medicos.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="lbl">Modalidad</label>
          <select className="field !w-auto bg-white" value={f.modalidad} onChange={(e) => setF({ ...f, modalidad: e.target.value })}>
            <option value="">Todas</option>
            <option value="PRESENCIAL">Presencial</option>
            <option value="TELECONSULTA">Teleconsulta</option>
          </select>
        </div>
        <button onClick={limpiar} className="btn-ghost">Limpiar</button>
        <button onClick={() => setAuto(!auto)} className={`btn-ghost ${auto ? "!border-teal-500 !text-teal-700" : ""}`} title="Recarga cada 30 segundos">
          <span className={`inline-block w-2 h-2 rounded-full ${auto ? "bg-teal-500" : "bg-slate-300"}`} />
          {auto ? "En vivo" : "Tiempo real"}
        </button>
        {ultima && <span className="text-[11px] text-slate-400 ml-auto">Actualizado {ultima.toLocaleTimeString()}</span>}
      </div>

      {!resumen ? (
        <div className="card card-pad text-sm">
          <p className="font-semibold">{msg ? "Panel no disponible" : "Cargando panel…"}</p>
          {msg && <><p className="text-slate-500 mt-1">{msg}</p><button onClick={cargar} className="btn-primary !text-xs mt-3">Reintentar</button></>}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Kpi titulo="Citas" valor={resumen.citas} sub={`${resumen.citasCompletada || 0} atendidas`} />
            <Kpi titulo="Consultas" valor={resumen.consultas} sub="actos médicos" color={TEAL_LT} />
            <Kpi titulo="Pacientes" valor={resumen.pacientes} sub="registrados" color={NAVY} />
            <Kpi titulo="Teleconsultas" valor={resumen.teleconsultas} sub="modalidad virtual" color={VIOLET} />
          </div>

          <div className="grid lg:grid-cols-5 gap-4">
            <div className="card card-pad lg:col-span-3">
              <Titulo t="Actividad de citas" s="Clic en una barra para ver el día" />
              <BarrasDias datos={dias} onDia={verDia} />
              <div className="mt-2 flex gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ background: TEAL_LT }} />Total</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ background: NAVY }} />Atendidas</span>
              </div>
            </div>
            <div className="card card-pad lg:col-span-2">
              <Titulo t="Estados" s="Clic para ver las citas" />
              <Dona onParte={verEstado} partes={[
                { nombre: "Pendiente", valor: resumen.citasPendiente || 0, color: AMBER },
                { nombre: "Confirmada", valor: resumen.citasConfirmada || 0, color: TEAL_LT },
                { nombre: "Completada", valor: resumen.citasCompletada || 0, color: TEAL },
                { nombre: "Cancelada", valor: resumen.citasCancelada || 0, color: RED },
              ]} />
            </div>
          </div>

          {detalle && (
            <div className="card overflow-hidden fade-up">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                <p className="text-sm font-semibold">{detalle.titulo}</p>
                <button onClick={() => setDetalle(null)} className="btn-ghost !text-xs">Cerrar</button>
              </div>
              <table className="tbl">
                <thead><tr>
                  <th>Fecha</th><th>Paciente</th><th>Médico</th>
                  <th>{detalle.tipo === "citas" ? "Estado" : "Diagnósticos"}</th>
                </tr></thead>
                <tbody>
                  {detalle.filas.map((x, i) => (
                    <tr key={i}>
                      <td className="whitespace-nowrap">{(x.fechaHora || x.fecha || "").replace("T", " ").slice(0, 16)}</td>
                      <td>{x.paciente?.nombre || x.paciente}</td>
                      <td>{x.medico?.nombre || x.medico}</td>
                      <td>{detalle.tipo === "citas" ? x.estado : (x.diagnosticos || []).join(" | ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {detalle.filas.length === 0 && <p className="p-4 text-sm text-slate-500">Sin registros.</p>}
            </div>
          )}

          {clinico ? (
            <>
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="card card-pad">
                  <Titulo t="Diagnósticos frecuentes" s="Clic para ver las consultas" />
                  <BarrasH onItem={verDx} items={dx.map((d) => ({ ...d, etiqueta: `${d.codigo} · ${d.descripcion}` }))} etiqueta="etiqueta" />
                </div>
                <div className="card card-pad">
                  <Titulo t="Consultas por médico" s="Clic para ver el detalle" />
                  <BarrasH onItem={verMedico} items={med} etiqueta="medico" color={NAVY} />
                </div>
              </div>
              <div className="card card-pad">
                <Titulo t="Signos vitales promedio" s={`Base: ${sig?.consultas || 0} consultas`} />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <Kpi titulo="TA sistólica" valor={sig?.taSistolicaProm} sub="mmHg" />
                  <Kpi titulo="FC" valor={sig?.fcProm} sub="lpm" color={TEAL_LT} />
                  <Kpi titulo="Temp" valor={sig?.tempProm} sub="°C" color={NAVY} />
                  <Kpi titulo="IMC" valor={sig?.imcProm} sub="promedio" color={AMBER} />
                  <Kpi titulo="TA alta" valor={sig?.taAlta} sub="casos" color={RED} />
                  <Kpi titulo="Fiebre" valor={sig?.fiebre} sub="casos ≥38°C" color={VIOLET} />
                </div>
              </div>
            </>
          ) : (
            <div className="card card-pad text-sm text-slate-500">
              El detalle clínico (diagnósticos, productividad y signos) es visible para MEDICO y ADMIN.
            </div>
          )}
        </>
      )}
    </div>
  );
}
