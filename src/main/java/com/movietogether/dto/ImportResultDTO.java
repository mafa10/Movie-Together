package com.movietogether.dto;

import com.movietogether.model.Movie;
import java.util.List;

public class ImportResultDTO {
    private int moviesFound;
    private int moviesMatched;
    private String message;
    private List<Movie> movies;

    public ImportResultDTO() {}

    public int getMoviesFound() { return moviesFound; }
    public void setMoviesFound(int moviesFound) { this.moviesFound = moviesFound; }

    public int getMoviesMatched() { return moviesMatched; }
    public void setMoviesMatched(int moviesMatched) { this.moviesMatched = moviesMatched; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public List<Movie> getMovies() { return movies; }
    public void setMovies(List<Movie> movies) { this.movies = movies; }
}