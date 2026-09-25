package com.clinica.citas.controller;

import com.clinica.citas.service.StatsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService stats;

    public StatsController(StatsService stats) {
        this.stats = stats;
    }

    @GetMapping("/resumen")
    @PreAuthorize("hasAnyRole('ADMIN','USER','MEDICO')")
    public Map<String, Object> resumen(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(required = false) Long medicoId,
            @RequestParam(required = false) String modalidad) {
        return stats.resumen(desde, hasta, medicoId, modalidad);
    }

    @GetMapping("/citas-por-dia")
    @PreAuthorize("hasAnyRole('ADMIN','USER','MEDICO')")
    public List<Map<String, Object>> citasPorDia(
            @RequestParam(defaultValue = "14") int dias,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(required = false) Long medicoId,
            @RequestParam(required = false) String modalidad) {
        return stats.citasPorDia(dias, desde, hasta, medicoId, modalidad);
    }

    @GetMapping("/top-diagnosticos")
    @PreAuthorize("hasAnyRole('ADMIN','MEDICO')")
    public List<Map<String, Object>> topDiagnosticos(
            @RequestParam(defaultValue = "8") int limit,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(required = false) Long medicoId) {
        return stats.topDiagnosticos(limit, desde, hasta, medicoId);
    }

    @GetMapping("/consultas-por-medico")
    @PreAuthorize("hasAnyRole('ADMIN','MEDICO')")
    public List<Map<String, Object>> consultasPorMedico(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return stats.consultasPorMedico(desde, hasta);
    }

    @GetMapping("/signos")
    @PreAuthorize("hasAnyRole('ADMIN','MEDICO')")
    public Map<String, Object> signos(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(required = false) Long medicoId) {
        return stats.signos(desde, hasta, medicoId);
    }

    @GetMapping("/detalle-consultas")
    @PreAuthorize("hasAnyRole('ADMIN','MEDICO')")
    public List<Map<String, Object>> detalleConsultas(
            @RequestParam(required = false) String codigo,
            @RequestParam(required = false) Long medicoId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return stats.detalleConsultas(codigo, medicoId, desde, hasta);
    }
}
