# Citas Médicas Automatizadas

API REST con **Spring Boot 3.2.5 + Java 17 + MySQL + Maven + Spring Security JWT**.

Asignación automática de citas por especialidad y disponibilidad, con roles ADMIN/USER.

## Requisitos
- Java 17, Maven 3.9+
- MySQL corriendo en `localhost:3306`, usuario `root`, clave `root`
- DB `citas_db` (se crea sola con `createDatabaseIfNotExist=true`)

## Configuración
`src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/citas_db?createDatabaseIfNotExist=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=root
jwt.secret=c2VjcmV0LWNsaW5pY2EtY2l0YXMtbWVkaWNhcy1qd3Qtc2VjcmV0LTAxMjM0NTY3ODkwMTIzNDU2Nzg=
jwt.expiration-ms=86400000
```

## Ejecutar
```bash
cd "D:\proyectos jhonn\citas-medicas"
mvn clean compile
mvn spring-boot:run
```
API: `http://localhost:8080`

Al arrancar se crean solos (ver `config/DataSeeder.java`):
- `admin / admin123` rol ADMIN
- `recepcion / recepcion123` rol USER
- `medico / medico123` rol MEDICO

## Autenticación JWT
1. Login:
```http
POST /api/auth/login
{"username":"admin","password":"admin123"}
```
Respuesta:
```json
{"token":"eyJ...","username":"admin","rol":"ADMIN"}
```
2. En Postman: Collection > Authorization > Bearer Token > pegar token.
   Los demás requests: Authorization > Inherit auth from parent.
   El login va con No Auth.
3. Registrar (solo ADMIN):
```http
POST /api/auth/register
Authorization: Bearer <token-admin>
{"username":"nuevo","password":"123456","rol":"USER"}
```

## Roles
- **ADMIN**: todo (crear/editar/borrar médicos, borrar pacientes/citas, gestionar usuarios en `/api/usuarios`, leer consultas/historia)
- **USER (recepción)**: leer médicos, CRUD pacientes (menos borrar), CRUD citas (menos borrar). No puede crear médicos → `403 {"error":"No tienes permiso (se requiere ADMIN)"}`. No puede ver consultas/historia ni usuarios → `403`
- **MEDICO**: leer médicos/pacientes/citas, atender consultas, ver historia. No puede crear médicos, ni borrar, ni gestionar usuarios

## Endpoints
### Médicos `/api/medicos`
- `GET /api/medicos?especialidad=Pediatria` (ADMIN,USER)
- `POST /api/medicos` (ADMIN): `{"nombre":"Dra. Pérez","especialidad":"Pediatria","email":"perez@clinica.com"}`
- `PUT /api/medicos/{id}` (ADMIN), `DELETE /api/medicos/{id}` (ADMIN)

### Pacientes `/api/pacientes`
- `GET /api/pacientes` (ADMIN,USER)
- `POST /api/pacientes` (ADMIN,USER): `{"nombre":"Juan","email":"juan@mail.com","telefono":"3001234567"}`
- `PUT /api/pacientes/{id}` (ADMIN,USER), `DELETE` (ADMIN)

### Citas `/api/citas`
- `GET /api/citas` (ADMIN,USER)
- `POST /api/citas/automatica` (ADMIN,USER) — asigna primer médico libre de la especialidad:
```json
{"pacienteId":1,"especialidad":"Pediatria","fechaHora":"2026-09-24T10:00:00","motivo":"Control"}
```
- `PATCH /api/citas/{id}/estado` (ADMIN,USER): `{"estado":"CONFIRMADA"}`
- `DELETE /api/citas/{id}` (ADMIN)

Estados: `PENDIENTE, CONFIRMADA, CANCELADA, COMPLETADA`

### Consultas `/api/consultas` (MEDICO, ADMIN. USER bloqueado)
- `GET /api/consultas`, `GET /api/consultas/{id}`
- `POST /api/consultas` — atiende una cita CONFIRMADA (la pasa a COMPLETADA). 1 cita → 1 consulta. Requiere ≥1 diagnóstico CIE-10:
```json
{
  "citaId": 1,
  "enfermedadActual": "Tos y fiebre hace 3 dias",
  "presionSistolica": 145, "presionDiastolica": 92,
  "temperatura": 38.5, "pesoKg": 95, "tallaCm": 170,
  "examenFisico": "Farige hiperemica",
  "diagnosticos": [{"codigo": "J06.9", "descripcion": "Infeccion respiratoria", "tipo": "PRINCIPAL"}],
  "formulas": [{"medicamento": "Amoxicilina", "dosis": "500mg", "frecuencia": "Cada 8h", "duracion": "7 dias"}],
  "plan": "Control en 7 dias",
  "proximaCita": "2026-10-05"
}
```
Respuesta incluye `imc` calculado y `alertas` (reglas explicables: TA elevada, IMC, fiebre, cruce alergia vs fórmula). No es diagnóstico automático.
- Errores: cita PENDIENTE → `400 confirma antes`; CANCELADA → `400`; consulta duplicada → `409`; USER → `403`.

