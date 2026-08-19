package com.movietogether.model;

import jakarta.persistence.*;

@Entity
@Table(name = "movies")
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private Long tmdbId;

    @Column(length = 500)
    private String title;

    private int year;

    @Column(length = 500)
    private String letterboxdUri;

    @Column(length = 50)
    private String dateAdded;

    @Column(length = 500)
    private String posterPath;

    @Column(length = 500)
    private String backdropPath;

    @Column(columnDefinition = "TEXT")
    private String overview;

    private Double voteAverage;

    @Column(length = 500)
    private String genres;

    public Movie() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTmdbId() { return tmdbId; }
    public void setTmdbId(Long tmdbId) { this.tmdbId = tmdbId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public String getLetterboxdUri() { return letterboxdUri; }
    public void setLetterboxdUri(String letterboxdUri) { this.letterboxdUri = letterboxdUri; }

    public String getDateAdded() { return dateAdded; }
    public void setDateAdded(String dateAdded) { this.dateAdded = dateAdded; }

    public String getPosterPath() { return posterPath; }
    public void setPosterPath(String posterPath) { this.posterPath = posterPath; }

    public String getBackdropPath() { return backdropPath; }
    public void setBackdropPath(String backdropPath) { this.backdropPath = backdropPath; }

    public String getOverview() { return overview; }
    public void setOverview(String overview) { this.overview = overview; }

    public Double getVoteAverage() { return voteAverage; }
    public void setVoteAverage(Double voteAverage) { this.voteAverage = voteAverage; }

    public String getGenres() { return genres; }
    public void setGenres(String genres) { this.genres = genres; }
}