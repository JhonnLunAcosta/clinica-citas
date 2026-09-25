export default function Modal({ tipo = "exito", titulo, mensaje, onCerrar, textoBoton = "Entendido" }) {
  const esExito = tipo === "exito";
  return (
    <div className="fixed inset-0 bg-[#0a2540]/50 backdrop-blur-[2px] flex items-center justify-center px-4 z-50 fade-up">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-slate-100">
        <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg ${
          esExito
            ? "text-white"
            : "bg-gradient-to-br from-red-500 to-rose-600 text-white"
        }`}
          style={esExito ? { background: "linear-gradient(135deg,#14b8a6,#0e7c86)" } : undefined}>
          {esExito ? "✓" : "!"}
        </div>
        <h2 className="mt-4 text-lg font-bold tracking-tight text-slate-800">{titulo}</h2>
        <p className="mt-1.5 text-sm text-slate-500 whitespace-pre-wrap">{mensaje}</p>
        <button onClick={onCerrar} className={`${esExito ? "btn-primary" : "rounded-lg bg-red-600 text-white font-semibold text-sm px-4 py-2 hover:bg-red-700"} mt-5 w-full !py-2.5`}>
          {textoBoton}
        </button>
      </div>
    </div>
  );
}
