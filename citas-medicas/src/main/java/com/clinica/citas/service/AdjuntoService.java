package com.clinica.citas.service;

import com.clinica.citas.model.Adjunto;
import com.clinica.citas.model.Consulta;
import com.clinica.citas.repository.AdjuntoRepository;
import com.clinica.citas.repository.ConsultaRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class AdjuntoService {

    private static final Set<String> PERMITIDOS = Set.of("pdf", "jpg", "jpeg", "png");
    private static final long MAX_BYTES = 10 * 1024 * 1024;

    private final AdjuntoRepository adjuntoRepository;
    private final ConsultaRepository consultaRepository;
    private final Path raiz;

    public AdjuntoService(AdjuntoRepository adjuntoRepository,
                          ConsultaRepository consultaRepository,
                          @Value("${app.uploads.dir:./uploads}") String dir) {
        this.adjuntoRepository = adjuntoRepository;
        this.consultaRepository = consultaRepository;
        this.raiz = Paths.get(dir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.raiz);
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo crear carpeta de uploads: " + this.raiz, e);
        }
    }

    public Adjunto guardar(Long consultaId, MultipartFile file, String username) {
        Consulta consulta = consultaRepository.findById(consultaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Consulta no encontrada"));
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debes adjuntar un archivo");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Máximo 10MB por archivo");
        }
        String original = file.getOriginalFilename() == null ? "archivo" : file.getOriginalFilename();
        String ext = original.contains(".") ? original.substring(original.lastIndexOf('.') + 1).toLowerCase() : "";
        if (!PERMITIDOS.contains(ext)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Tipo no permitido. Usa: PDF, JPG, PNG (imágenes, resultados, remisiones)");
        }
        String guardado = UUID.randomUUID() + "." + ext;
        try {
            Files.copy(file.getInputStream(), raiz.resolve(guardado), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo guardar el archivo");
        }
        Adjunto a = new Adjunto();
        a.setConsulta(consulta);
        a.setNombreOriginal(original);
        a.setNombreGuardado(guardado);
        a.setContentType(file.getContentType());
        a.setTamano(file.getSize());
        a.setSubidoPor(username);
        return adjuntoRepository.save(a);
    }

    public List<Adjunto> listar(Long consultaId) {
        if (!consultaRepository.existsById(consultaId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Consulta no encontrada");
        }
        return adjuntoRepository.findByConsultaIdOrderByFechaDesc(consultaId);
    }

    public AdjuntoRecurso descargar(Long adjuntoId) {
        Adjunto a = adjuntoRepository.findById(adjuntoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Adjunto no encontrado"));
        Path archivo = raiz.resolve(a.getNombreGuardado()).normalize();
        if (!Files.exists(archivo)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Archivo no existe en disco");
        }
        return new AdjuntoRecurso(a, new FileSystemResource(archivo));
    }

    public record AdjuntoRecurso(Adjunto adjunto, Resource recurso) {}
}
