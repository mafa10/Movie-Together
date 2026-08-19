package com.movietogether.controller;

import com.movietogether.dto.ImportResultDTO;
import com.movietogether.dto.ParticipantDTO;
import com.movietogether.dto.RoomMoviesResponseDTO;
import com.movietogether.model.Movie;
import com.movietogether.model.Room;
import com.movietogether.service.RoomService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping
    public ResponseEntity<Room> createRoom() {
        return ResponseEntity.ok(roomService.createRoom());
    }

    @PostMapping("/{code}/import")
    public ResponseEntity<?> importToRoom(
            @PathVariable String code,
            @RequestParam("username") String username,
            @RequestParam("file") MultipartFile file) {
        try {
            ImportResultDTO result = roomService.importToRoom(code, username, file);
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al procesar: " + e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{code}/movies")
    public ResponseEntity<?> getRoomMovies(@PathVariable String code) {
        try {
            RoomMoviesResponseDTO result = roomService.getRoomMovies(code);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{code}/participants")
    public ResponseEntity<?> getParticipants(@PathVariable String code) {
        try {
            List<ParticipantDTO> participants = roomService.getParticipants(code);
            return ResponseEntity.ok(participants);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{code}/intersection")
    public ResponseEntity<?> getIntersection(@PathVariable String code) {
        try {
            List<Movie> movies = roomService.getIntersection(code);
            return ResponseEntity.ok(Map.of(
                    "count", movies.size(),
                    "movies", movies
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{code}/random")
    public ResponseEntity<?> getRandom(@PathVariable String code) {
        try {
            Movie movie = roomService.getRandomMovie(code);
            if (movie == null) {
                return ResponseEntity.ok(Map.of("message", "No hay películas en común todavía"));
            }
            return ResponseEntity.ok(movie);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}