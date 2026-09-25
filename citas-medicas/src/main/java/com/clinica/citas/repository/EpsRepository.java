package com.clinica.citas.repository;

import com.clinica.citas.model.Eps;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EpsRepository extends JpaRepository<Eps, Long> {
    List<Eps> findByActivaTrueOrderByNombreAsc();
    boolean existsByCodigo(String codigo);
}
