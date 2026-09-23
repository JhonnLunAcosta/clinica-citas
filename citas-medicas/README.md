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
- **ADMIN**: todo (crear/editar/borrar médicos, borrar pacientes/citas, registrar usuarios)
- **USER (recepción)**: leer médicos, CRUD pacientes (menos borrar), CRUD citas (menos borrar). No puede crear médicos → `403 {"error":"No tienes permiso (se requiere ADMIN)"}`

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
