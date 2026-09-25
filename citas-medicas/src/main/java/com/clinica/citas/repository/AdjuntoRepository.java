package com.clinica.citas.repository;

import com.clinica.citas.model.Adjunto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AdjuntoRepository extends JpaRepository<Adjunto, Long> {
    List<Adjunto> findByConsultaIdOrderByFechaDesc(Long consultaId);
}
