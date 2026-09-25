package com.clinica.citas.model;

import jakarta.persistence.*;

@Entity
@Table(name = "medicamentos_catalogo")
public class Medicamento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String codigo;

    @Column(nullable = false, length = 300)
    private String nombre;

    @Column(length = 100)
    private String concentracion;

    @Column(length = 100)
    private String formaFarmaceutica;

    @Column(length = 100)
    private String viaAdministracion;

    public Medicamento() {}

    public Medicamento(String codigo, String nombre, String concentracion, String formaFarmaceutica, String viaAdministracion) {
        this.codigo = codigo;
        this.nombre = nombre;
        this.concentracion = concentracion;
        this.formaFarmaceutica = formaFarmaceutica;
        this.viaAdministracion = viaAdministracion;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getConcentracion() { return concentracion; }
    public void setConcentracion(String concentracion) { this.concentracion = concentracion; }
    public String getFormaFarmaceutica() { return formaFarmaceutica; }
    public void setFormaFarmaceutica(String formaFarmaceutica) { this.formaFarmaceutica = formaFarmaceutica; }
    public String getViaAdministracion() { return viaAdministracion; }
    public void setViaAdministracion(String viaAdministracion) { this.viaAdministracion = viaAdministracion; }
}
