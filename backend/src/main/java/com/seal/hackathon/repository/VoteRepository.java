package com.seal.hackathon.repository;

import com.seal.hackathon.domain.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VoteRepository extends JpaRepository<Vote, UUID> {

    boolean existsByTrackIdAndVoterIdHash(UUID trackId, String voterIdHash);

    Optional<Vote> findByTrackIdAndVoterIdHash(UUID trackId, String voterIdHash);

    void deleteByTrackIdAndVoterIdHash(UUID trackId, String voterIdHash);

    long countByTrackIdAndIpHash(UUID trackId, String ipHash);

    long countByTeamId(UUID teamId);

    @Query("SELECT v.team.id AS teamId, COUNT(v) AS voteCount FROM Vote v WHERE v.track.id = :trackId GROUP BY v.team.id")
    List<TeamVoteCount> countGroupedByTeamForTrack(@Param("trackId") UUID trackId);

    interface TeamVoteCount {
        UUID getTeamId();
        Long getVoteCount();
    }
}
