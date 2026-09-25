import { useEffect, useMemo, useState } from "react";
import api from "../api/client";

function VistaPrevia({ file, onVer }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  if (file.type.startsWith("image/")) {
    return (
      <button type="button" onClick={() => onVer(file, url)} title="Clic para ampliar">
        <img src={url} alt={file.name} className="h-16 w-16 object-cover rounded-lg border border-slate-200 hover:opacity-80" />
      </button>
    );
  }
  return <button type="button" onClick={() => onVer(file, url)} className="text-xs text-teal-700 underline">Vista previa</button>;
}

const input = "w-full rounded-lg border border-slate-200 px-3 py-2";
const drop = "absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-56 overflow-y-auto";

function useBuscador(url) {
  const [q, setQ] = useState("");
  const [res, setRes] = useState([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) { setRes([]); return; }
    const t = setTimeout(async () => {
      try {
        // Sin texto trae el catálogo completo para navegar; con texto filtra
        const params = q.trim().length < 2 ? { limit: 50 } : { q, limit: 10 };
        const { data } = await api.get(url, { params });
        setRes(data.content || data || []);
      } catch { setRes([]); }
    }, q.trim().length < 2 ? 0 : 300);
    return () => clearTimeout(t);
  }, [q, open, url]);
  return [q, setQ, res, setRes, open, setOpen];
}

