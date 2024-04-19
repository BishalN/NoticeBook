import { cookies } from "next/headers";
import { generateId } from "lucia";
import { OAuth2RequestError } from "arctic";
import { eq } from "drizzle-orm";
import { lucia, google } from "@/lib/auth";
import { db } from "@/server/db";
import { GOOGLE_CODE_VERIFIER, redirects } from "@/lib/constants";
import { users } from "@/server/db/schema";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies().get("google_oauth_state")?.value ?? null;

  if (!code || !state || !storedState || state !== storedState) {
    return new Response(null, {
      status: 400,
      headers: { Location: redirects.toLogin },
    });
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, GOOGLE_CODE_VERIFIER);

    const googleUserInfo = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
    const googleUser = (await googleUserInfo.json()) as googleUser;

    if (!googleUser.email || !googleUser.email_verified) {
      return new Response(
        JSON.stringify({
          error: "Your Google account must have a verified email address.",
        }),
        { status: 400, headers: { Location: redirects.toLogin } },
      );
    }
    const existingUser = await db.query.users.findFirst({
      where: (table, { eq, or }) =>
        or(eq(table.googleId, googleUser.sub), eq(table.email, googleUser.email)),
    });

    if (!existingUser) {
      const userId = generateId(21);
      await db.insert(users).values({
        id: userId,
        email: googleUser.email,
        emailVerified: true,
        googleId: googleUser.sub,
        avatar: googleUser.picture,
      });

      const session = await lucia.createSession(userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
      return new Response(null, {
        status: 302,
        headers: { Location: redirects.afterLogin },
      });
    }

    // We know the user exists, through email or googleId here
    // TODO: Handle connecting emails with discord and google account
    if (existingUser.googleId !== googleUser.sub || existingUser.avatar !== googleUser.picture) {
      await db
        .update(users)
        .set({
          googleId: googleUser.sub,
          emailVerified: true,
          avatar: googleUser.picture,
        })
        .where(eq(users.id, existingUser.id));
    }
    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    return new Response(null, {
      status: 302,
      headers: { Location: redirects.afterLogin },
    });
  } catch (e) {
    // the specific error message depends on the provider
    if (e instanceof OAuth2RequestError) {
      // invalid code
      return new Response(JSON.stringify({ message: "Invalid code" }), {
        status: 400,
      });
    }

    return new Response(JSON.stringify({ message: "internal server error" }), {
      status: 500,
    });
  }
}

// Example reponse from google; create an interface for this
// sub: '115898195646889510941',
//   name: 'Tech Bit',
//   given_name: 'Tech',
//   family_name: 'Bit',
//   picture: 'https://lh3.googleusercontent.com/a/ACg8ocLCr0R8xkoaItPmtwnUTM5qxjcwKDP6qFyOB9pVbFZIqHR2F6rK=s96-c',
//   email: 'tubey1101@gmail.com',
//   email_verified: true,
//   locale: 'en-GB'

interface googleUser {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
}
