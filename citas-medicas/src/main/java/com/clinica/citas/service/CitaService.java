package com.clinica.citas.service;

import com.clinica.citas.dto.CitaAutomaticaRequest;
import com.clinica.citas.model.*;
import com.clinica.citas.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CitaService {

    private final CitaRepository citaRepository;
    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;

    public CitaService(CitaRepository citaRepository,
                       PacienteRepository pacienteRepository,
                       MedicoRepository medicoRepository) {
        this.citaRepository = citaRepository;
        this.pacienteRepository = pacienteRepository;
        this.medicoRepository = medicoRepository;
    }

    public List<Cita> listar() {
        return citaRepository.findAll();
    }

    public Cita obtener(Long id) {
        return citaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cita no encontrada"));
    }

    public Cita crearManual(Cita cita) {
        if (cita.getPaciente() == null || cita.getPaciente().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debes enviar paciente con id");
        }
        if (cita.getMedico() == null || cita.getMedico().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debes enviar medico con id");
        }
        validarHorario(cita.getFechaHora());
        validarDisponibilidad(cita.getMedico().getId(), cita.getFechaHora());
        validarPacienteLibre(cita.getPaciente().getId(), cita.getFechaHora());
        cita.setEstado(EstadoCita.PENDIENTE);
        return citaRepository.save(cita);
    }

    // Automatizacion: asigna el primer medico de la especialidad que este libre en esa hora
    public Cita crearAutomatica(CitaAutomaticaRequest req) {
        validarHorario(req.getFechaHora());
        validarPacienteLibre(req.getPacienteId(), req.getFechaHora());
        Paciente paciente = pacienteRepository.findById(req.getPacienteId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Paciente no encontrado"));

        List<Medico> medicos = medicoRepository.findByEspecialidadIgnoreCase(req.getEspecialidad());
        if (medicos.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No hay medicos con especialidad: " + req.getEspecialidad());
        }

        for (Medico medico : medicos) {
            if (estaLibre(medico.getId(), req.getFechaHora())) {
                Cita cita = new Cita();
                cita.setPaciente(paciente);
                cita.setMedico(medico);
                cita.setFechaHora(req.getFechaHora());
                cita.setMotivo(req.getMotivo());
                cita.setEstado(EstadoCita.PENDIENTE);
                return citaRepository.save(cita);
            }
        }
        throw new ResponseStatusException(HttpStatus.CONFLICT,
                "No hay disponibilidad para " + req.getEspecialidad() + " en " + req.getFechaHora());
    }

    public Cita cambiarEstado(Long id, EstadoCita nuevoEstado) {
        Cita cita = obtener(id);
        cita.setEstado(nuevoEstado);
        return citaRepository.save(cita);
    }

    public void eliminar(Long id) {
        if (!citaRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cita no encontrada");
        }
        citaRepository.deleteById(id);
    }

    private void validarDisponibilidad(Long medicoId, LocalDateTime fechaHora) {
        if (!estaLibre(medicoId, fechaHora)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El medico ya tiene una cita en esa hora");
        }
    }

    private void validarPacienteLibre(Long pacienteId, LocalDateTime fechaHora) {
        LocalDateTime inicio = fechaHora.minusMinutes(20);
        LocalDateTime fin = fechaHora.plusMinutes(20);
        boolean ocupado = !citaRepository.findByPacienteIdAndFechaHoraBetween(pacienteId, inicio, fin)
                .stream()
                .filter(c -> c.getEstado() != EstadoCita.CANCELADA)
                .toList().isEmpty();
        if (ocupado) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El paciente ya tiene una cita en esa hora");
        }
    }

    // Horario laboral: Lun-Sab 07:00-19:00, no domingos
    private void validarHorario(LocalDateTime fechaHora) {
        if (fechaHora == null) return;
        var dia = fechaHora.getDayOfWeek();
        int hora = fechaHora.getHour();
        if (dia == java.time.DayOfWeek.SUNDAY) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se agenda los domingos");
        }
        if (hora < 7 || hora >= 19) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Horario permitido: 07:00 a 19:00");
        }
    }

    // MinSalud Colombia: 20 min por cita, bloquea ±20 min para evitar solapamientos
    private boolean estaLibre(Long medicoId, LocalDateTime fechaHora) {
        LocalDateTime inicio = fechaHora.minusMinutes(20);
        LocalDateTime fin = fechaHora.plusMinutes(20);
        List<Cita> solapadas = citaRepository.findByMedicoIdAndFechaHoraBetween(medicoId, inicio, fin)
                .stream()
                .filter(c -> c.getEstado() != EstadoCita.CANCELADA)
                .toList();
        return solapadas.isEmpty();
    }
}
