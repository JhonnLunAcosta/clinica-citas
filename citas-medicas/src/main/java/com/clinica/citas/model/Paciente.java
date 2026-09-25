package com.clinica.citas.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "pacientes")
public class Paciente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @Email(message = "Email no valido")
    @NotBlank(message = "El email es obligatorio")
    @Column(unique = true)
    private String email;

    private String telefono;

    // --- Datos clinico-administrativos (Fase historia clinica) ---
    // Nullable para no romper filas existentes (ddl-auto=update).
    @Column(unique = true)
    private String documento;

    private java.time.LocalDate fechaNacimiento;

    private String sexo;

    private String eps;

    private String rh;

    @Column(length = 500)
    private String alergias;

    private String contactoEmergencia;

    public Paciente() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public String getDocumento() { return documento; }
    public void setDocumento(String documento) { this.documento = documento; }
    public java.time.LocalDate getFechaNacimiento() { return fechaNacimiento; }
    public void setFechaNacimiento(java.time.LocalDate fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }
    public String getSexo() { return sexo; }
    public void setSexo(String sexo) { this.sexo = sexo; }
    public String getEps() { return eps; }
    public void setEps(String eps) { this.eps = eps; }
    public String getRh() { return rh; }
    public void setRh(String rh) { this.rh = rh; }
    public String getAlergias() { return alergias; }
    public void setAlergias(String alergias) { this.alergias = alergias; }
    public String getContactoEmergencia() { return contactoEmergencia; }
    public void setContactoEmergencia(String contactoEmergencia) { this.contactoEmergencia = contactoEmergencia; }
}
