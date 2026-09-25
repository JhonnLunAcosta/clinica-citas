package com.clinica.citas.repository;

import com.clinica.citas.model.Medicamento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicamentoRepository extends JpaRepository<Medicamento, Long> {
    Page<Medicamento> findByCodigoContainingIgnoreCaseOrNombreContainingIgnoreCase(
            String codigo, String nombre, Pageable pageable);
    boolean existsByCodigo(String codigo);
}
