package com.movietogether.service;

import com.movietogether.model.Movie;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TmdbService {

    private final WebClient webClient;
    private final String apiKey;

    public TmdbService(@Value("${tmdb.api.key}") String apiKey,
                       @Value("${tmdb.api.base-url}") String baseUrl) {
        this.apiKey = apiKey;
        this.webClient = WebClient.builder().baseUrl(baseUrl).build();
    }

    /**
     * Versión reactiva (no bloqueante) que encadena la búsqueda y el detalle de una
     * película sin frenar el hilo. Se usa para poder enriquecer muchas películas en
     * paralelo desde LetterboxdImportService.
     */
    @SuppressWarnings("unchecked")
    public Mono<Movie> enrichMovieReactive(Movie movie) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search/movie")
                        .queryParam("api_key", apiKey)
                        .queryParam("query", movie.getTitle())
                        .queryParam("year", movie.getYear())
                        .queryParam("language", "es-ES")
                        .build())
                .retrieve()
                .bodyToMono(Map.class)
                .flatMap(response -> {
                    List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
                    if (results == null || results.isEmpty()) {
                        return Mono.just(movie);
                    }

                    Map<String, Object> firstResult = results.get(0);
                    movie.setTmdbId(((Number) firstResult.get("id")).longValue());
                    movie.setPosterPath((String) firstResult.get("poster_path"));
                    movie.setBackdropPath((String) firstResult.get("backdrop_path"));
                    movie.setOverview((String) firstResult.get("overview"));
                    movie.setVoteAverage((Double) firstResult.get("vote_average"));

                    return fetchMovieDetailsReactive(movie);
                })
                .onErrorResume(e -> {
                    System.err.println("Error buscando en TMDB: " + movie.getTitle() + " - " + e.getMessage());
                    return Mono.just(movie);
                });
    }

    @SuppressWarnings("unchecked")
    private Mono<Movie> fetchMovieDetailsReactive(Movie movie) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/movie/{id}")
                        .queryParam("api_key", apiKey)
                        .queryParam("language", "es-ES")
                        .build(movie.getTmdbId()))
                .retrieve()
                .bodyToMono(Map.class)
                .map(details -> {
                    List<Map<String, Object>> genres = (List<Map<String, Object>>) details.get("genres");
                    if (genres != null) {
                        String genreNames = genres.stream()
                                .map(g -> (String) g.get("name"))
                                .collect(Collectors.joining(","));
                        movie.setGenres(genreNames);
                    }
                    return movie;
                })
                .onErrorResume(e -> {
                    System.err.println("Error obteniendo detalles de TMDB para ID: " + movie.getTmdbId());
                    return Mono.just(movie);
                });
    }

    /**
     * Versión bloqueante, se mantiene por si algo más del código la usa.
     */
    public Movie enrichMovie(Movie movie) {
        return enrichMovieReactive(movie).block();
    }
}