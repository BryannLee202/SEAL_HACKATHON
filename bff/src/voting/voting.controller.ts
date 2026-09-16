import { Body, Controller, Delete, Get, Param, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { ProxyService } from "../proxy/proxy.service";

export const VOTER_TOKEN_COOKIE = "shms_voter";
const isProd = process.env.NODE_ENV === "production";

@Controller("api/public/voting/tracks/:trackId")
export class VotingController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get("my-vote")
  async getMyVote(
    @Param("trackId") trackId: string,
    @Req() req: Request,
  ) {
    const voterToken = req.cookies?.[VOTER_TOKEN_COOKIE];
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (voterToken) headers["X-Voter-Token"] = voterToken;

    const result = await this.proxyService.forwardWithHeaders(
      "get",
      `/api/public/voting/tracks/${trackId}/my-vote`,
      headers,
    );
    return result.data;
  }

  @Post("votes")
  async castVote(
    @Param("trackId") trackId: string,
    @Body() body: unknown,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const voterToken = req.cookies?.[VOTER_TOKEN_COOKIE];
    const clientIp = String(req.headers["x-forwarded-for"] ?? req.ip ?? "").split(",")[0].trim();

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (voterToken) headers["X-Voter-Token"] = voterToken;
    if (clientIp) headers["X-Client-Ip"] = clientIp;

    const result = await this.proxyService.forwardWithHeaders(
      "post",
      `/api/public/voting/tracks/${trackId}/votes`,
      headers,
      body,
    );

    const { voterToken: newToken, ...publicResult } = (result.data ?? {}) as Record<string, unknown>;
    if (typeof newToken === "string") {
      res.cookie(VOTER_TOKEN_COOKIE, newToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: (isProd ? "none" : "lax") as "none" | "lax",
        path: "/",
        maxAge: 180 * 24 * 60 * 60 * 1000,
      });
    }
    return publicResult;
  }

  @Delete("votes")
  async cancelVote(
    @Param("trackId") trackId: string,
    @Req() req: Request,
  ) {
    const voterToken = req.cookies?.[VOTER_TOKEN_COOKIE];
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (voterToken) headers["X-Voter-Token"] = voterToken;

    const result = await this.proxyService.forwardWithHeaders(
      "delete",
      `/api/public/voting/tracks/${trackId}/votes`,
      headers,
    );
    return result.data;
  }
}
