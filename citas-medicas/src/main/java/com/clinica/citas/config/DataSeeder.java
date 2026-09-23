package com.clinica.citas.config;

import com.clinica.citas.model.Usuario;
import com.clinica.citas.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedUsers(UsuarioRepository usuarios, PasswordEncoder encoder) {
        return args -> {
            if (!usuarios.existsByUsername("admin")) {
                Usuario admin = new Usuario();
                admin.setUsername("admin");
                admin.setPassword(encoder.encode("admin123"));
                admin.setRol("ADMIN");
                usuarios.save(admin);
            }
            if (!usuarios.existsByUsername("recepcion")) {
                Usuario r = new Usuario();
                r.setUsername("recepcion");
                r.setPassword(encoder.encode("recepcion123"));
                r.setRol("USER");
                usuarios.save(r);
            }
        };
    }
}
