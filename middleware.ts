import { NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import type { NextRequest } from "next/server"

export default async function middleware(req: NextRequest) {
  const { userId } = getAuth(req)
  const path = req.nextUrl.pathname

  // Define your public routes
  const publicRoutes = ["/", "/api/webhooks/clerk", "/api/webhooks/stripe"]

  // Check if the current path is a public route
  if (publicRoutes.includes(path)) {
    return NextResponse.next()
  }

  // If the user is not signed in and the route is not public, redirect to sign-in
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url)
    signInUrl.searchParams.set("redirect_url", req.url)
    return NextResponse.redirect(signInUrl)
  }

  // If the user is signed in, allow the request to continue
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}

