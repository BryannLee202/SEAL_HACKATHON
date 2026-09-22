import { Controller, Get } from "@nestjs/common";

/**
 * Endpoint kiem tra BFF con song hay khong.
 * DEMO_SCRIPT.md huong dan goi GET http://localhost:4000/health truoc buoi demo
 * de xac nhan ca ba service da chay. Dat ngoai tien to /api de khong bi
 * ProxyController bat va chuyen tiep xuong backend.
 */
@Controller("health")
export class HealthController {
  @Get()
  check() {
    return { status: "ok" };
  }
}
