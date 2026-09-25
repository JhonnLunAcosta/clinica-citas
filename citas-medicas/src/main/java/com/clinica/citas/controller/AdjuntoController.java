package com.clinica.citas.controller;

import com.clinica.citas.model.Adjunto;
import com.clinica.citas.service.AdjuntoService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
public class AdjuntoController {

    private final AdjuntoService service;

    public AdjuntoController(AdjuntoService service) {
        this.service = service;
    }

    @PostMapping("/api/consultas/{id}/adjuntos")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('MEDICO','ADMIN')")
    public Adjunto subir(@PathVariable Long id,
                         @RequestParam("file") MultipartFile file,
                         Authentication auth) {
        return service.guardar(id, file, auth == null ? null : auth.getName());
    }

    @GetMapping("/api/consultas/{id}/adjuntos")
    @PreAuthorize("hasAnyRole('MEDICO','ADMIN')")
    public List<Adjunto> listar(@PathVariable Long id) {
        return service.listar(id);
    }

    @GetMapping("/api/adjuntos/{id}/descargar")
    @PreAuthorize("hasAnyRole('MEDICO','ADMIN')")
    public ResponseEntity<Resource> descargar(@PathVariable Long id) {
        AdjuntoService.AdjuntoRecurso r = service.descargar(id);
        String nombre = URLEncoder.encode(r.adjunto().getNombreOriginal(), StandardCharsets.UTF_8).replace("+", "%20");
        MediaType tipo = MediaType.APPLICATION_OCTET_STREAM;
        if (r.adjunto().getContentType() != null) {
            try { tipo = MediaType.parseMediaType(r.adjunto().getContentType()); }
            catch (Exception ignored) {}
        }
        return ResponseEntity.ok()
                .contentType(tipo)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + nombre + "\"")
                .body(r.recurso());
    }
}
