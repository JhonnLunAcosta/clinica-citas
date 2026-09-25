package com.clinica.citas.controller;

import com.clinica.citas.service.ConsultaService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/historia")
public class HistoriaController {

    private final ConsultaService service;

    public HistoriaController(ConsultaService service) {
        this.service = service;
    }

    @GetMapping("/{pacienteId}")
    @PreAuthorize("hasAnyRole('ADMIN','MEDICO')")
    public ConsultaService.HistoriaResponse historia(@PathVariable Long pacienteId) {
        return service.historia(pacienteId);
    }
}