### Historia `/api/historia/{pacienteId}` (MEDICO, ADMIN)
Documento clínico por paciente según Res. 1995/1999 (identificación, motivo, enfermedad actual, antecedentes, revisión por sistemas, signos, examen, CIE-10, plan, fórmula, anexos). El front la presenta en formato de historia con impresión.

### Adjuntos `/api/consultas/{id}/adjuntos` (MEDICO, ADMIN)
- `POST` multipart `file` (PDF/JPG/PNG, máx 10MB: resultados, imágenes, remisiones). Guarda en `./uploads` + metadatos en `adjuntos`.
- `GET /api/consultas/{id}/adjuntos`, `GET /api/adjuntos/{id}/descargar`.

### Teleconsulta (Res. 2654/2019)
- `Cita.modalidad`: PRESENCIAL | TELECONSULTA. Al agendar virtual se genera `linkTeleconsulta` (Jitsi `meet.jit.si/clinica-cita-{id}`).
- El front muestra “Unirse al video”. Requiere internet y consentimiento del paciente; la atención se registra igual en `POST /api/consultas`.

### Panel estadístico `/api/stats`
- `GET /resumen`, `/citas-por-dia?dias=14` (ADMIN, USER, MEDICO)
- `GET /top-diagnosticos`, `/consultas-por-medico`, `/signos` (ADMIN, MEDICO). Recepción no ve detalle clínico.

### Catálogos en BD `/api/catalogo` (ADMIN, USER, MEDICO)
Nada quemado en el front: todo sale de MySQL (`cie10_catalogo`, `medicamentos_catalogo`).
- `GET /api/catalogo/diagnosticos?q=fiebre&limit=10` → página con `{codigo, descripcion, grupo}`
- `GET /api/catalogo/medicamentos?q=amoxi&limit=10` → página con `{codigo, nombre, concentracion, formaFarmaceutica}`
- `GET /api/catalogo/eps` → lista de EPS activas (`eps_catalogo`) para el desplegable del paciente
- Semilla inicial: 24 CIE-10 frecuentes + 20 medicamentos esenciales (`config/CatalogoSeeder.java`). No es el oficial completo.
- Norma Colombia: CIE-10 OMS adoptado por MinSalud; medicamentos referencia INVIMA/CUM. Para producción, cargar CSV oficial con job de importación (pendiente).

### Pacientes: campos nuevos
`documento (único), fechaNacimiento, sexo, eps, rh, alergias, contactoEmergencia`. Todos opcionales para no romper datos existentes.

## Validaciones automáticas
- Fecha futura (`@Future`), horario Lun-Sáb 07:00-19:00, domingos bloqueados
- Sin solape ±30 min por médico ni por paciente (canceladas no cuentan)
- Email paciente único → `409`, body faltante → `400`, sin token → `401/403`

## Pruebas rápidas Postman
1. Login recepcion → copiar token → `POST /api/medicos` → `403` esperado
2. Mismo token → `POST /api/citas/automatica` hora libre → `201`
3. Login admin → `POST /api/medicos` email nuevo → `201`
4. Hora `22:00` → `400 Horario permitido`, domingo → `400 No se agenda los domingos`

## Estructura
```
src/main/java/com/clinica/citas/
  CitasMedicasApplication.java
  config/SecurityConfig.java, DataSeeder.java
  security/JwtService.java, JwtAuthFilter.java
  model/Paciente.java, Medico.java, Cita.java, Usuario.java, EstadoCita.java
  repository/*, service/CitaService.java, CustomUserDetailsService.java
  controller/AuthController.java, CitaController.java, MedicoController.java, PacienteController.java
  exception/GlobalExceptionHandler.java
  dto/CitaAutomaticaRequest.java, LoginRequest.java, RegisterRequest.java, AuthResponse.java
```

## Abrir en IDE
- VS Code: Abrir carpeta `D:\proyectos jhonn\citas-medicas` + F5 (`.vscode/launch.json`)
- IntelliJ/Eclipse/NetBeans: Abrir como proyecto Maven (`pom.xml`)
