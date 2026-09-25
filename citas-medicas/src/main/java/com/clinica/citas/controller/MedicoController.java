package com.clinica.citas.controller;

import com.clinica.citas.model.Medico;
import com.clinica.citas.repository.MedicoRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/medicos")
public class MedicoController {

    private final MedicoRepository repository;

    public MedicoController(MedicoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','USER','MEDICO')")
    public List<Medico> listar(@RequestParam(required = false) String especialidad) {
        if (especialidad != null && !especialidad.isBlank()) {
            return repository.findByEspecialidadIgnoreCase(especialidad);
        }
        return repository.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','USER','MEDICO')")
    public Medico obtener(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Medico no encontrado"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public Medico crear(@Valid @RequestBody Medico medico) {
        return repository.save(medico);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Medico actualizar(@PathVariable Long id, @Valid @RequestBody Medico datos) {
        Medico m = obtener(id);
        m.setNombre(datos.getNombre());
        m.setEspecialidad(datos.getEspecialidad());
        m.setEmail(datos.getEmail());
        return repository.save(m);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void eliminar(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Medico no encontrado");
        }
        repository.deleteById(id);
    }
}
