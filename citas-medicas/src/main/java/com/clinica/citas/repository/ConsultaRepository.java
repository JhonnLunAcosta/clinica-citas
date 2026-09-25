package com.clinica.citas.repository;

import com.clinica.citas.model.Consulta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ConsultaRepository extends JpaRepository<Consulta, Long> {
    Optional<Consulta> findByCitaId(Long citaId);
    List<Consulta> findByPacienteIdOrderByFechaDesc(Long pacienteId);
    List<Consulta> findByMedicoIdOrderByFechaDesc(Long medicoId);
}
