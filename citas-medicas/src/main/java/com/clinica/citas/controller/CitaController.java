package com.clinica.citas.controller;

import com.clinica.citas.dto.CitaAutomaticaRequest;
import com.clinica.citas.model.Cita;
import com.clinica.citas.model.EstadoCita;
import com.clinica.citas.service.CitaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/citas")
public class CitaController {

    private final CitaService service;

    public CitaController(CitaService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','USER','MEDICO')")
    public List<Cita> listar() { return service.listar(); }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','USER','MEDICO')")
    public Cita obtener(@PathVariable Long id) { return service.obtener(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public Cita crearManual(@Valid @RequestBody Cita cita) {
        return service.crearManual(cita);
    }

    // Endpoint estrella: automatiza la asignacion por especialidad y disponibilidad
    @PostMapping("/automatica")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public Cita crearAutomatica(@Valid @RequestBody CitaAutomaticaRequest req) {
        return service.crearAutomatica(req);
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('ADMIN','USER','MEDICO')")
    public Cita cambiarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        if (body == null || body.get("estado") == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debes enviar {\"estado\":\"CONFIRMADA\"}");
        }
        EstadoCita estado;
        try {
            estado = EstadoCita.valueOf(body.get("estado").toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Estado invalido. Usa: PENDIENTE, CONFIRMADA, CANCELADA, COMPLETADA");
        }
        return service.cambiarEstado(id, estado);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void eliminar(@PathVariable Long id) { service.eliminar(id); }
}
