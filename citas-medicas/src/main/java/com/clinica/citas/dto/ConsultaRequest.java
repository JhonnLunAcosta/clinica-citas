package com.clinica.citas.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class ConsultaRequest {
    @NotNull(message = "La cita es obligatoria")
    private Long citaId;

    private String motivo;
    private String enfermedadActual;
    private String antecedentes;
    private String revisionSistemas;
    private String examenFisico;
    private String plan;
    private LocalDate proximaCita;

    private Double presionSistolica;
    private Double presionDiastolica;
    private Double frecuenciaCardiaca;
    private Double frecuenciaRespiratoria;
    private Double temperatura;
    private Double pesoKg;
    private Double tallaCm;

    @Valid
    private List<DiagnosticoDto> diagnosticos = new ArrayList<>();

    @Valid
    private List<FormulaDto> formulas = new ArrayList<>();

    public static class DiagnosticoDto {
        private String codigo;
        private String descripcion;
        private String tipo = "PRINCIPAL";

        public String getCodigo() { return codigo; }
        public void setCodigo(String codigo) { this.codigo = codigo; }
        public String getDescripcion() { return descripcion; }
        public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
        public String getTipo() { return tipo; }
        public void setTipo(String tipo) { this.tipo = tipo; }
    }

    public static class FormulaDto {
        private String medicamento;
        private String dosis;
        private String frecuencia;
        private String duracion;
        private String observaciones;

        public String getMedicamento() { return medicamento; }
        public void setMedicamento(String medicamento) { this.medicamento = medicamento; }
        public String getDosis() { return dosis; }
        public void setDosis(String dosis) { this.dosis = dosis; }
        public String getFrecuencia() { return frecuencia; }
        public void setFrecuencia(String frecuencia) { this.frecuencia = frecuencia; }
        public String getDuracion() { return duracion; }
        public void setDuracion(String duracion) { this.duracion = duracion; }
        public String getObservaciones() { return observaciones; }
        public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
    }

    public Long getCitaId() { return citaId; }
    public void setCitaId(Long citaId) { this.citaId = citaId; }
    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
    public String getEnfermedadActual() { return enfermedadActual; }
    public void setEnfermedadActual(String enfermedadActual) { this.enfermedadActual = enfermedadActual; }
    public String getAntecedentes() { return antecedentes; }
    public void setAntecedentes(String antecedentes) { this.antecedentes = antecedentes; }
    public String getRevisionSistemas() { return revisionSistemas; }
    public void setRevisionSistemas(String revisionSistemas) { this.revisionSistemas = revisionSistemas; }
    public String getExamenFisico() { return examenFisico; }
    public void setExamenFisico(String examenFisico) { this.examenFisico = examenFisico; }
    public String getPlan() { return plan; }
    public void setPlan(String plan) { this.plan = plan; }
    public LocalDate getProximaCita() { return proximaCita; }
    public void setProximaCita(LocalDate proximaCita) { this.proximaCita = proximaCita; }
    public Double getPresionSistolica() { return presionSistolica; }
    public void setPresionSistolica(Double presionSistolica) { this.presionSistolica = presionSistolica; }
    public Double getPresionDiastolica() { return presionDiastolica; }
    public void setPresionDiastolica(Double presionDiastolica) { this.presionDiastolica = presionDiastolica; }
    public Double getFrecuenciaCardiaca() { return frecuenciaCardiaca; }
    public void setFrecuenciaCardiaca(Double frecuenciaCardiaca) { this.frecuenciaCardiaca = frecuenciaCardiaca; }
    public Double getFrecuenciaRespiratoria() { return frecuenciaRespiratoria; }
    public void setFrecuenciaRespiratoria(Double frecuenciaRespiratoria) { this.frecuenciaRespiratoria = frecuenciaRespiratoria; }
    public Double getTemperatura() { return temperatura; }
    public void setTemperatura(Double temperatura) { this.temperatura = temperatura; }
    public Double getPesoKg() { return pesoKg; }
    public void setPesoKg(Double pesoKg) { this.pesoKg = pesoKg; }
    public Double getTallaCm() { return tallaCm; }
    public void setTallaCm(Double tallaCm) { this.tallaCm = tallaCm; }
    public List<DiagnosticoDto> getDiagnosticos() { return diagnosticos; }
    public void setDiagnosticos(List<DiagnosticoDto> diagnosticos) { this.diagnosticos = diagnosticos; }
    public List<FormulaDto> getFormulas() { return formulas; }
    public void setFormulas(List<FormulaDto> formulas) { this.formulas = formulas; }
}
