package com.seal.hackathon.dto.event;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.util.UUID;

public record EventRequest(
        @NotBlank String name,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        UUID baseCriteriaTemplateId,
        /**
         * Có bật mô-đun nghiên cứu RBL cho sự kiện này không. Bỏ trống nghĩa là không.
         *
         * Dùng {@code Boolean} chứ không phải {@code boolean}: Jackson phải gọi hàm
         * dựng chuẩn của record với đủ mọi thành phần, nên một trường KHÔNG được
         * gửi lên sẽ thành {@code null} — và null không ép được về kiểu nguyên thuỷ.
         * Kết quả là toàn bộ yêu cầu bị từ chối chứ không phải trường đó nhận giá
         * trị mặc định.
         *
         * Form tạo sự kiện ở giao diện (EventsPage.tsx dòng 210) chỉ gửi name,
         * description, startDate và endDate — không có trường này. Nên trước khi
         * sửa, ban tổ chức KHÔNG tạo được sự kiện nào từ giao diện.
         */
        Boolean rblEnabled
) {

    /** Bỏ trống thì mặc định là không bật. */
    public boolean rblEnabledOrDefault() {
        return Boolean.TRUE.equals(rblEnabled);
    }
}
