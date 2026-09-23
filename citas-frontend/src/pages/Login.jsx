import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "admin", password: "admin123" });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(form.username, form.password);
      nav("/");
    } catch {
      setError("Credenciales inválidas");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-semibold text-slate-800">Clínica · Citas</h1>
        <p className="text-sm text-slate-500 mt-1">Ingresa para agendar y gestionar citas</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-slate-600">Usuario</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">Contraseña</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="w-full rounded-lg bg-teal-600 text-white py-2 hover:bg-teal-700 transition">
            Entrar
          </button>
        </form>
        <p className="text-xs text-slate-400 mt-4">
          Demo: admin/admin123 · recepcion/recepcion123 — Backend en :8080
        </p>
        <Link to="/" className="hidden" />
      </div>
    </div>
  );
}
