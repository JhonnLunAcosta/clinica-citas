package com.clinica.citas.config;

import com.clinica.citas.model.DiagnosticoCatalogo;
import com.clinica.citas.model.Eps;
import com.clinica.citas.model.Medicamento;
import com.clinica.citas.repository.DiagnosticoCatalogoRepository;
import com.clinica.citas.repository.EpsRepository;
import com.clinica.citas.repository.MedicamentoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// Semilla inicial de uso frecuente en consulta externa Colombia.
// FUENTE: codigos CIE-10 OMS adoptados por MinSalud; medicamentos de la
// lista de esenciales / uso ambulatorio frecuente (dosis segun criterio medico).
// No es el catalogo oficial completo: para produccion cargar CIE-10 completo
// (MinSalud/OMS) y CUM-INVIMA mediante CSV con un job de importacion.
@Configuration
public class CatalogoSeeder {

    @Bean
    CommandLineRunner seedCatalogos(DiagnosticoCatalogoRepository cie10, MedicamentoRepository meds, EpsRepository epsRepo) {
        return args -> {
            if (cie10.count() == 0) {
                String[][] dx = {
                    {"J06.9", "Infeccion aguda de vias respiratorias superiores, no especificada", "Respiratorio"},
                    {"J00", "Rinofaringitis aguda (resfriado comun)", "Respiratorio"},
                    {"J02.9", "Faringitis aguda, no especificada", "Respiratorio"},
                    {"J03.9", "Amigdalitis aguda, no especificada", "Respiratorio"},
                    {"A09", "Gastroenteritis de presunto origen infeccioso", "Infeccioso"},
                    {"N39.0", "Infeccion de vias urinarias", "Genitourinario"},
                    {"I10", "Hipertension arterial esencial", "Cardiovascular"},
                    {"E11", "Diabetes mellitus tipo 2", "Endocrino"},
                    {"E78.5", "Hiperlipidemia no especificada", "Endocrino"},
                    {"E66.9", "Obesidad, no especificada", "Endocrino"},
                    {"M54.5", "Lumbago no especificado", "Osteomuscular"},
                    {"M25.5", "Dolor articular", "Osteomuscular"},
                    {"M79.1", "Mialgia", "Osteomuscular"},
                    {"R51", "Cefalea", "Sintomas"},
                    {"R10.4", "Dolor abdominal no especificado", "Sintomas"},
                    {"R50.9", "Fiebre no especificada", "Sintomas"},
                    {"K29.7", "Gastritis no especificada", "Digestivo"},
                    {"K30", "Dispepsia funcional", "Digestivo"},
                    {"L30.9", "Dermatitis no especificada", "Piel"},
                    {"H10.9", "Conjuntivitis no especificada", "Ojos"},
                    {"F32.9", "Episodio depresivo no especificado", "Salud mental"},
                    {"F41.9", "Trastorno de ansiedad no especificado", "Salud mental"},
                    {"Z00.0", "Examen medico general", "Control"},
                    {"Z01.7", "Examen de laboratorio", "Control"},
                };
                for (String[] r : dx) {
                    if (!cie10.existsByCodigo(r[0])) cie10.save(new DiagnosticoCatalogo(r[0], r[1], r[2]));
                }
            }
            if (meds.count() == 0) {
                String[][] mm = {
                    {"MED001", "Acetaminofen", "500 mg", "Tableta", "Oral"},
                    {"MED002", "Ibuprofeno", "400 mg", "Tableta", "Oral"},
                    {"MED003", "Amoxicilina", "500 mg", "Capsula", "Oral"},
                    {"MED004", "Azitromicina", "500 mg", "Tableta", "Oral"},
                    {"MED005", "Loratadina", "10 mg", "Tableta", "Oral"},
                    {"MED006", "Omeprazol", "20 mg", "Capsula", "Oral"},
                    {"MED007", "Losartan", "50 mg", "Tableta", "Oral"},
                    {"MED008", "Enalapril", "10 mg", "Tableta", "Oral"},
                    {"MED009", "Metformina", "850 mg", "Tableta", "Oral"},
                    {"MED010", "Atorvastatina", "20 mg", "Tableta", "Oral"},
                    {"MED011", "Salbutamol", "100 mcg/dosis", "Inhalador", "Inhalatoria"},
                    {"MED012", "Sueros de rehidratacion oral", "Sobre", "Polvo", "Oral"},
                    {"MED013", "Naproxeno", "500 mg", "Tableta", "Oral"},
                    {"MED014", "Diclofenaco", "50 mg", "Tableta", "Oral"},
                    {"MED015", "Fluconazol", "150 mg", "Capsula", "Oral"},
                    {"MED016", "Albendazol", "400 mg", "Tableta", "Oral"},
                    {"MED017", "Cetirizina", "10 mg", "Tableta", "Oral"},
                    {"MED018", "Ranitidina", "150 mg", "Tableta", "Oral"},
                    {"MED019", "Levotiroxina", "50 mcg", "Tableta", "Oral"},
                    {"MED020", "Amlodipino", "5 mg", "Tableta", "Oral"},
                };
                for (String[] r : mm) {
                    if (!meds.existsByCodigo(r[0])) {
                        meds.save(new Medicamento(r[0], r[1], r[2], r[3], r[4]));
                    }
                }
            }
            if (epsRepo.count() == 0) {
                // EPS con operacion nacional. El mapa cambia (intervenciones/liquidaciones
                // Supersalud), por eso la tabla tiene flag 'activa' para depurar sin borrar.
                String[][] ee = {
                    {"EPS001", "Nueva EPS"},
                    {"EPS002", "Sanitas EPS"},
                    {"EPS003", "Sura EPS"},
                    {"EPS004", "Salud Total EPS"},
                    {"EPS005", "Famisanar EPS"},
                    {"EPS006", "Compensar EPS"},
                    {"EPS007", "Coosalud EPS"},
                    {"EPS008", "Mutual Ser EPS"},
                    {"EPS009", "Cajacopi EPS"},
                    {"EPS010", "Capital Salud EPS"},
                    {"EPS011", "Savia Salud EPS"},
                    {"EPS012", "Aliansalud EPS"},
                    {"EPS013", "Salud Bolívar EPS"},
                    {"EPS014", "Dusakawi EPSI"},
                    {"EPS015", "Mallamas EPSI"},
                    {"EPS016", "Pijaos Salud EPSI"},
                    {"EPS017", "Asmet Salud EPS"},
                    {"EPS018", "Emssanar EPS"},
                    {"EPS019", "Fuerzas Militares"},
                    {"EPS020", "Policía Nacional"},
                    {"EPS021", "Magisterio (Fomag)"},
                    {"EPS022", "Ecopetrol"},
                    {"EPS000", "Particular / Sin afiliación"},
                };
                for (String[] r : ee) {
                    if (!epsRepo.existsByCodigo(r[0])) epsRepo.save(new Eps(r[0], r[1]));
                }
            }
        };
    }
}
