export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/cases/:path*",
    "/documents/:path*",
    "/calendar/:path*",
    "/search/:path*",
    "/settings/:path*",
  ],
}
