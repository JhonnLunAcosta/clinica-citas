package com.clinica.citas.controller;

import com.clinica.citas.dto.RegisterRequest;
import com.clinica.citas.dto.UsuarioResponse;
import com.clinica.citas.model.Usuario;
import com.clinica.citas.repository.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@PreAuthorize("hasRole('ADMIN')")
public class UsuarioAdminController {

    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;

    public UsuarioAdminController(UsuarioRepository usuarios, PasswordEncoder encoder) {
        this.usuarios = usuarios;
        this.encoder = encoder;
    }

    @GetMapping
    public List<UsuarioResponse> listar() {
        return usuarios.findAll().stream().map(UsuarioResponse::new).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponse crear(@Valid @RequestBody RegisterRequest req) {
        if (usuarios.existsByUsername(req.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username ya existe");
        }
        String rol = req.getRol() == null ? "USER" : req.getRol().toUpperCase();
        if (!rol.equals("ADMIN") && !rol.equals("USER") && !rol.equals("MEDICO")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rol invalido. Usa: ADMIN, USER, MEDICO");
        }
        Usuario u = new Usuario();
        u.setUsername(req.getUsername());
        u.setPassword(encoder.encode(req.getPassword()));
        u.setRol(rol);
        u.setActivo(true);
        return new UsuarioResponse(usuarios.save(u));
    }

    @PatchMapping("/{id}")
    public UsuarioResponse actualizar(@PathVariable Long id,
                                      @RequestBody Map<String, Object> body,
                                      Authentication auth) {
        Usuario u = usuarios.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        if (body.containsKey("rol")) {
            String rol = String.valueOf(body.get("rol")).toUpperCase();
            if (!rol.equals("ADMIN") && !rol.equals("USER") && !rol.equals("MEDICO")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rol invalido. Usa: ADMIN, USER, MEDICO");
            }
            u.setRol(rol);
        }
        if (body.containsKey("activo")) {
            boolean activo = Boolean.parseBoolean(String.valueOf(body.get("activo")));
            if (!activo && auth != null && auth.getName().equals(u.getUsername())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puedes desactivar tu propia cuenta");
            }
            u.setActivo(activo);
        }
        return new UsuarioResponse(usuarios.save(u));
    }
}
