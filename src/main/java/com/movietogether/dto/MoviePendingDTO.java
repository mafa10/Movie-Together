package com.movietogether.dto;

import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.movietogether.model.Movie;

public class MoviePendingDTO {

    // @JsonUnwrapped "aplana" los campos de Movie (title, posterPath, etc.)
    // al mismo nivel que pendingCount en el JSON de salida, para no romper
    // el código del frontend que ya lee esos campos directo (m.title, m.posterPath...).
    @JsonUnwrapped
    private Movie movie;

    private int pendingCount;

    public MoviePendingDTO() {}

    public MoviePendingDTO(Movie movie, int pendingCount) {
        this.movie = movie;
        this.pendingCount = pendingCount;
    }

    public Movie getMovie() { return movie; }
    public void setMovie(Movie movie) { this.movie = movie; }

    public int getPendingCount() { return pendingCount; }
    public void setPendingCount(int pendingCount) { this.pendingCount = pendingCount; }
}