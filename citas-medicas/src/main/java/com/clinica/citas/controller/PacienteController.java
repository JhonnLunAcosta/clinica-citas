package com.clinica.citas.controller;

import com.clinica.citas.model.Paciente;
import com.clinica.citas.repository.PacienteRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/pacientes")
public class PacienteController {

    private final PacienteRepository repository;

    public PacienteController(PacienteRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public List<Paciente> listar() { return repository.findAll(); }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public Paciente obtener(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Paciente no encontrado"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public Paciente crear(@Valid @RequestBody Paciente paciente) {
        return repository.save(paciente);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public Paciente actualizar(@PathVariable Long id, @Valid @RequestBody Paciente datos) {
        Paciente p = obtener(id);
        p.setNombre(datos.getNombre());
        p.setEmail(datos.getEmail());
        p.setTelefono(datos.getTelefono());
        return repository.save(p);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void eliminar(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Paciente no encontrado");
        }
        repository.deleteById(id);
    }
}
