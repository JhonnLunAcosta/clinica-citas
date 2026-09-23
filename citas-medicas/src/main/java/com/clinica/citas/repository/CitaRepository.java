package com.clinica.citas.repository;

import com.clinica.citas.model.Cita;
import com.clinica.citas.model.EstadoCita;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface CitaRepository extends JpaRepository<Cita, Long> {
    List<Cita> findByMedicoIdAndFechaHoraBetween(Long medicoId, LocalDateTime inicio, LocalDateTime fin);

    List<Cita> findByPacienteId(Long pacienteId);

    List<Cita> findByPacienteIdAndFechaHoraBetween(Long pacienteId, LocalDateTime inicio, LocalDateTime fin);

    List<Cita> findByEstado(EstadoCita estado);

    boolean existsByMedicoIdAndFechaHoraAndEstadoNot(Long medicoId, LocalDateTime fechaHora, EstadoCita estado);
}
