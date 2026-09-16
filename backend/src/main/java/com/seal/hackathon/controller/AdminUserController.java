package com.seal.hackathon.controller;

import com.seal.hackathon.dto.auth.ApproveUserRequest;
import com.seal.hackathon.dto.auth.CreateGuestJudgeRequest;
import com.seal.hackathon.dto.auth.GuestJudgeCreatedResponse;
import com.seal.hackathon.dto.auth.UserSummaryResponse;
import com.seal.hackathon.security.AuthenticatedPrincipal;
import com.seal.hackathon.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('COORDINATOR')")
public class AdminUserController {

    private final AuthService authService;

    public AdminUserController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/pending")
    public ResponseEntity<Page<UserSummaryResponse>> listPending(@PageableDefault(size = 200) Pageable pageable) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                .header(HttpHeaders.PRAGMA, "no-cache")
                .header(HttpHeaders.EXPIRES, "0")
                .body(authService.listPending(pageable));
    }

    @GetMapping("/approved")
    public ResponseEntity<Page<UserSummaryResponse>> listApproved(@PageableDefault(size = 200) Pageable pageable) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                .header(HttpHeaders.PRAGMA, "no-cache")
                .header(HttpHeaders.EXPIRES, "0")
                .body(authService.listApproved(pageable));
    }

    @PostMapping("/{userId}/approval")
    public UserSummaryResponse approve(
            @PathVariable UUID userId,
            @RequestBody ApproveUserRequest request,
            @AuthenticationPrincipal AuthenticatedPrincipal principal
    ) {
        return authService.approve(userId, request.approve(), request.rejectionReason(), principal.userId());
    }

    @PostMapping("/guest-judges")
    @ResponseStatus(HttpStatus.CREATED)
    public GuestJudgeCreatedResponse createGuestJudge(
            @Valid @RequestBody CreateGuestJudgeRequest request,
            @AuthenticationPrincipal AuthenticatedPrincipal principal
    ) {
        return authService.createGuestJudge(request, principal.userId());
    }
}
