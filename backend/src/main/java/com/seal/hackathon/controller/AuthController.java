package com.seal.hackathon.controller;

import com.seal.hackathon.dto.auth.AuthResponse;
import com.seal.hackathon.dto.auth.LoginRequest;
import com.seal.hackathon.dto.auth.RefreshTokenRequest;
import com.seal.hackathon.dto.auth.RegisterRequest;
import com.seal.hackathon.dto.auth.UserSummaryResponse;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.security.AuthenticatedPrincipal;
import com.seal.hackathon.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserSummaryResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refresh(request.refreshToken()));
    }

    /**
     * Thông tin phiên đang đăng nhập.
     *
     * Trả 401 khi chưa đăng nhập, chứ không phải 200 với thân rỗng.
     *
     * SecurityConfig cho {@code /api/auth/**} đi qua bằng permitAll (để còn
     * đăng nhập được), nên khách vãng lai vẫn vào tới đây và {@code principal}
     * là null. Trước đây hàm này trả {@code ok(null)} — đo thực tế ra 200 với
     * thân 0 byte, và axios biến nó thành chuỗi rỗng.
     *
     * Hậu quả: AuthContext đặt user = "" thay vì null, nên phép kiểm
     * {@code userRef.current !== null} ở dòng 55 thành true với người CHƯA TỪNG
     * đăng nhập — đúng thứ mà ghi chú ở dòng 51 nói là muốn tránh ("anonymous
     * visitors ... shouldn't be redirected anywhere"). Ghi chú đó vốn đã mô tả
     * hành vi 401; nay mã nguồn khớp lại với nó.
     */
    @GetMapping("/me")
    public ResponseEntity<AuthenticatedPrincipal> me(@AuthenticationPrincipal AuthenticatedPrincipal principal) {
        if (principal == null) {
            throw ApiException.unauthorized("Chưa đăng nhập");
        }
        return ResponseEntity.ok(principal);
    }
}
