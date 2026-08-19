package com.movietogether.controller;

import com.movietogether.dto.ImportResultDTO;
import com.movietogether.model.Movie;
import com.movietogether.service.LetterboxdImportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/import")
public class LetterboxdController {

    private final LetterboxdImportService importService;

    public LetterboxdController(LetterboxdImportService importService) {
        this.importService = importService;
    }

    @PostMapping("/letterboxd")
    public ResponseEntity<ImportResultDTO> importLetterboxd(@RequestParam("file") MultipartFile file) {
        try {
            List<Movie> movies = importService.importFromZip(file);

            long matched = movies.stream().filter(m -> m.getTmdbId() != null).count();

            ImportResultDTO result = new ImportResultDTO();
            result.setMoviesFound(movies.size());
            result.setMoviesMatched((int) matched);
            result.setMessage("Watchlist importada correctamente");
            result.setMovies(movies);

            return ResponseEntity.ok(result);
        } catch (IOException e) {
            ImportResultDTO error = new ImportResultDTO();
            error.setMoviesFound(0);
            error.setMoviesMatched(0);
            error.setMessage("Error al procesar el archivo: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}