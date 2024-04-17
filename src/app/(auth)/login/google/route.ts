import { cookies } from "next/headers";
import { generateState } from "arctic";
import { google } from "@/lib/auth";
import { env } from "@/env";

export const GOOGLE_CODE_VERIFIER = "something_cryptic-code-verifier";

export async function GET(): Promise<Response> {
  const state = generateState();
  const url = await google.createAuthorizationURL(state, GOOGLE_CODE_VERIFIER, {
    scopes: ["openid", "email", "profile"],
  });

  cookies().set("google_oauth_state", state, {
    path: "/",
    secure: env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  return Response.redirect(url);
}
