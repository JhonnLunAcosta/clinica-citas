import { useEffect, useState } from "react";
import api from "../api/client";
import Modal from "./Modal";

const ROLES = ["ADMIN", "USER", "MEDICO"];

export default function Usuarios({ aviso, setAviso }) {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState({ username: "", password: "", rol: "USER" });

  const cargar = async () => {
    try {
      const { data } = await api.get("/api/usuarios");
      setLista(data);
    } catch (e) {
      setAviso({ tipo: "error", titulo: "Sin acceso", mensaje: e.response?.data?.error || "Solo ADMIN puede gestionar usuarios." });
    }
  };

  useEffect(() => { cargar(); }, []);

  const crear = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setAviso({ tipo: "error", titulo: "Contraseña débil", mensaje: "Mínimo 6 caracteres." });
      return;
    }
    try {
      const { data } = await api.post("/api/usuarios", form);
      setForm({ username: "", password: "", rol: "USER" });
      setAviso({ tipo: "exito", titulo: "Usuario creado", mensaje: `${data.username} (${data.rol}) ya puede ingresar.` });
      cargar();
    } catch (e) {
      setAviso({ tipo: "error", titulo: "No se pudo crear", mensaje: e.response?.data?.error || "Revisa los datos." });
    }
  };

  const cambiar = async (u, patch) => {
    try {
      await api.patch(`/api/usuarios/${u.id}`, patch);
      cargar();
    } catch (e) {
      setAviso({ tipo: "error", titulo: "No se pudo actualizar", mensaje: e.response?.data?.error || "Revisa los datos." });
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={crear} className="card card-pad">
        <h2 className="section-title">Nuevo usuario</h2>
        <p className="section-sub">Solo un ADMIN puede crear cuentas. Sin registro público.</p>
        <div className="mt-3 grid sm:grid-cols-4 gap-2">
          <input className="field" placeholder="Usuario" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          <input className="field" type="password" placeholder="Contraseña (mín. 6)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <select className="field bg-white" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <button className="btn-primary">+ Crear</button>
        </div>
      </form>

      <div className="card overflow-hidden">
        <table className="tbl">
          <thead><tr><th>Usuario</th><th>Rol</th><th>Estado</th><th className="text-right">Acciones</th></tr></thead>
          <tbody>
            {lista.map((u) => (
              <tr key={u.id}>
                <td className="font-semibold">{u.username}</td>
                <td>
                  <select className="field !w-auto !py-1 !text-xs bg-white" value={u.rol} onChange={(e) => cambiar(u, { rol: e.target.value })}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td>
                  <span className={`badge ${u.activo ? "badge-green" : "badge-red"}`}>{u.activo ? "Activo" : "Inactivo"}</span>
                </td>
                <td className="text-right">
                  <button onClick={() => cambiar(u, { activo: !u.activo })}
                    className={u.activo ? "btn-danger-ghost" : "btn-ghost !text-xs"}>
                    {u.activo ? "Desactivar" : "Reactivar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lista.length === 0 && <p className="p-4 text-sm text-slate-500">Sin usuarios.</p>}
      </div>
    </div>
  );
}
