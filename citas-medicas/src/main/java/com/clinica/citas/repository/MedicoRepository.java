package com.clinica.citas.repository;

import com.clinica.citas.model.Medico;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MedicoRepository extends JpaRepository<Medico, Long> {
    List<Medico> findByEspecialidadIgnoreCase(String especialidad);
}
