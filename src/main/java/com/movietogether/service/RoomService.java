package com.movietogether.service;

import com.movietogether.dto.ImportResultDTO;
import com.movietogether.dto.MoviePendingDTO;
import com.movietogether.dto.ParticipantDTO;
import com.movietogether.dto.RoomMoviesResponseDTO;
import com.movietogether.model.Movie;
import com.movietogether.model.Room;
import com.movietogether.model.RoomMovie;
import com.movietogether.repository.MovieRepository;
import com.movietogether.repository.RoomMovieRepository;
import com.movietogether.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final MovieRepository movieRepository;
    private final RoomMovieRepository roomMovieRepository;
    private final LetterboxdImportService importService;
    private final Random random = new Random();

    public RoomService(RoomRepository roomRepository,
                       MovieRepository movieRepository,
                       RoomMovieRepository roomMovieRepository,
                       LetterboxdImportService importService) {
        this.roomRepository = roomRepository;
        this.movieRepository = movieRepository;
        this.roomMovieRepository = roomMovieRepository;
        this.importService = importService;
    }

    public Room createRoom() {
        String code;
        do {
            code = generateCode();
        } while (roomRepository.findByCode(code).isPresent());

        Room room = new Room();
        room.setCode(code);
        room.setCreatedAt(LocalDateTime.now());
        return roomRepository.save(room);
    }

    public ImportResultDTO importToRoom(String code, String username, MultipartFile file) throws IOException {
        Room room = roomRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Sala no encontrada: " + code));

        List<Movie> movies = importService.importFromZip(file);
        List<Movie> savedMovies = new ArrayList<>();

        for (Movie movie : movies) {
            // Si TMDB no encontró coincidencia, tmdbId queda null: la salteamos
            // en vez de guardarla (evita romper el índice único de tmdbId).
            if (movie.getTmdbId() == null) {
                continue;
            }

            Movie savedMovie = movieRepository.findByTmdbId(movie.getTmdbId())
                    .orElseGet(() -> movieRepository.save(movie));

            RoomMovie roomMovie = new RoomMovie();
            roomMovie.setRoom(room);
            roomMovie.setMovie(savedMovie);
            roomMovie.setUsername(username);
            roomMovieRepository.save(roomMovie);

            savedMovies.add(savedMovie);
        }

        ImportResultDTO result = new ImportResultDTO();
        result.setMoviesFound(movies.size());
        result.setMoviesMatched(savedMovies.size());
        result.setMovies(savedMovies);
        result.setMessage(savedMovies.size() == movies.size()
                ? "¡Watchlist importada correctamente!"
                : "Watchlist importada: " + savedMovies.size() + " de " + movies.size() + " películas encontradas en TMDB");

        return result;
    }

    public List<ParticipantDTO> getParticipants(String code) {
        roomRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Sala no encontrada: " + code));

        List<RoomMovie> roomMovies = roomMovieRepository.findByRoomCode(code);

        Map<String, Long> countByUser = roomMovies.stream()
                .collect(Collectors.groupingBy(RoomMovie::getUsername, Collectors.counting()));

        return countByUser.entrySet().stream()
                .map(e -> new ParticipantDTO(e.getKey(), e.getValue().intValue()))
                .sorted(Comparator.comparing(ParticipantDTO::getUsername, String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());
    }

    /**
     * Devuelve TODAS las películas cargadas en la sala (sin duplicados, sin exigir
     * que estén en el 100% de las listas), cada una con la cantidad de personas
     * distintas que la tienen pendiente. El frontend decide con esos datos qué
     * subconjunto mostrar (todas, o solo las que están en el 100% de las listas).
     */
    public RoomMoviesResponseDTO getRoomMovies(String code) {
        roomRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Sala no encontrada: " + code));

        List<RoomMovie> roomMovies = roomMovieRepository.findByRoomCode(code);

        Map<Long, Movie> movieById = new LinkedHashMap<>();
        Map<Long, Set<String>> usersByMovieId = new HashMap<>();

        for (RoomMovie rm : roomMovies) {
            Long id = rm.getMovie().getTmdbId();
            movieById.putIfAbsent(id, rm.getMovie());
            usersByMovieId.computeIfAbsent(id, k -> new HashSet<>()).add(rm.getUsername());
        }

        int totalParticipants = roomMovies.stream()
                .map(RoomMovie::getUsername)
                .collect(Collectors.toSet())
                .size();

        List<MoviePendingDTO> movies = movieById.entrySet().stream()
                .map(e -> new MoviePendingDTO(e.getValue(), usersByMovieId.get(e.getKey()).size()))
                .sorted((a, b) -> b.getPendingCount() - a.getPendingCount())
                .collect(Collectors.toList());

        return new RoomMoviesResponseDTO(totalParticipants, movies);
    }

    public List<Movie> getIntersection(String code) {
        Room room = roomRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Sala no encontrada: " + code));

        List<RoomMovie> roomMovies = roomMovieRepository.findByRoomCode(code);

        // Agrupar películas por usuario
        Map<String, Set<Long>> userMovieIds = roomMovies.stream()
                .collect(Collectors.groupingBy(
                        RoomMovie::getUsername,
                        Collectors.mapping(rm -> rm.getMovie().getTmdbId(), Collectors.toSet())
                ));

        if (userMovieIds.size() < 2) {
            return Collections.emptyList();
        }

        // Intersección de todos los sets
        Iterator<Set<Long>> iterator = userMovieIds.values().iterator();
        Set<Long> commonIds = new HashSet<>(iterator.next());
        while (iterator.hasNext()) {
            commonIds.retainAll(iterator.next());
        }

        if (commonIds.isEmpty()) {
            return Collections.emptyList();
        }

        // Devolver las películas completas
        return roomMovies.stream()
                .map(RoomMovie::getMovie)
                .filter(m -> commonIds.contains(m.getTmdbId()))
                .distinct()
                .collect(Collectors.toList());
    }

    public Movie getRandomMovie(String code) {
        List<Movie> intersection = getIntersection(code);
        if (intersection.isEmpty()) {
            return null;
        }
        return intersection.get(random.nextInt(intersection.size()));
    }

    private String generateCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}