package com.clinica.citas.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class CitaAutomaticaRequest {
    @NotNull(message = "pacienteId es obligatorio")
    private Long pacienteId;

    @NotBlank(message = "La especialidad es obligatoria")
    private String especialidad;

    @NotNull(message = "La fecha/hora es obligatoria")
    @Future(message = "La cita debe ser en el futuro")
    private LocalDateTime fechaHora;

    private String motivo;

    public Long getPacienteId() { return pacienteId; }
    public void setPacienteId(Long pacienteId) { this.pacienteId = pacienteId; }
    public String getEspecialidad() { return especialidad; }
    public void setEspecialidad(String especialidad) { this.especialidad = especialidad; }
    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }
    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
}
