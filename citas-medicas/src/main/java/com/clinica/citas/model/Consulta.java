package com.clinica.citas.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "consultas")
public class Consulta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "cita_id", unique = true, nullable = false)
    private Cita cita;

    @ManyToOne(optional = false)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @ManyToOne(optional = false)
    @JoinColumn(name = "medico_id", nullable = false)
    private Medico medico;

    private LocalDateTime fecha = LocalDateTime.now();

    @Column(length = 1000)
    private String motivo;

    @Column(length = 2000)
    private String enfermedadActual;

    // Res. 1995/1999: antecedentes + revision por sistemas
    @Column(length = 2000)
    private String antecedentes;

    @Column(length = 2000)
    private String revisionSistemas;

    // Signos vitales
    private Double presionSistolica;
    private Double presionDiastolica;
    private Double frecuenciaCardiaca;
    private Double frecuenciaRespiratoria;
    private Double temperatura;
    private Double pesoKg;
    private Double tallaCm;
    private Double imc;

    @Column(length = 2000)
    private String examenFisico;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "consulta_id")
    private List<Diagnostico> diagnosticos = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "consulta_id")
    private List<FormulaMedica> formulas = new ArrayList<>();

    @Column(length = 2000)
    private String plan;

    private LocalDate proximaCita;

    private String atendidoPor;

    @Transient
    private List<String> alertas = new ArrayList<>();

    @Transient
    private List<com.clinica.citas.model.Adjunto> adjuntos = new ArrayList<>();

    public Consulta() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Cita getCita() { return cita; }
    public void setCita(Cita cita) { this.cita = cita; }
    public Paciente getPaciente() { return paciente; }
    public void setPaciente(Paciente paciente) { this.paciente = paciente; }
    public Medico getMedico() { return medico; }
    public void setMedico(Medico medico) { this.medico = medico; }
    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }
    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
    public String getEnfermedadActual() { return enfermedadActual; }
    public void setEnfermedadActual(String enfermedadActual) { this.enfermedadActual = enfermedadActual; }
    public String getAntecedentes() { return antecedentes; }
    public void setAntecedentes(String antecedentes) { this.antecedentes = antecedentes; }
    public String getRevisionSistemas() { return revisionSistemas; }
    public void setRevisionSistemas(String revisionSistemas) { this.revisionSistemas = revisionSistemas; }
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
    public Double getImc() { return imc; }
    public void setImc(Double imc) { this.imc = imc; }
    public String getExamenFisico() { return examenFisico; }
    public void setExamenFisico(String examenFisico) { this.examenFisico = examenFisico; }
    public List<Diagnostico> getDiagnosticos() { return diagnosticos; }
    public void setDiagnosticos(List<Diagnostico> diagnosticos) { this.diagnosticos = diagnosticos; }
    public List<FormulaMedica> getFormulas() { return formulas; }
    public void setFormulas(List<FormulaMedica> formulas) { this.formulas = formulas; }
    public String getPlan() { return plan; }
    public void setPlan(String plan) { this.plan = plan; }
    public LocalDate getProximaCita() { return proximaCita; }
    public void setProximaCita(LocalDate proximaCita) { this.proximaCita = proximaCita; }
    public String getAtendidoPor() { return atendidoPor; }
    public void setAtendidoPor(String atendidoPor) { this.atendidoPor = atendidoPor; }
    public List<String> getAlertas() { return alertas; }
    public void setAlertas(List<String> alertas) { this.alertas = alertas; }
    public List<com.clinica.citas.model.Adjunto> getAdjuntos() { return adjuntos; }
    public void setAdjuntos(List<com.clinica.citas.model.Adjunto> adjuntos) { this.adjuntos = adjuntos; }
}
