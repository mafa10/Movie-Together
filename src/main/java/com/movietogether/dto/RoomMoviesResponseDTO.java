package com.movietogether.dto;

import java.util.List;

public class RoomMoviesResponseDTO {
    private int totalParticipants;
    private List<MoviePendingDTO> movies;

    public RoomMoviesResponseDTO() {}

    public RoomMoviesResponseDTO(int totalParticipants, List<MoviePendingDTO> movies) {
        this.totalParticipants = totalParticipants;
        this.movies = movies;
    }

    public int getTotalParticipants() { return totalParticipants; }
    public void setTotalParticipants(int totalParticipants) { this.totalParticipants = totalParticipants; }

    public List<MoviePendingDTO> getMovies() { return movies; }
    public void setMovies(List<MoviePendingDTO> movies) { this.movies = movies; }
}