package com.clinica.citas.service;

import com.clinica.citas.dto.ConsultaRequest;
import com.clinica.citas.model.*;
import com.clinica.citas.repository.AdjuntoRepository;
import com.clinica.citas.repository.CitaRepository;
import com.clinica.citas.repository.ConsultaRepository;
import com.clinica.citas.repository.PacienteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ConsultaService {

    private final ConsultaRepository consultaRepository;
    private final CitaRepository citaRepository;
    private final PacienteRepository pacienteRepository;
    private final AdjuntoRepository adjuntoRepository;

    public ConsultaService(ConsultaRepository consultaRepository,
                           CitaRepository citaRepository,
                           PacienteRepository pacienteRepository,
                           AdjuntoRepository adjuntoRepository) {
        this.consultaRepository = consultaRepository;
        this.citaRepository = citaRepository;
        this.pacienteRepository = pacienteRepository;
        this.adjuntoRepository = adjuntoRepository;
    }

    public List<Consulta> listar() {
        List<Consulta> todas = consultaRepository.findAll();
        todas.forEach(c -> {
            c.setAlertas(generarAlertas(c));
            c.setAdjuntos(adjuntoRepository.findByConsultaIdOrderByFechaDesc(c.getId()));
        });
        return todas;
    }

    public Consulta obtener(Long id) {
        Consulta c = consultaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Consulta no encontrada"));
        c.setAlertas(generarAlertas(c));
        c.setAdjuntos(adjuntoRepository.findByConsultaIdOrderByFechaDesc(c.getId()));
        return c;
    }

    @Transactional
    public Consulta crear(ConsultaRequest req, String usernameMedico) {
        Cita cita = citaRepository.findById(req.getCitaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cita no encontrada"));

        if (cita.getEstado() == EstadoCita.CANCELADA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se puede atender una cita CANCELADA");
        }
        if (cita.getEstado() == EstadoCita.PENDIENTE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La cita esta PENDIENTE: confirma la cita antes de atenderla");
        }
        if (consultaRepository.findByCitaId(cita.getId()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esta cita ya tiene una consulta registrada");
        }
        if (req.getDiagnosticos() == null || req.getDiagnosticos().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debes registrar al menos un diagnostico CIE-10");
        }
        validarSignos(req);

        Consulta c = new Consulta();
        c.setCita(cita);
        c.setPaciente(cita.getPaciente());
        c.setMedico(cita.getMedico());
        c.setFecha(LocalDateTime.now());
        c.setMotivo(req.getMotivo() != null ? req.getMotivo() : cita.getMotivo());
        c.setEnfermedadActual(req.getEnfermedadActual());
        c.setAntecedentes(req.getAntecedentes());
        c.setRevisionSistemas(req.getRevisionSistemas());
        c.setExamenFisico(req.getExamenFisico());
        c.setPlan(req.getPlan());
        c.setProximaCita(req.getProximaCita());
        c.setAtendidoPor(usernameMedico);
        c.setPresionSistolica(req.getPresionSistolica());
        c.setPresionDiastolica(req.getPresionDiastolica());
        c.setFrecuenciaCardiaca(req.getFrecuenciaCardiaca());
        c.setFrecuenciaRespiratoria(req.getFrecuenciaRespiratoria());
        c.setTemperatura(req.getTemperatura());
        c.setPesoKg(req.getPesoKg());
        c.setTallaCm(req.getTallaCm());
        c.setImc(calcularImc(req.getPesoKg(), req.getTallaCm()));

        for (ConsultaRequest.DiagnosticoDto d : req.getDiagnosticos()) {
            if (d.getCodigo() == null || d.getCodigo().isBlank()
                    || d.getDescripcion() == null || d.getDescripcion().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Cada diagnostico requiere codigo y descripcion");
            }
            Diagnostico diag = new Diagnostico();
            diag.setCodigo(d.getCodigo().trim());
            diag.setDescripcion(d.getDescripcion().trim());
            diag.setTipo(d.getTipo() == null ? "PRINCIPAL" : d.getTipo().toUpperCase());
            c.getDiagnosticos().add(diag);
        }
        if (req.getFormulas() != null) {
            for (ConsultaRequest.FormulaDto f : req.getFormulas()) {
                if (f.getMedicamento() == null || f.getMedicamento().isBlank()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Cada formula requiere medicamento");
                }
                FormulaMedica fm = new FormulaMedica();
                fm.setMedicamento(f.getMedicamento().trim());
                fm.setDosis(f.getDosis());
                fm.setFrecuencia(f.getFrecuencia());
                fm.setDuracion(f.getDuracion());
                fm.setObservaciones(f.getObservaciones());
                c.getFormulas().add(fm);
            }
        }

        c.setAlertas(generarAlertas(c));
        Consulta guardada = consultaRepository.save(c);

        cita.setEstado(EstadoCita.COMPLETADA);
        citaRepository.save(cita);

        return guardada;
    }

    public HistoriaResponse historia(Long pacienteId) {
        Paciente p = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Paciente no encontrado"));
        List<Consulta> consultas = consultaRepository.findByPacienteIdOrderByFechaDesc(pacienteId);
        consultas.forEach(c -> {
            c.setAlertas(generarAlertas(c));
            c.setAdjuntos(adjuntoRepository.findByConsultaIdOrderByFechaDesc(c.getId()));
        });
        return new HistoriaResponse(p, consultas);
    }

    public static Double calcularImc(Double pesoKg, Double tallaCm) {
        if (pesoKg == null || tallaCm == null || tallaCm <= 0) return null;
        double tallaM = tallaCm / 100.0;
        double imc = pesoKg / (tallaM * tallaM);
        return Math.round(imc * 10.0) / 10.0;
    }

    private void validarSignos(ConsultaRequest req) {
        rango(req.getPresionSistolica(), 50, 300, "sistólica");
        rango(req.getPresionDiastolica(), 30, 200, "diastólica");
        if (req.getPresionSistolica() != null && req.getPresionDiastolica() != null
                && req.getPresionDiastolica() >= req.getPresionSistolica()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La presión diastólica debe ser menor que la sistólica");
        }
        rango(req.getFrecuenciaCardiaca(), 20, 250, "cardiaca");
        rango(req.getFrecuenciaRespiratoria(), 5, 80, "respiratoria");
        rango(req.getTemperatura(), 30, 45, "temperatura");
        rango(req.getPesoKg(), 1, 500, "peso");
        rango(req.getTallaCm(), 20, 250, "talla");
        if (req.getProximaCita() != null && req.getProximaCita().isBefore(java.time.LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La próxima cita no puede ser en el pasado");
        }
        if (req.getFormulas() != null) {
            for (ConsultaRequest.FormulaDto f : req.getFormulas()) {
                if (f.getMedicamento() != null && !f.getMedicamento().isBlank()) {
                    if (f.getDosis() == null || f.getDosis().isBlank()
                            || f.getFrecuencia() == null || f.getFrecuencia().isBlank()) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "Cada medicamento (" + f.getMedicamento() + ") requiere dosis y frecuencia");
                    }
                }
            }
        }
    }

    private void rango(Double valor, double min, double max, String campo) {
        if (valor == null) return;
        if (valor < min || valor > max) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Valor fuera de rango en " + campo + ": " + valor + " (esperado " + min + "-" + max + ")");
        }
    }

    // Reglas explicables, no diagnostico automatico.
    public static List<String> generarAlertas(Consulta c) {
        List<String> alertas = new ArrayList<>();
        if (c.getPresionSistolica() != null && c.getPresionDiastolica() != null) {
            if (c.getPresionSistolica() >= 140 || c.getPresionDiastolica() >= 90) {
                alertas.add("Presion arterial elevada (" + c.getPresionSistolica().intValue()
                        + "/" + c.getPresionDiastolica().intValue() + " mmHg): verificar y hacer seguimiento");
            }
        }
        if (c.getImc() != null) {
            if (c.getImc() >= 30) alertas.add("IMC " + c.getImc() + ": rango obesidad, sugerir control nutricional");
            else if (c.getImc() < 18.5) alertas.add("IMC " + c.getImc() + ": bajo peso, valorar nutricion");
        }
        if (c.getTemperatura() != null && c.getTemperatura() >= 38.0) {
            alertas.add("Fiebre (" + c.getTemperatura() + " C): correlacionar con diagnostico");
        }
        if (c.getFrecuenciaCardiaca() != null && (c.getFrecuenciaCardiaca() > 100 || c.getFrecuenciaCardiaca() < 50)) {
            alertas.add("FC fuera de rango (" + c.getFrecuenciaCardiaca() + " lpm): revisar");
        }
        // Cruce alergias vs formula por coincidencia de texto
        if (c.getPaciente() != null && c.getPaciente().getAlergias() != null
                && !c.getPaciente().getAlergias().isBlank() && c.getFormulas() != null) {
            String[] alergias = c.getPaciente().getAlergias().toLowerCase().split("[,;]");
            for (FormulaMedica f : c.getFormulas()) {
                if (f.getMedicamento() == null) continue;
                String med = f.getMedicamento().toLowerCase();
                for (String a : alergias) {
                    String al = a.trim();
                    if (al.length() >= 3 && med.contains(al)) {
                        alertas.add("Posible alergia: '" + f.getMedicamento()
                                + "' coincide con alergia registrada '" + al + "'. Verificar antes de entregar");
                    }
                }
            }
        }
        return alertas;
    }

    public static class HistoriaResponse {
        private Paciente paciente;
        private List<Consulta> consultas;
        private int totalConsultas;

        public HistoriaResponse(Paciente paciente, List<Consulta> consultas) {
            this.paciente = paciente;
            this.consultas = consultas;
            this.totalConsultas = consultas.size();
        }

        public Paciente getPaciente() { return paciente; }
        public List<Consulta> getConsultas() { return consultas; }
        public int getTotalConsultas() { return totalConsultas; }
    }
}
