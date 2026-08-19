package com.movietogether.repository;

import com.movietogether.model.RoomMovie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomMovieRepository extends JpaRepository<RoomMovie, Long> {
    List<RoomMovie> findByRoomCode(String roomCode);
}