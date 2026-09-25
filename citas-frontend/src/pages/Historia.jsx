import { useState } from "react";
import api from "../api/client";

const secTitle = "text-xs font-semibold uppercase tracking-wide text-teal-700 mb-1";
const secBox = "rounded-xl border border-slate-200 bg-slate-50/60 p-3";
const label = "text-[11px] uppercase tracking-wide text-slate-400";

function edad(fechaNac) {
  if (!fechaNac) return "—";
  const n = new Date(fechaNac);
  const h = new Date();
  let e = h.getFullYear() - n.getFullYear();
  if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) e--;
  return `${e} años`;
}

function Signo({ t, v, alerta }) {
  return (
    <div className={`rounded-lg border px-2.5 py-2 ${alerta ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white"}`}>
      <p className={label}>{t}</p>
      <p className="text-sm font-semibold text-slate-800">{v ?? "—"}</p>
    </div>
  );
}

export default function Historia({ pacientes }) {
  const [q, setQ] = useState("");
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState("");

  const resultados = pacientes.filter((p) =>
    `${p.nombre} ${p.email} ${p.documento || ""}`.toLowerCase().includes(q.toLowerCase())
  );

  const ver = async (id) => {
    setMsg("");
    try {
      const { data } = await api.get(`/api/historia/${id}`);
      setData(data);
    } catch (e) {
      setMsg(e.response?.data?.error || "No se pudo cargar (solo MEDICO/ADMIN)");
    }
  };

  const p = data?.paciente;

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <input
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          placeholder="Buscar paciente por nombre, email o documento…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {q && (
          <div className="mt-2 grid sm:grid-cols-2 gap-2">
            {resultados.slice(0, 8).map((x) => (
              <button key={x.id} onClick={() => ver(x.id)} className="text-left rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
                <p className="font-medium text-slate-800">{x.nombre}</p>
                <p className="text-xs text-slate-500">{x.documento || "sin doc"} · {x.eps || "sin EPS"} · Alergias: {x.alergias || "—"}</p>
              </button>
            ))}
          </div>
        )}
      </div>
      {msg && <p className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-2">{msg}</p>}

      {data && p && (
        <div className="bg-white rounded-2xl border border-slate-300 overflow-hidden">
          <div className="bg-teal-800 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-teal-200">Historia clínica · Res. 1995/1999 – Ley 2015/2020</p>
              <h2 className="text-lg font-semibold">{p.nombre}</h2>
              <p className="text-xs text-teal-100">
                Doc {p.documento || "—"} · {edad(p.fechaNacimiento)} · {p.sexo || "—"} · RH {p.rh || "—"} · EPS {p.eps || "—"}
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-xs bg-white/15 rounded-full px-3 py-1">{data.totalConsultas} atenciones</span>
              <button onClick={() => window.print()} className="text-xs bg-white text-teal-800 rounded-full px-3 py-1 font-medium">Imprimir</button>
            </div>
          </div>

          {(p.alergias || p.contactoEmergencia) && (
            <div className="px-6 py-3 bg-red-50 border-b border-red-100 flex flex-wrap gap-4 text-sm">
              {p.alergias && <p><b className="text-red-700">Alergias:</b> {p.alergias}</p>}
              {p.contactoEmergencia && <p><b>Contacto emergencia:</b> {p.contactoEmergencia}</p>}
              <p className="text-slate-500">{p.telefono} · {p.email}</p>
            </div>
          )}

          <div className="px-6 py-4 space-y-5">
            {data.consultas?.map((c, idx) => (
              <article key={c.id} className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-700">
                    Atención #{data.totalConsultas - idx} · {c.fecha?.replace("T", " ").slice(0, 16)}
                  </p>
                  <div className="flex gap-2 text-xs">
                    <span className="bg-white border border-slate-200 rounded-full px-2.5 py-0.5">{c.medico?.nombre} · {c.medico?.especialidad}</span>
                    {c.cita?.modalidad === "TELECONSULTA" && (
                      <span className="bg-violet-100 text-violet-700 rounded-full px-2.5 py-0.5">Teleconsulta</span>
                    )}
                  </div>
                </div>
                <div className="p-4 grid gap-3">
                  <div className={secBox}>
                    <p className={secTitle}>Motivo de consulta</p>
                    <p className="text-sm text-slate-700">{c.motivo || "—"}</p>
                  </div>
                  <div className={secBox}>
                    <p className={secTitle}>Enfermedad actual</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.enfermedadActual || "—"}</p>
                  </div>
                  {(c.antecedentes || c.revisionSistemas) && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className={secBox}>
                        <p className={secTitle}>Antecedentes</p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.antecedentes || "—"}</p>
                      </div>
                      <div className={secBox}>
                        <p className={secTitle}>Revisión por sistemas</p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.revisionSistemas || "—"}</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className={secTitle}>Signos vitales</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <Signo t="TA mmHg" v={c.presionSistolica != null ? `${c.presionSistolica}/${c.presionDiastolica}` : null} alerta={(c.presionSistolica ?? 0) >= 140 || (c.presionDiastolica ?? 0) >= 90} />
                      <Signo t="FC lpm" v={c.frecuenciaCardiaca} />
                      <Signo t="Temp °C" v={c.temperatura} alerta={(c.temperatura ?? 0) >= 38} />
                      <Signo t="IMC" v={c.imc} alerta={(c.imc ?? 0) >= 30} />
                      <Signo t="Peso kg" v={c.pesoKg} />
                      <Signo t="Talla cm" v={c.tallaCm} />
                      <Signo t="FR rpm" v={c.frecuenciaRespiratoria} />
                      <Signo t="Atendido por" v={c.atendidoPor} />
                    </div>
                  </div>
                  <div className={secBox}>
                    <p className={secTitle}>Examen físico</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.examenFisico || "—"}</p>
                  </div>
                  <div>
                    <p className={secTitle}>Diagnósticos CIE-10</p>
                    <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                      <thead className="bg-slate-100 text-xs text-slate-500">
                        <tr><th className="text-left px-3 py-1.5">Código</th><th className="text-left px-3 py-1.5">Descripción</th><th className="text-left px-3 py-1.5">Tipo</th></tr>
                      </thead>
                      <tbody>
                        {c.diagnosticos?.map((d) => (
                          <tr key={d.id} className="border-t border-slate-100">
                            <td className="px-3 py-1.5 font-mono text-xs">{d.codigo}</td>
                            <td className="px-3 py-1.5">{d.descripcion}</td>
                            <td className="px-3 py-1.5 text-xs">{d.tipo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <p className={secTitle}>Fórmula médica</p>
                    {c.formulas?.length > 0 ? (
                      <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                        <thead className="bg-slate-100 text-xs text-slate-500">
                          <tr><th className="text-left px-3 py-1.5">Medicamento</th><th className="text-left px-3 py-1.5">Dosis</th><th className="text-left px-3 py-1.5">Frecuencia</th><th className="text-left px-3 py-1.5">Duración</th></tr>
                        </thead>
                        <tbody>
                          {c.formulas.map((f) => (
                            <tr key={f.id} className="border-t border-slate-100">
                              <td className="px-3 py-1.5 font-medium">{f.medicamento}</td>
                              <td className="px-3 py-1.5">{f.dosis || "—"}</td>
                              <td className="px-3 py-1.5">{f.frecuencia || "—"}</td>
                              <td className="px-3 py-1.5">{f.duracion || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : <p className="text-sm text-slate-400">Sin fórmula.</p>}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className={secBox}>
                      <p className={secTitle}>Plan</p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.plan || "—"}</p>
                      {c.proximaCita && <p className="text-xs text-teal-700 mt-1">Próximo control: {c.proximaCita}</p>}
                    </div>
                    <div className={secBox}>
                      <p className={secTitle}>Anexos ({c.adjuntos?.length || 0})</p>
                      {c.adjuntos?.length > 0 ? (
                        <ul className="space-y-1">
                          {c.adjuntos.map((a) => (
                            <li key={a.id}>
                              <a
                                className="text-sm text-teal-700 underline"
                                href={`http://localhost:8080/api/adjuntos/${a.id}/descargar`}
                                target="_blank" rel="noreferrer"
                              >
                                {a.nombreOriginal}
                              </a>
                              <span className="text-xs text-slate-400"> · {(a.tamano / 1024).toFixed(0)} KB</span>
                            </li>
                          ))}
                        </ul>
                      ) : <p className="text-sm text-slate-400">Sin anexos.</p>}
                    </div>
                  </div>
                  {c.alertas?.length > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                      <p className="text-xs font-semibold text-amber-700">Alertas del sistema (no reemplazan criterio médico):</p>
                      <ul className="list-disc ml-5 text-xs text-amber-700">{c.alertas.map((a, i) => <li key={i}>{a}</li>)}</ul>
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400">Firma: {c.atendidoPor || c.medico?.nombre} · {c.fecha?.replace("T", " ")}</p>
                </div>
              </article>
            ))}
            {data.totalConsultas === 0 && <p className="text-sm text-slate-500">Sin atenciones registradas.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
