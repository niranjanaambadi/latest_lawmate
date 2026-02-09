"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function NewCasePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // TODO: API integration
    toast.success("Manual case entry is not yet implemented. Cases are synced from KHC portal via extension.")
    
    setTimeout(() => {
      router.push('/cases')
    }, 2000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/cases">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cases
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Add New Case
        </h1>
        <p className="text-slate-600 mt-1">
          Manually add a case to your dashboard
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="case_number">Case Number</Label>
                <Input id="case_number" placeholder="WP(C) 123/2026" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="case_type">Case Type</Label>
                <Select required>
                  <SelectTrigger id="case_type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WP(C)">WP(C)</SelectItem>
                    <SelectItem value="CRLA">CRLA</SelectItem>
                    <SelectItem value="OP">OP</SelectItem>
                    <SelectItem value="WA">WA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="petitioner">Petitioner Name</Label>
              <Input id="petitioner" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="respondent">Respondent Name</Label>
              <Input id="respondent" required />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Case"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/cases')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
