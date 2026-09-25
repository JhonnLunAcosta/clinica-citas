package com.clinica.citas.repository;

import com.clinica.citas.model.DiagnosticoCatalogo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiagnosticoCatalogoRepository extends JpaRepository<DiagnosticoCatalogo, Long> {
    Page<DiagnosticoCatalogo> findByCodigoContainingIgnoreCaseOrDescripcionContainingIgnoreCase(
            String codigo, String descripcion, Pageable pageable);
    boolean existsByCodigo(String codigo);
}
