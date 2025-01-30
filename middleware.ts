import { authMiddleware, type AuthMiddlewareOptions } from "@clerk/nextjs/server"

const middlewareOptions: AuthMiddlewareOptions = {
  publicRoutes: ["/", "/api/webhooks/clerk", "/api/webhooks/stripe"],
}

export default authMiddleware(middlewareOptions)

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}

