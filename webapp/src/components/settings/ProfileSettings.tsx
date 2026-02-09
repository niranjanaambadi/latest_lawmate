// src/components/settings/ProfileSettings.tsx
"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Save, User as UserIcon, Mail, Phone, Shield, Calendar } from "lucide-react"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils/date"
import { serializeUserPreferences } from "@/types/user"
import type { User, ProfileUpdateInput } from "@/types/user"

// FIXED: Proper props interface
interface ProfileSettingsProps {
  user: User
}

export function ProfileSettings({ user: initialUser }: ProfileSettingsProps) {
  const { data: session, update: updateSession } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<ProfileUpdateInput>({
    email: initialUser.email,
    mobile: initialUser.mobile,
    khcEnrollmentNumber: initialUser.khcEnrollmentNumber,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Prepare data for API
      const updateData = {
        ...formData,
        preferences: formData.preferences 
          ? serializeUserPreferences(formData.preferences)
          : undefined
      }

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const updatedUser = await response.json()

      // Update session if email changed
      if (formData.email !== initialUser.email) {
        await updateSession({
          ...session,
          user: {
            ...session?.user,
            email: formData.email,
          },
        })
      }

      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Account Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            Your Kerala High Court advocate details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-slate-600">KHC Advocate ID</Label>
              <div className="font-medium text-slate-900">
                {initialUser.khcAdvocateId}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600">Advocate Name</Label>
              <div className="font-medium text-slate-900">
                {initialUser.khcAdvocateName}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600">Role</Label>
              <div>
                <Badge variant={initialUser.role === 'ADMIN' ? 'destructive' : 'default'}>
                  {initialUser.role}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600">Account Status</Label>
              <div className="flex items-center gap-2">
                <Badge variant={initialUser.isActive ? 'success' : 'destructive'}>
                  {initialUser.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant={initialUser.isVerified ? 'success' : 'warning'}>
                  {initialUser.isVerified ? 'Verified' : 'Not Verified'}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600">Member Since</Label>
              <div className="font-medium text-slate-900">
                {formatDate(initialUser.createdAt, "PPP")}
              </div>
            </div>

            {initialUser.lastLoginAt && (
              <div className="space-y-2">
                <Label className="text-slate-600">Last Login</Label>
                <div className="font-medium text-slate-900">
                  {formatDate(initialUser.lastLoginAt, "PPP 'at' p")}
                </div>
              </div>
            )}

            {initialUser.lastSyncAt && (
              <div className="space-y-2">
                <Label className="text-slate-600">Last Case Sync</Label>
                <div className="font-medium text-slate-900">
                  {formatDate(initialUser.lastSyncAt, "PPP 'at' p")}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Editable Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>
            Update your contact information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="inline h-4 w-4 mr-2" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">
                <Phone className="inline h-4 w-4 mr-2" />
                Mobile Number
              </Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.mobile || ''}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value || null })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="enrollment">
                <Shield className="inline h-4 w-4 mr-2" />
                Bar Council Enrollment Number
              </Label>
              <Input
                id="enrollment"
                type="text"
                placeholder="KER/123/2020"
                value={formData.khcEnrollmentNumber || ''}
                onChange={(e) => setFormData({ ...formData, khcEnrollmentNumber: e.target.value || null })}
              />
              <p className="text-xs text-slate-600">
                Your Kerala Bar Council enrollment number (optional)
              </p>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
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
          </form>
        </CardContent>
      </Card>

      {/* User Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Customize your LawMate experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-slate-600">Theme</Label>
              <div className="font-medium text-slate-900 capitalize">
                {initialUser.preferences.theme || 'System'}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600">Dashboard Layout</Label>
              <div className="font-medium text-slate-900 capitalize">
                {initialUser.preferences.dashboardLayout || 'Grid'}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600">Language</Label>
              <div className="font-medium text-slate-900 uppercase">
                {initialUser.preferences.language || 'EN'}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600">Auto Sync</Label>
              <div>
                <Badge variant={initialUser.preferences.autoSync ? 'success' : 'secondary'}>
                  {initialUser.preferences.autoSync ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600">Email Notifications</Label>
              <div>
                <Badge variant={initialUser.preferences.notificationEmail ? 'success' : 'secondary'}>
                  {initialUser.preferences.notificationEmail ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600">Push Notifications</Label>
              <div>
                <Badge variant={initialUser.preferences.notificationPush ? 'success' : 'secondary'}>
                  {initialUser.preferences.notificationPush ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}