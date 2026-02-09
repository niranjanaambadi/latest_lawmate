import { redirect } from "next/navigation"

export default function Home() {
  // Redirect to dashboard if authenticated, else to login
  redirect("/dashboard")
}