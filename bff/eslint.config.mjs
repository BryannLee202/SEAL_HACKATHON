// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

/**
 * Cấu hình ESLint cho BFF.
 *
 * Trước đây package.json có sẵn script "lint" và đủ cả ba gói (eslint,
 * typescript-eslint, eslint-config-prettier) nhưng KHÔNG có file cấu hình nào,
 * nên `npm run lint` luôn dừng ngay với:
 *
 *   ESLint couldn't find an eslint.config.* file.
 *
 * Nghĩa là tầng BFF chưa từng được soát lần nào, dù lệnh vẫn nằm đó và trông
 * như đang chạy.
 *
 * Dùng định dạng flat config vì ESLint từ v9 không đọc .eslintrc nữa, và dự án
 * đang ở ESLint v10.
 */
export default tseslint.config(
  {
    // Không soát sản phẩm biên dịch và thư viện.
    ignores: ["dist/**", "node_modules/**", "coverage/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        process: "readonly",
        console: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
      },
    },
    rules: {
      // Tham số bắt đầu bằng _ là cố ý không dùng (ví dụ chữ ký của middleware
      // Express đòi đủ bốn tham số mới nhận ra là error handler).
      //
      // ignoreRestSiblings là bắt buộc ở đây, không phải để cho dễ: AuthController
      // dùng đúng cách destructure-để-loại-bỏ nhằm bóc accessToken và refreshToken
      // ra khỏi thân trả về —
      //
      //     const { accessToken, refreshToken, ...publicResult } = result;
      //
      // Token đi vào cookie httpOnly, còn publicResult là phần gửi cho trình
      // duyệt. Hai biến đó CỐ Ý không dùng; đổi tên chúng thành _accessToken chỉ
      // để chiều bộ soát sẽ làm mờ đi ý đồ của đoạn quan trọng nhất tầng BFF.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
    },
  },
  {
    // Các file cấu hình .cjs chạy bằng CommonJS nên có module/require sẵn.
    files: ["**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
      globals: { module: "readonly", require: "readonly", __dirname: "readonly" },
    },
  },
  {
    // File kiểm thử dùng nhiều any khi dựng dữ liệu giả — không đáng chặn.
    files: ["**/*.spec.ts", "**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  prettier,
);
