package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.User;
import com.seal.hackathon.domain.entity.UserRoleAssignment;
import com.seal.hackathon.domain.enums.AccountStatus;
import com.seal.hackathon.domain.enums.RoleName;
import com.seal.hackathon.domain.enums.ScopeType;
import com.seal.hackathon.domain.enums.AuditAction;
import com.seal.hackathon.domain.enums.UserCategory;
import com.seal.hackathon.dto.auth.AuthResponse;
import com.seal.hackathon.dto.auth.CreateGuestJudgeRequest;
import com.seal.hackathon.dto.auth.GuestJudgeCreatedResponse;
import com.seal.hackathon.dto.auth.LoginRequest;
import com.seal.hackathon.dto.auth.RegisterRequest;
import com.seal.hackathon.dto.auth.UserSummaryResponse;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.UserRepository;
import com.seal.hackathon.repository.UserRoleAssignmentRepository;
import com.seal.hackathon.security.AuthenticatedPrincipal;
import com.seal.hackathon.security.JwtService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserRoleAssignmentRepository roleAssignmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditService auditService;

    public AuthService(
            UserRepository userRepository,
            UserRoleAssignmentRepository roleAssignmentRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuditService auditService
    ) {
        this.userRepository = userRepository;
        this.roleAssignmentRepository = roleAssignmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.auditService = auditService;
    }

    @Transactional
    public UserSummaryResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw ApiException.conflict("Email đã được sử dụng để đăng ký");
        }
        User user = User.builder()
                .fullName(request.fullName())
                .email(request.email().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.password()))
                .userCategory(request.userCategory())
                .studentCode(request.studentCode())
                .schoolName(request.schoolName())
                .accountStatus(AccountStatus.PENDING)
                .guestJudge(false)
                .build();
        user = userRepository.save(user);

        // Mọi thí sinh được duyệt đều bắt đầu với TEAM_MEMBER ở phạm vi GLOBAL.
        //
        // KHÔNG có vai trò TEAM_LEADER trong user_role_assignment: vai trò trong
        // đội nằm ở team_member.role_in_team, và đó mới là nguồn duy nhất quyết
        // định ai là đội trưởng. Ghi chú cũ ở đây nói TEAM_LEADER "được gán ngầm
        // khi tạo đội" — điều đó chưa bao giờ đúng, TeamService.create() không
        // gán gì cả. Giao diện từng tin theo ghi chú này và gọi
        // hasRole("TEAM_LEADER"), khiến mọi thao tác của đội trưởng bị chặn.
        UserRoleAssignment defaultRole = UserRoleAssignment.builder()
                .user(user)
                .roleName(RoleName.TEAM_MEMBER)
                .scopeType(ScopeType.GLOBAL)
                .scopeId(null)
                .build();
        roleAssignmentRepository.save(defaultRole);

        auditService.record(user.getId(), AuditAction.ACCOUNT_REGISTER, "User", user.getId(), null, UserSummaryResponse.from(user));
        return UserSummaryResponse.from(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> ApiException.unauthorized("Email hoặc mật khẩu không đúng"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw ApiException.unauthorized("Email hoặc mật khẩu không đúng");
        }
        if (user.getAccountStatus() != AccountStatus.APPROVED) {
            throw ApiException.forbidden("Tài khoản chưa được Ban tổ chức phê duyệt (trạng thái: " + user.getAccountStatus() + ")");
        }
        if (user.isGuestJudge() && user.getGuestAccessExpiresAt() != null && user.getGuestAccessExpiresAt().isBefore(Instant.now())) {
            throw ApiException.forbidden("Tài khoản giám khảo khách mời đã hết hạn truy cập");
        }

        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse refresh(String refreshToken) {
        var claims = jwtService.parseClaims(refreshToken);
        if (!"refresh".equals(claims.get("type", String.class))) {
            throw ApiException.unauthorized("Token không hợp lệ");
        }
        UUID userId = UUID.fromString(claims.getSubject());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.unauthorized("Người dùng không tồn tại"));
        if (user.getAccountStatus() != AccountStatus.APPROVED) {
            throw ApiException.forbidden("Tài khoản chưa được phê duyệt");
        }
        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public Page<UserSummaryResponse> listPending(Pageable pageable) {
        return userRepository.findByAccountStatusOrderByCreatedAtDesc(AccountStatus.PENDING, pageable)
                .map(UserSummaryResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<UserSummaryResponse> listApproved(Pageable pageable) {
        return userRepository.findByAccountStatusOrderByCreatedAtDesc(AccountStatus.APPROVED, pageable)
                .map(UserSummaryResponse::from);
    }

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#";

    @Transactional
    public GuestJudgeCreatedResponse createGuestJudge(CreateGuestJudgeRequest request, UUID actorId) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw ApiException.conflict("Email đã được sử dụng");
        }
        String tempPassword = generateTempPassword();
        User user = User.builder()
                .fullName(request.fullName())
                .email(request.email().toLowerCase())
                .passwordHash(passwordEncoder.encode(tempPassword))
                .userCategory(UserCategory.STAFF)
                .accountStatus(AccountStatus.APPROVED)
                .guestJudge(true)
                .guestAccessExpiresAt(request.guestAccessExpiresAt())
                .build();
        user = userRepository.save(user);

        auditService.record(actorId, AuditAction.GUEST_JUDGE_CREATE, "User", user.getId(), null, UserSummaryResponse.from(user));
        return new GuestJudgeCreatedResponse(user.getId(), user.getFullName(), user.getEmail(), tempPassword);
    }

    private String generateTempPassword() {
        StringBuilder sb = new StringBuilder(12);
        for (int i = 0; i < 12; i++) {
            sb.append(PASSWORD_CHARS.charAt(RANDOM.nextInt(PASSWORD_CHARS.length())));
        }
        return sb.toString();
    }

    @Transactional
    public UserSummaryResponse approve(UUID userId, boolean approve, String rejectionReason, UUID actorId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));
        AccountStatus before = user.getAccountStatus();
        if (approve) {
            user.setAccountStatus(AccountStatus.APPROVED);
            user.setRejectionReason(null);
        } else {
            user.setAccountStatus(AccountStatus.REJECTED);
            user.setRejectionReason(rejectionReason);
        }
        user = userRepository.save(user);
        auditService.record(actorId,
                approve ? AuditAction.ACCOUNT_APPROVE : AuditAction.ACCOUNT_REJECT,
                "User", user.getId(), before, user.getAccountStatus());
        return UserSummaryResponse.from(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        List<UserRoleAssignment> assignments = roleAssignmentRepository.findByUserId(user.getId());
        List<AuthenticatedPrincipal.RoleGrant> grants = assignments.stream()
                .map(a -> new AuthenticatedPrincipal.RoleGrant(a.getRoleName(), a.getScopeType(), a.getScopeId(), a.getJudgeType()))
                .collect(Collectors.toList());
        AuthenticatedPrincipal principal = new AuthenticatedPrincipal(user.getId(), user.getEmail(), user.getFullName(), grants);

        String accessToken = jwtService.generateAccessToken(principal);
        String refreshToken = jwtService.generateRefreshToken(user.getId());
        List<String> roleNames = grants.stream().map(g -> g.roleName().name()).distinct().collect(Collectors.toList());

        return new AuthResponse(accessToken, refreshToken, user.getId(), user.getFullName(), user.getEmail(), roleNames);
    }
}
