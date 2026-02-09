"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/hooks/useAuth"
import { Camera, Loader2, Save } from "lucide-react"
import { toast } from "sonner"

export function ProfileSettings() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // State initialized with camelCase keys matching your Prisma Client output
  const [formData, setFormData] = useState({
    khcAdvocateName: "",
    email: "",
    mobile: "",
    khcEnrollmentNumber: "",
  })

  // Sync form data when user object is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        khcAdvocateName: user.khcAdvocateName || "",
        email: user.email || "",
        mobile: user.mobile || "",
        khcEnrollmentNumber: user.khcEnrollmentNumber || "",
      })
    }
  }, [user])

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Logic for API call would go here
      // const response = await fetch('/api/user/profile', { method: 'PATCH', body: JSON.stringify(formData) });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Picture */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>
            Update your profile picture to personalize your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl bg-indigo-100 text-indigo-600">
                  {user?.khcAdvocateName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">
                {user?.khcAdvocateName}
              </h3>
              <p className="text-sm text-slate-600 mb-3">
                {user?.khcAdvocateId}
              </p>
              <Button variant="outline" size="sm">
                Change Picture
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details and contact information
            </CardDescription>
          </div>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.khcAdvocateName}
                onChange={(e) =>
                  setFormData({ ...formData, khcAdvocateName: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="khc_id">KHC Advocate ID</Label>
              <Input
                id="khc_id"
                value={user?.khcAdvocateId || ""}
                disabled
                className="bg-slate-50"
              />
              <p className="text-xs text-slate-500">Cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                type="tel"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="enrollment">Enrollment Number</Label>
              <Input
                id="enrollment"
                value={formData.khcEnrollmentNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    khcEnrollmentNumber: e.target.value,
                  })
                }
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={user?.role || ""}
                disabled
                className="bg-slate-50 capitalize"
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex items-center gap-2 pt-4">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="text-sm text-slate-600 mb-1">Account Created</div>
              <div className="font-bold text-slate-900">
                {user?.createdAt &&
                  new Date(user.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <div className="text-sm text-slate-600 mb-1">Last Login</div>
              <div className="font-bold text-slate-900">
                {user?.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Never"}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <div className="text-sm text-slate-600 mb-1">Last Sync</div>
              <div className="font-bold text-slate-900">
                {user?.lastSyncAt
                  ? new Date(user.lastSyncAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Never"}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <div className="text-sm text-slate-600 mb-1">Account Status</div>
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    user?.isActive ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
                <span className="font-bold text-slate-900">
                  {user?.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}