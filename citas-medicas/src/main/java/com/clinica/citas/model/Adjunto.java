package com.clinica.citas.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "adjuntos")
public class Adjunto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "consulta_id", nullable = false)
    private Consulta consulta;

    @Column(nullable = false, length = 300)
    private String nombreOriginal;

    @Column(nullable = false, length = 300)
    private String nombreGuardado;

    @Column(length = 150)
    private String contentType;

    private Long tamano;

    private LocalDateTime fecha = LocalDateTime.now();

    @Column(length = 100)
    private String subidoPor;

    public Adjunto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Consulta getConsulta() { return consulta; }
    public void setConsulta(Consulta consulta) { this.consulta = consulta; }
    public String getNombreOriginal() { return nombreOriginal; }
    public void setNombreOriginal(String nombreOriginal) { this.nombreOriginal = nombreOriginal; }
    public String getNombreGuardado() { return nombreGuardado; }
    public void setNombreGuardado(String nombreGuardado) { this.nombreGuardado = nombreGuardado; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public Long getTamano() { return tamano; }
    public void setTamano(Long tamano) { this.tamano = tamano; }
    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }
    public String getSubidoPor() { return subidoPor; }
    public void setSubidoPor(String subidoPor) { this.subidoPor = subidoPor; }
}
