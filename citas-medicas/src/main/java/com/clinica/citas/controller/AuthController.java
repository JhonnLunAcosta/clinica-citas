package com.clinica.citas.controller;

import com.clinica.citas.dto.*;
import com.clinica.citas.model.Usuario;
import com.clinica.citas.repository.UsuarioRepository;
import com.clinica.citas.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authManager;
    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthController(AuthenticationManager authManager, UsuarioRepository usuarios,
                          PasswordEncoder encoder, JwtService jwt) {
        this.authManager = authManager;
        this.usuarios = usuarios;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        if (usuarios.existsByUsername(req.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username ya existe");
        }
        Usuario u = new Usuario();
        u.setUsername(req.getUsername());
        u.setPassword(encoder.encode(req.getPassword()));
        String rol = req.getRol() == null ? "USER" : req.getRol().toUpperCase();
        u.setRol(rol);
        usuarios.save(u);
        return new AuthResponse(jwt.generate(u.getUsername(), u.getRol()), u.getUsername(), u.getRol());
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
        } catch (BadCredentialsException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales invalidas");
        }
        Usuario u = usuarios.findByUsername(req.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales invalidas"));
        return new AuthResponse(jwt.generate(u.getUsername(), u.getRol()), u.getUsername(), u.getRol());
    }
}
