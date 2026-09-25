package com.clinica.citas.service;

import com.clinica.citas.model.*;
import com.clinica.citas.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatsService {

    private final CitaRepository citas;
    private final ConsultaRepository consultas;
    private final PacienteRepository pacientes;
    private final MedicoRepository medicos;
    private final AdjuntoRepository adjuntos;

    public StatsService(CitaRepository citas, ConsultaRepository consultas,
                        PacienteRepository pacientes, MedicoRepository medicos,
                        AdjuntoRepository adjuntos) {
        this.citas = citas;
        this.consultas = consultas;
        this.pacientes = pacientes;
        this.medicos = medicos;
        this.adjuntos = adjuntos;
    }

    public Map<String, Object> resumen() {
        return resumen(null, null, null, null);
    }

    public Map<String, Object> resumen(LocalDate desde, LocalDate hasta, Long medicoId, String modalidad) {
        List<Cita> todas = filtrarCitas(citas.findAll(), desde, hasta, medicoId, modalidad);
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("citas", todas.size());
        for (EstadoCita e : EstadoCita.values()) {
            r.put("citas" + cap(e.name()), todas.stream().filter(c -> c.getEstado() == e).count());
        }
        r.put("teleconsultas", todas.stream().filter(c -> "TELECONSULTA".equals(c.getModalidad())).count());
        List<Consulta> cons = filtrarConsultas(consultas.findAll(), desde, hasta, medicoId);
        r.put("consultas", cons.size());
        r.put("pacientes", pacientes.count());
        r.put("medicos", medicos.count());
        r.put("adjuntos", adjuntos.count());
        return r;
    }

    public List<Map<String, Object>> citasPorDia(int dias) {
        return citasPorDia(dias, null, null, null, null);
    }

    public List<Map<String, Object>> citasPorDia(int dias, LocalDate desde, LocalDate hasta, Long medicoId, String modalidad) {
        List<Cita> todas = filtrarCitas(citas.findAll(), desde, hasta, medicoId, modalidad);
        List<LocalDate> rango = rangoFechas(dias, desde, hasta);
        List<Map<String, Object>> out = new ArrayList<>();
        for (LocalDate d : rango) {
            LocalDateTime ini = d.atStartOfDay();
            LocalDateTime fin = d.plusDays(1).atStartOfDay();
            long total = todas.stream().filter(c -> !c.getFechaHora().isBefore(ini) && c.getFechaHora().isBefore(fin)).count();
            long comp = todas.stream().filter(c -> c.getEstado() == EstadoCita.COMPLETADA
                    && !c.getFechaHora().isBefore(ini) && c.getFechaHora().isBefore(fin)).count();
            out.add(Map.of("fecha", d.toString(), "total", total, "completadas", comp));
        }
        return out;
    }

    public List<Map<String, Object>> topDiagnosticos(int limit) {
        return topDiagnosticos(limit, null, null, null);
    }

    public List<Map<String, Object>> topDiagnosticos(int limit, LocalDate desde, LocalDate hasta, Long medicoId) {
        int n = Math.min(Math.max(limit, 3), 15);
        Map<String, long[]> acc = new LinkedHashMap<>();
        Map<String, String> desc = new HashMap<>();
        for (Consulta c : filtrarConsultas(consultas.findAll(), desde, hasta, medicoId)) {
            for (Diagnostico d : c.getDiagnosticos()) {
                acc.computeIfAbsent(d.getCodigo(), k -> new long[1])[0]++;
                desc.putIfAbsent(d.getCodigo(), d.getDescripcion());
            }
        }
        return acc.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue()[0], a.getValue()[0]))
                .limit(n)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("codigo", e.getKey());
                    m.put("descripcion", desc.get(e.getKey()));
                    m.put("total", e.getValue()[0]);
                    return m;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> consultasPorMedico() {
        return consultasPorMedico(null, null);
    }

    public List<Map<String, Object>> consultasPorMedico(LocalDate desde, LocalDate hasta) {
        Map<String, Long> acc = new LinkedHashMap<>();
        Map<String, Long> ids = new HashMap<>();
        for (Consulta c : filtrarConsultas(consultas.findAll(), desde, hasta, null)) {
            String nombre = c.getMedico() != null ? c.getMedico().getNombre() : "—";
            acc.merge(nombre, 1L, Long::sum);
            if (c.getMedico() != null) ids.putIfAbsent(nombre, c.getMedico().getId());
        }
        return acc.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("medico", e.getKey());
                    m.put("medicoId", ids.get(e.getKey()));
                    m.put("total", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());
    }

    public Map<String, Object> signos() {
        return signos(null, null, null);
    }

    public Map<String, Object> signos(LocalDate desde, LocalDate hasta, Long medicoId) {
        List<Consulta> todas = filtrarConsultas(consultas.findAll(), desde, hasta, medicoId);
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("consultas", todas.size());
        r.put("taSistolicaProm", prom(todas.stream().map(Consulta::getPresionSistolica).toList()));
        r.put("fcProm", prom(todas.stream().map(Consulta::getFrecuenciaCardiaca).toList()));
        r.put("tempProm", prom(todas.stream().map(Consulta::getTemperatura).toList()));
        r.put("imcProm", prom(todas.stream().map(Consulta::getImc).toList()));
        r.put("taAlta", todas.stream().filter(c -> (c.getPresionSistolica() != null && c.getPresionSistolica() >= 140)
                || (c.getPresionDiastolica() != null && c.getPresionDiastolica() >= 90)).count());
        r.put("fiebre", todas.stream().filter(c -> c.getTemperatura() != null && c.getTemperatura() >= 38).count());
        return r;
    }

    private Double prom(List<Double> vals) {
        DoubleSummaryStatistics s = vals.stream().filter(Objects::nonNull).mapToDouble(Double::doubleValue).summaryStatistics();
        if (s.getCount() == 0) return null;
        return Math.round(s.getAverage() * 10.0) / 10.0;
    }

    public List<Map<String, Object>> detalleConsultas(String codigo, Long medicoId, LocalDate desde, LocalDate hasta) {
        return filtrarConsultas(consultas.findAll(), desde, hasta, medicoId).stream()
                .filter(c -> codigo == null || codigo.isBlank()
                        || c.getDiagnosticos().stream().anyMatch(d -> d.getCodigo().equalsIgnoreCase(codigo.trim())))
                .sorted(Comparator.comparing(Consulta::getFecha).reversed())
                .limit(50)
                .map(c -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", c.getId());
                    m.put("fecha", c.getFecha() != null ? c.getFecha().toString() : null);
                    m.put("paciente", c.getPaciente() != null ? c.getPaciente().getNombre() : "—");
                    m.put("pacienteId", c.getPaciente() != null ? c.getPaciente().getId() : null);
                    m.put("medico", c.getMedico() != null ? c.getMedico().getNombre() : "—");
                    m.put("diagnosticos", c.getDiagnosticos().stream()
                            .map(d -> d.getCodigo() + " " + d.getDescripcion()).toList());
                    return m;
                })
                .collect(Collectors.toList());
    }

    private List<Cita> filtrarCitas(List<Cita> todas, LocalDate desde, LocalDate hasta, Long medicoId, String modalidad) {
        return todas.stream()
                .filter(c -> desde == null || !c.getFechaHora().toLocalDate().isBefore(desde))
                .filter(c -> hasta == null || !c.getFechaHora().toLocalDate().isAfter(hasta))
                .filter(c -> medicoId == null || (c.getMedico() != null && medicoId.equals(c.getMedico().getId())))
                .filter(c -> modalidad == null || modalidad.isBlank() || modalidad.equalsIgnoreCase(c.getModalidad()))
                .collect(Collectors.toList());
    }

    private List<Consulta> filtrarConsultas(List<Consulta> todas, LocalDate desde, LocalDate hasta, Long medicoId) {
        return todas.stream()
                .filter(c -> desde == null || (c.getFecha() != null && !c.getFecha().toLocalDate().isBefore(desde)))
                .filter(c -> hasta == null || (c.getFecha() != null && !c.getFecha().toLocalDate().isAfter(hasta)))
                .filter(c -> medicoId == null || (c.getMedico() != null && medicoId.equals(c.getMedico().getId())))
                .collect(Collectors.toList());
    }

    private List<LocalDate> rangoFechas(int dias, LocalDate desde, LocalDate hasta) {
        if (desde != null && hasta != null && !hasta.isBefore(desde)) {
            List<LocalDate> out = new ArrayList<>();
            LocalDate d = desde;
            while (!d.isAfter(hasta) && out.size() < 60) {
                out.add(d);
                d = d.plusDays(1);
            }
            return out;
        }
        int n = Math.min(Math.max(dias, 7), 60);
        LocalDate hoy = LocalDate.now();
        List<LocalDate> out = new ArrayList<>();
        for (int i = n - 1; i >= 0; i--) out.add(hoy.minusDays(i));
        return out;
    }

    private String cap(String s) {
        return s.charAt(0) + s.substring(1).toLowerCase();
    }
}
