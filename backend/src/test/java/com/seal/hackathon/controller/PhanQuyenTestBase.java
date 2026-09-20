package com.seal.hackathon.controller;

import com.seal.hackathon.domain.enums.RoleName;
import com.seal.hackathon.security.AuthenticatedPrincipal;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Tiện ích dùng chung cho các lớp kiểm thử phân quyền ở tầng controller.
 *
 * Vì sao lớp test này cần tồn tại: test service gọi thẳng vào phương thức Java
 * nên {@code @PreAuthorize} KHÔNG hề chạy. Một endpoint quên dán annotation vẫn
 * xanh hết mọi test service. Đó đúng là cách lỗ hổng
 * {@code /api/ai/submissions/{id}/analyze} và {@code /distribution} từng lọt lưới.
 */
abstract class PhanQuyenTestBase {

    /** Một người dùng đã đăng nhập, mang đúng những vai trò được liệt kê. */
    protected static Authentication nguoiDung(RoleName... vaiTro) {
        List<AuthenticatedPrincipal.RoleGrant> grants = Arrays.stream(vaiTro)
                .map(r -> new AuthenticatedPrincipal.RoleGrant(r, null, null, null))
                .collect(Collectors.toList());
        AuthenticatedPrincipal principal = new AuthenticatedPrincipal(
                UUID.randomUUID(), "user@example.com", "Nguoi dung", grants);
        List<GrantedAuthority> quyen = Arrays.stream(vaiTro)
                .map(r -> (GrantedAuthority) new SimpleGrantedAuthority("ROLE_" + r.name()))
                .collect(Collectors.toList());
        return new UsernamePasswordAuthenticationToken(principal, null, quyen);
    }

    protected static Authentication banToChuc() {
        return nguoiDung(RoleName.COORDINATOR);
    }

    protected static Authentication giamKhao() {
        return nguoiDung(RoleName.JUDGE);
    }

    protected static Authentication mentor() {
        return nguoiDung(RoleName.MENTOR);
    }

    protected static Authentication thiSinh() {
        return nguoiDung(RoleName.TEAM_MEMBER);
    }
}
