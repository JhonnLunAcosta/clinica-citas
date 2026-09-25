package com.clinica.citas.controller;

import com.clinica.citas.dto.ConsultaRequest;
import com.clinica.citas.model.Consulta;
import com.clinica.citas.service.ConsultaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/consultas")
public class ConsultaController {

    private final ConsultaService service;

    public ConsultaController(ConsultaService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MEDICO')")
    public List<Consulta> listar() { return service.listar(); }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MEDICO')")
    public Consulta obtener(@PathVariable Long id) { return service.obtener(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('MEDICO','ADMIN')")
    public Consulta crear(@Valid @RequestBody ConsultaRequest req, Authentication auth) {
        String username = auth == null ? null : auth.getName();
        return service.crear(req, username);
    }
}