export default function AtenderConsulta({ citas, onDone }) {
  const confirmadas = citas.filter((c) => c.estado === "CONFIRMADA");
  const [citaId, setCitaId] = useState("");
  const citaElegida = confirmadas.find((c) => String(c.id) === String(citaId));
  const vencida = citaElegida ? new Date(citaElegida.fechaHora) < new Date() : false;
  const [form, setForm] = useState({
    enfermedadActual: "", antecedentes: "", revisionSistemas: "",
    examenFisico: "", plan: "", proximaCita: "",
    presionSistolica: "", presionDiastolica: "", frecuenciaCardiaca: "",
    frecuenciaRespiratoria: "", temperatura: "", pesoKg: "", tallaCm: "",
  });
  const [diags, setDiags] = useState([]);
  const [formulas, setFormulas] = useState([]);
  const [msg, setMsg] = useState("");
  const [alertas, setAlertas] = useState([]);
  const [savedId, setSavedId] = useState(null);
  const [pendientes, setPendientes] = useState([]);
  const [subiendo, setSubiendo] = useState(false);
  const [qDx, setQDx, resDx, setResDx, openDx, setOpenDx] = useBuscador("/api/catalogo/diagnosticos");
  const [qMed, setQMed, resMed, setResMed, openMed, setOpenMed] = useBuscador("/api/catalogo/medicamentos");
  const [vista, setVista] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const addDx = (d) => {
    if (!diags.some((x) => x.codigo === d.codigo)) {
      setDiags([...diags, { codigo: d.codigo, descripcion: d.descripcion, tipo: "PRINCIPAL" }]);
    }
    setQDx(""); setResDx([]); setOpenDx(false);
  };

  const addMed = (m) => {
    setFormulas([...formulas, {
      medicamento: m.nombre, dosis: m.concentracion || "",
      frecuencia: "", duracion: "", observaciones: `${m.formaFarmaceutica || ""} ${m.viaAdministracion || ""}`.trim(),
    }]);
    setQMed(""); setResMed([]); setOpenMed(false);
  };

  const RANGOS = {
    presionSistolica: [50, 300, "TA sistólica"], presionDiastolica: [30, 200, "TA diastólica"],
    frecuenciaCardiaca: [20, 250, "FC"], frecuenciaRespiratoria: [5, 80, "FR"],
    temperatura: [30, 45, "temperatura"], pesoKg: [1, 500, "peso"], tallaCm: [20, 250, "talla"],
  };

  const validarAntes = () => {
    if (!citaId) return "Elige una cita CONFIRMADA.";
    if (diags.length === 0) return "Busca y elige al menos un diagnóstico CIE-10 del catálogo.";
    for (const [k, [min, max, nombre]] of Object.entries(RANGOS)) {
      const v = form[k];
      if (v !== "" && (Number(v) < min || Number(v) > max)) {
        return `${nombre} fuera de rango: ${v} (esperado ${min}-${max}).`;
      }
    }
    if (form.presionSistolica !== "" && form.presionDiastolica !== ""
        && Number(form.presionDiastolica) >= Number(form.presionSistolica)) {
      return "La presión diastólica debe ser menor que la sistólica.";
    }
    for (const f of formulas) {
      if (f.medicamento && (!f.dosis || !f.frecuencia)) {
        return `El medicamento ${f.medicamento} requiere dosis y frecuencia.`;
      }
    }
    return null;
  };

  const enviar = async (e) => {
    e.preventDefault();
    setMsg("");
    setAlertas([]);
    const problema = validarAntes();
    if (problema) { setMsg(problema); return; }
    const num = (v) => (v === "" ? undefined : Number(v));
    try {
      const { data } = await api.post("/api/consultas", {
        citaId: Number(citaId),
        enfermedadActual: form.enfermedadActual,
        antecedentes: form.antecedentes,
        revisionSistemas: form.revisionSistemas,
        examenFisico: form.examenFisico,
        plan: form.plan,
        proximaCita: form.proximaCita || undefined,
        presionSistolica: num(form.presionSistolica),
        presionDiastolica: num(form.presionDiastolica),
        frecuenciaCardiaca: num(form.frecuenciaCardiaca),
        frecuenciaRespiratoria: num(form.frecuenciaRespiratoria),
        temperatura: num(form.temperatura),
        pesoKg: num(form.pesoKg),
        tallaCm: num(form.tallaCm),
        diagnosticos: diags,
        formulas,
      });
      setAlertas(data.alertas || []);
      setSavedId(data.id);
      let resumen = `Consulta #${data.id} guardada. IMC: ${data.imc ?? "—"}. La cita pasó a COMPLETADA.`;
      if (pendientes.length > 0) {
        setSubiendo(true);
        setMsg("Consulta guardada. Subiendo anexos…");
        const total = pendientes.length;
        const ok = await subirArchivos(data.id, pendientes);
        setSubiendo(false);
        setPendientes([]);
        resumen += ` Anexos cargados: ${ok}/${total}. Ya visibles en Historia.`;
        if (ok < total) resumen += " (revisa tipo PDF/JPG/PNG y máx 10MB)";
      }
      setMsg(resumen);
      onDone && onDone();
    } catch (err) {
      setMsg(err.response?.data?.error || JSON.stringify(err.response?.data) || "No se pudo guardar");
    }
  };

  const subirArchivos = async (consultaId, archivos) => {
    let ok = 0;
    for (const f of archivos) {
      const ext = f.name.includes(".") ? f.name.split(".").pop().toLowerCase() : "";
      if (!["pdf", "jpg", "jpeg", "png"].includes(ext) || f.size > 10 * 1024 * 1024) continue;
      const fd = new FormData();
      fd.append("file", f);
      try {
        // Sin Content-Type manual: axios pone el boundary automáticamente
        await api.post(`/api/consultas/${consultaId}/adjuntos`, fd);
        ok++;
      } catch { /* se reporta en el resumen */ }
    }
    return ok;
  };

  return (
    <form onSubmit={enviar} className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl space-y-4">
      <h2 className="font-medium text-slate-800">Atender consulta (solo MEDICO/ADMIN)</h2>
      {confirmadas.length === 0 && (
        <p className="text-sm text-amber-600">No hay citas CONFIRMADA. Confirma una en la pestaña Citas primero.</p>
      )}
      <div>
        <label className="text-sm text-slate-600">Cita confirmada</label>
        <select className={input} value={citaId} onChange={(e) => setCitaId(e.target.value)} required>
          <option value="">— Elige —</option>
          {confirmadas.map((c) => {
            const v = new Date(c.fechaHora) < new Date();
            return (
              <option key={c.id} value={c.id}>
                #{c.id} {c.paciente?.nombre} → {c.medico?.nombre} · {c.fechaHora?.replace("T", " ")}{v ? " (hora vencida)" : ""}
              </option>
            );
          })}
        </select>
      </div>
      {citaElegida && vencida && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Esta cita ya pasó su hora ({citaElegida.fechaHora?.replace("T", " ")}). Igual puedes atenderla: quedará registrada con la hora real de atención.
        </p>
      )}
      {citaElegida && !vencida && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          Cita vigente ({citaElegida.fechaHora?.replace("T", " ")}). Todo en orden para atender.
        </p>
      )}
      <div className="grid sm:grid-cols-2 gap-3">
        <input type="number" min="50" max="300" className={input} placeholder="TA sistólica 50-300" value={form.presionSistolica} onChange={set("presionSistolica")} />
        <input type="number" min="30" max="200" className={input} placeholder="TA diastólica 30-200" value={form.presionDiastolica} onChange={set("presionDiastolica")} />
        <input type="number" min="20" max="250" className={input} placeholder="FC 20-250 lpm" value={form.frecuenciaCardiaca} onChange={set("frecuenciaCardiaca")} />
        <input type="number" min="30" max="45" step="0.1" className={input} placeholder="Temp 30-45 °C" value={form.temperatura} onChange={set("temperatura")} />
        <input type="number" min="1" max="500" step="0.1" className={input} placeholder="Peso 1-500 kg" value={form.pesoKg} onChange={set("pesoKg")} />
        <input type="number" min="20" max="250" step="0.1" className={input} placeholder="Talla 20-250 cm" value={form.tallaCm} onChange={set("tallaCm")} />
      </div>
      <textarea className={input} placeholder="Enfermedad actual" value={form.enfermedadActual} onChange={set("enfermedadActual")} />
      <textarea className={input} placeholder="Antecedentes (personales, familiares, quirúrgicos, alergias…)" value={form.antecedentes} onChange={set("antecedentes")} />
      <textarea className={input} placeholder="Revisión por sistemas" value={form.revisionSistemas} onChange={set("revisionSistemas")} />
      <textarea className={input} placeholder="Examen físico" value={form.examenFisico} onChange={set("examenFisico")} />

      <div className="relative">
        <p className="text-sm font-medium text-slate-700 mb-1">Diagnóstico CIE-10 · escribe para buscar o haz clic para ver el catálogo (BD)</p>
        <input className={input} placeholder="Clic para ver todos o escribe ej: J06, fiebre…" value={qDx} onChange={(e) => setQDx(e.target.value)} onFocus={() => setOpenDx(true)} onBlur={() => setTimeout(() => setOpenDx(false), 200)} />
        {openDx && (
          <p className="text-[11px] text-slate-400 mt-0.5">{resDx.length} opciones · escribe para filtrar</p>
        )}
        {openDx && resDx.length > 0 && (
          <div className={drop}>
            {resDx.map((d) => (
              <button type="button" key={d.id} onMouseDown={(e) => e.preventDefault()} onClick={() => addDx(d)} className="w-full text-left px-3 py-2 hover:bg-teal-50 border-b border-slate-100">
                <span className="font-mono text-xs bg-slate-100 rounded px-1.5 py-0.5 mr-2">{d.codigo}</span>
                <span className="text-sm">{d.descripcion}</span>
              </button>
            ))}
          </div>
        )}
        <div className="mt-2 space-y-1">
          {diags.map((d, i) => (
            <div key={i} className="flex items-center justify-between bg-teal-50 border border-teal-200 rounded-lg px-3 py-1.5">
              <span className="text-sm"><b className="font-mono">{d.codigo}</b> · {d.descripcion}</span>
              <button type="button" onClick={() => setDiags(diags.filter((_, j) => j !== i))} className="text-xs text-red-600">Quitar</button>
            </div>
          ))}
          {diags.length === 0 && <p className="text-xs text-slate-400">Sin diagnósticos. Busca arriba y elige.</p>}
        </div>
      </div>

      <div className="relative">
        <p className="text-sm font-medium text-slate-700 mb-1">Fórmula · escribe para buscar o haz clic para ver el catálogo (BD)</p>
        <input className={input} placeholder="Clic para ver todos o escribe ej: amoxi…" value={qMed} onChange={(e) => setQMed(e.target.value)} onFocus={() => setOpenMed(true)} onBlur={() => setTimeout(() => setOpenMed(false), 200)} />
        {openMed && resMed.length > 0 && (
          <div className={drop}>
            {resMed.map((m) => (
              <button type="button" key={m.id} onMouseDown={(e) => e.preventDefault()} onClick={() => addMed(m)} className="w-full text-left px-3 py-2 hover:bg-teal-50 border-b border-slate-100">
                <span className="text-sm font-medium">{m.nombre}</span>
                <span className="text-xs text-slate-500"> · {m.concentracion} · {m.formaFarmaceutica}</span>
              </button>
            ))}
          </div>
        )}
        <div className="mt-2 space-y-2">
          {formulas.map((f, i) => (
            <div key={i} className="rounded-lg border border-slate-200 p-2 grid grid-cols-4 gap-2">
              <input className={input} value={f.medicamento} onChange={(e) => setFormulas(formulas.map((x, j) => j === i ? { ...x, medicamento: e.target.value } : x))} />
              <input className={input} placeholder="Dosis" value={f.dosis || ""} onChange={(e) => setFormulas(formulas.map((x, j) => j === i ? { ...x, dosis: e.target.value } : x))} />
              <input className={input} placeholder="Frecuencia" value={f.frecuencia || ""} onChange={(e) => setFormulas(formulas.map((x, j) => j === i ? { ...x, frecuencia: e.target.value } : x))} />
              <div className="flex gap-1">
                <input className={input} placeholder="Duración" value={f.duracion || ""} onChange={(e) => setFormulas(formulas.map((x, j) => j === i ? { ...x, duracion: e.target.value } : x))} />
                <button type="button" onClick={() => setFormulas(formulas.filter((_, j) => j !== i))} className="text-xs text-red-600 px-1">✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <textarea className={input} placeholder="Plan y recomendaciones" value={form.plan} onChange={set("plan")} />
      <input type="date" className={input} value={form.proximaCita} onChange={set("proximaCita")} />
      <div className="rounded-lg border border-slate-200 p-3 space-y-2 bg-slate-50">
        <p className="text-sm font-medium text-slate-700">
          Anexos (PDF/JPG/PNG · máx 10MB){savedId ? ` · consulta #${savedId}` : " · se cargarán al guardar"}
        </p>
        <input
          id="anexos-input" type="file" multiple hidden accept=".pdf,.jpg,.jpeg,.png" className="text-sm"
          onChange={(e) => setPendientes([...pendientes, ...Array.from(e.target.files || [])])}
        />
        <label
          htmlFor="anexos-input"
          className="inline-block cursor-pointer rounded-lg bg-slate-800 text-white text-sm px-4 py-2 hover:bg-slate-700"
        >
          Elegir archivos
        </label>
        {pendientes.length > 0 && (
          <ul className="space-y-1">
            {pendientes.map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5">
                <VistaPrevia file={f} onVer={(file, url) => setVista({ file, url })} />
                <span className="flex-1">{f.name} <span className="text-xs text-slate-400">· {(f.size / 1024).toFixed(0)} KB</span></span>
                <button type="button" onClick={() => setPendientes(pendientes.filter((_, j) => j !== i))} className="text-xs text-red-600">Quitar</button>
              </li>
            ))}
          </ul>
        )}
        {subiendo && <p className="text-xs text-slate-500">Subiendo anexos…</p>}
      </div>
      <button className="rounded-lg bg-teal-600 text-white px-4 py-2">Guardar consulta</button>
      {msg && <p className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">{msg}</p>}
      {alertas.length > 0 && (
        <div className="text-sm bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <p className="font-medium text-amber-700">Alertas del sistema (reglas, no diagnóstico):</p>
          <ul className="list-disc ml-5 text-amber-700">{alertas.map((a, i) => <li key={i}>{a}</li>)}</ul>
        </div>
      )}
      {vista && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50" onClick={() => setVista(null)}>
          <div className="bg-white rounded-2xl shadow-lg max-w-3xl w-full p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-700 truncate">{vista.file.name}</p>
              <button type="button" onClick={() => setVista(null)} className="text-sm rounded-lg border border-slate-200 px-3 py-1 hover:bg-slate-100">Cerrar</button>
            </div>
            {vista.file.type.startsWith("image/") ? (
              <img src={vista.url} alt={vista.file.name} className="max-h-[70vh] mx-auto rounded-lg" />
            ) : (
              <div className="space-y-2">
                <iframe src={vista.url} title={vista.file.name} className="w-full h-[60vh] rounded-lg border border-slate-200" />
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-500">Si el PDF no se ve arriba (protegido o formato especial), descárgalo para verificarlo:</p>
                  <a href={vista.url} download={vista.file.name} className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-teal-600 text-white">Descargar</a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
