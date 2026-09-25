package com.clinica.citas.dto;

import com.clinica.citas.model.Usuario;

public class UsuarioResponse {
    private Long id;
    private String username;
    private String rol;
    private boolean activo;

    public UsuarioResponse() {}

    public UsuarioResponse(Usuario u) {
        this.id = u.getId();
        this.username = u.getUsername();
        this.rol = u.getRol();
        this.activo = u.isActivo();
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getRol() { return rol; }
    public boolean isActivo() { return activo; }
}
