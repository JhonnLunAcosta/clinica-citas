package com.clinica.citas.controller;

import com.clinica.citas.model.DiagnosticoCatalogo;
import com.clinica.citas.model.Eps;
import com.clinica.citas.model.Medicamento;
import com.clinica.citas.repository.DiagnosticoCatalogoRepository;
import com.clinica.citas.repository.EpsRepository;
import com.clinica.citas.repository.MedicamentoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/catalogo")
public class CatalogoController {

    private final DiagnosticoCatalogoRepository cie10;
    private final MedicamentoRepository medicamentos;
    private final EpsRepository eps;

    public CatalogoController(DiagnosticoCatalogoRepository cie10, MedicamentoRepository medicamentos, EpsRepository eps) {
        this.cie10 = cie10;
        this.medicamentos = medicamentos;
        this.eps = eps;
    }

    @GetMapping("/diagnosticos")
    @PreAuthorize("hasAnyRole('ADMIN','USER','MEDICO')")
    public Page<DiagnosticoCatalogo> diagnosticos(
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "10") int limit) {
        int size = Math.min(Math.max(limit, 1), 20);
        if (q == null || q.isBlank()) {
            return cie10.findAll(PageRequest.of(0, size));
        }
        return cie10.findByCodigoContainingIgnoreCaseOrDescripcionContainingIgnoreCase(
                q.trim(), q.trim(), PageRequest.of(0, size));
    }

    @GetMapping("/medicamentos")
    @PreAuthorize("hasAnyRole('ADMIN','USER','MEDICO')")
    public Page<Medicamento> medicamentos(
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "10") int limit) {
        int size = Math.min(Math.max(limit, 1), 20);
        if (q == null || q.isBlank()) {
            return medicamentos.findAll(PageRequest.of(0, size));
        }
        return medicamentos.findByCodigoContainingIgnoreCaseOrNombreContainingIgnoreCase(
                q.trim(), q.trim(), PageRequest.of(0, size));
    }

    @GetMapping("/eps")
    @PreAuthorize("hasAnyRole('ADMIN','USER','MEDICO')")
    public java.util.List<Eps> eps() {
        return eps.findByActivaTrueOrderByNombreAsc();
    }
}
