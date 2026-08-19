package com.movietogether.service;

import com.movietogether.model.Movie;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class LetterboxdImportService {

    // Cantidad de llamadas a TMDB que se disparan en simultáneo.
    // Un número muy alto puede hacer que TMDB empiece a devolver error 429 (rate limit).
    private static final int TMDB_CONCURRENCY = 8;

    private final TmdbService tmdbService;

    public LetterboxdImportService(TmdbService tmdbService) {
        this.tmdbService = tmdbService;
    }

    public List<Movie> importFromZip(MultipartFile file) throws IOException {
        List<Movie> movies = new ArrayList<>();

        try (ZipInputStream zis = new ZipInputStream(file.getInputStream())) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if (entry.getName().equals("watchlist.csv")) {
                    movies = parseWatchlistCsv(new BufferedReader(new InputStreamReader(zis)));
                    break;
                }
            }
        }

        // Enriquecemos todas las películas en paralelo (hasta TMDB_CONCURRENCY a la vez)
        // en vez de una por una, que es lo que hacía que la carga tardara tanto.
        List<Movie> enrichedMovies = Flux.fromIterable(movies)
                .flatMap(tmdbService::enrichMovieReactive, TMDB_CONCURRENCY)
                .collectList()
                .block();

        return enrichedMovies;
    }

    private List<Movie> parseWatchlistCsv(BufferedReader reader) throws IOException {
        List<Movie> movies = new ArrayList<>();

        CSVFormat format = CSVFormat.DEFAULT
                .builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .setIgnoreHeaderCase(true)
                .setTrim(true)
                .build();

        try (CSVParser parser = new CSVParser(reader, format)) {
            for (CSVRecord record : parser) {
                Movie movie = new Movie();
                movie.setDateAdded(record.get("Date"));
                movie.setTitle(record.get("Name"));
                movie.setYear(Integer.parseInt(record.get("Year")));
                movie.setLetterboxdUri(record.get("Letterboxd URI"));
                movies.add(movie);
            }
        }

        return movies;
    }
}