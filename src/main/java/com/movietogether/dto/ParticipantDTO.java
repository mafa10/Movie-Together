package com.movietogether.dto;

public class ParticipantDTO {
    private String username;
    private int movieCount;

    public ParticipantDTO() {}

    public ParticipantDTO(String username, int movieCount) {
        this.username = username;
        this.movieCount = movieCount;
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public int getMovieCount() { return movieCount; }
    public void setMovieCount(int movieCount) { this.movieCount = movieCount; }
}