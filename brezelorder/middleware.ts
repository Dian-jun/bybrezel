import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PERSISTENT_COOKIE_OPTIONS: Partial<CookieOptions> = {
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 30
};

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value
          });

          response = NextResponse.next({
            request
          });

          response.cookies.set({
            name,
            value,
            ...PERSISTENT_COOKIE_OPTIONS,
            ...options
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.delete(name);

          response = NextResponse.next({
            request
          });

          response.cookies.set({
            name,
            value: "",
            ...PERSISTENT_COOKIE_OPTIONS,
            ...options,
            maxAge: 0
          });
        }
      }
    }
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
