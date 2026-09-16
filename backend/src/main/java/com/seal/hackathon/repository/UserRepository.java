package com.seal.hackathon.repository;

import com.seal.hackathon.domain.entity.User;
import com.seal.hackathon.domain.enums.AccountStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    Page<User> findByAccountStatus(AccountStatus status, Pageable pageable);
    Page<User> findByAccountStatusOrderByCreatedAtDesc(AccountStatus status, Pageable pageable);
}
