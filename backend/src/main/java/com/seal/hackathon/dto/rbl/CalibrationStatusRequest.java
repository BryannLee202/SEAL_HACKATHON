package com.seal.hackathon.dto.rbl;

import jakarta.validation.constraints.NotNull;

/**
 * Đóng hoặc mở lại một phiên hiệu chuẩn.
 *
 * Dùng một cờ boolean thay vì hai endpoint /close và /reopen riêng: ban tổ
 * chức lỡ tay đóng nhầm thì mở lại được ngay, không rơi vào ngõ cụt.
 */
public record CalibrationStatusRequest(
        @NotNull Boolean active
) {
}
