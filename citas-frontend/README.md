# Citas Médicas — Frontend React

SPA para gestión de citas, historia clínica y teleconsulta. Consume la API `citas-medicas` (Spring Boot + JWT).

**Stack:** React 19 · Vite 8 · Tailwind CSS 4 · Axios · React Router 7

## Funciones
- Login JWT con roles ADMIN / USER (recepción) / MÉDICO
- CRUD pacientes, médicos, citas automáticas por especialidad
- Historia clínica imprimible (Res. 1995/1999), adjuntos PDF/JPG/PNG
- Teleconsulta Jitsi + panel stats (citas por día, top diagnósticos)

## Correr local
```bash
cd citas-frontend
npm install
npm run dev  # http://localhost:5173
```
Backend esperado en `http://localhost:8080`. Usuarios demo: `admin/admin123`, `recepcion/recepcion123`, `medico/medico123`.

## Autor
Jhonn Luna Acosta — Ingeniero de Sistemas | Tech Lead
LinkedIn: https://www.linkedin.com/in/jhonn-luna-acosta
GitHub: https://github.com/JhonnLunAcosta
Backend: `../citas-medicas`
