package com.clinica.citas.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "citas")
public class Cita {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "paciente_id")
    @NotNull(message = "El paciente es obligatorio")
    private Paciente paciente;

    @ManyToOne(optional = false)
    @JoinColumn(name = "medico_id")
    @NotNull(message = "El medico es obligatorio")
    private Medico medico;

    @NotNull(message = "La fecha/hora es obligatoria")
    private LocalDateTime fechaHora;

    private String motivo;

    @Enumerated(EnumType.STRING)
    private EstadoCita estado = EstadoCita.PENDIENTE;

    // Teleconsulta (Res. 2654/2019 telesalud Colombia)
    private String modalidad = "PRESENCIAL";

    @Column(length = 500)
    private String linkTeleconsulta;

    public Cita() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Paciente getPaciente() { return paciente; }
    public void setPaciente(Paciente paciente) { this.paciente = paciente; }
    public Medico getMedico() { return medico; }
    public void setMedico(Medico medico) { this.medico = medico; }
    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }
    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
    public EstadoCita getEstado() { return estado; }
    public void setEstado(EstadoCita estado) { this.estado = estado; }
    public String getModalidad() { return modalidad; }
    public void setModalidad(String modalidad) { this.modalidad = modalidad; }
    public String getLinkTeleconsulta() { return linkTeleconsulta; }
    public void setLinkTeleconsulta(String linkTeleconsulta) { this.linkTeleconsulta = linkTeleconsulta; }
}
