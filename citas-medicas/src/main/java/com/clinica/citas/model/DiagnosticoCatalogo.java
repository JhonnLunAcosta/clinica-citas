package com.clinica.citas.model;

import jakarta.persistence.*;

@Entity
@Table(name = "cie10_catalogo")
public class DiagnosticoCatalogo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 10)
    private String codigo;

    @Column(nullable = false, length = 500)
    private String descripcion;

    @Column(length = 100)
    private String grupo;

    public DiagnosticoCatalogo() {}

    public DiagnosticoCatalogo(String codigo, String descripcion, String grupo) {
        this.codigo = codigo;
        this.descripcion = descripcion;
        this.grupo = grupo;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getGrupo() { return grupo; }
    public void setGrupo(String grupo) { this.grupo = grupo; }
}
