package com.seal.hackathon.repository;

import com.seal.hackathon.domain.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TeamMemberRepository extends JpaRepository<TeamMember, UUID> {
    List<TeamMember> findByTeamId(UUID teamId);

    /**
     * Thành viên của NHIỀU đội trong một truy vấn.
     *
     * Dùng cho các màn liệt kê đội: trước đây mỗi đội tốn một câu riêng nên
     * trang 6 đội là 6 câu, sự kiện 60 đội là 60 câu.
     */
    List<TeamMember> findByTeamIdIn(List<UUID> teamIds);
    List<TeamMember> findByUserId(UUID userId);
    Optional<TeamMember> findByTeamIdAndUserId(UUID teamId, UUID userId);
    boolean existsByTeamIdAndUserId(UUID teamId, UUID userId);
    long countByTeamId(UUID teamId);
}
