"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import {
  Shield,
  Key,
  Smartphone,
  Monitor,
  AlertTriangle,
  Check,
  X,
  Download,
  QrCode,
  Copy,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils/cn"

// Mock data
const mockSessions = [
  {
    id: "1",
    device: "Chrome on Windows",
    ip_address: "49.207.123.45",
    location: "Kochi, Kerala",
    last_active: "2026-01-15T10:30:00Z",
    is_current: true,
  },
  {
    id: "2",
    device: "Firefox on Ubuntu",
    ip_address: "103.21.45.89",
    location: "Thiruvananthapuram, Kerala",
    last_active: "2026-01-14T15:20:00Z",
    is_current: false,
  },
]

const mockSecurityEvents = [
  {
    id: "1",
    event: "Password changed",
    timestamp: "2026-01-10T09:15:00Z",
    ip_address: "49.207.123.45",
    status: "success",
  },
  {
    id: "2",
    event: "Login",
    timestamp: "2026-01-15T10:30:00Z",
    ip_address: "49.207.123.45",
    status: "success",
  },
  {
    id: "3",
    event: "Failed login attempt",
    timestamp: "2026-01-12T22:45:00Z",
    ip_address: "185.220.101.23",
    status: "failed",
  },
]

export function SecuritySettings() {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [show2FADialog, setShow2FADialog] = useState(false)
  const [showRevokeDialog, setShowRevokeDialog] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [sessionToRevoke, setSessionToRevoke] = useState<string | null>(null)
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  const passwordStrength = calculatePasswordStrength(passwordForm.new)

  const handlePasswordChange = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("Passwords don't match")
      return
    }

    if (passwordStrength < 60) {
      toast.error("Password is too weak")
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success("Password changed successfully")
    setShowPasswordDialog(false)
    setPasswordForm({ current: "", new: "", confirm: "" })
  }

  const handleEnable2FA = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setTwoFactorEnabled(true)
    setShow2FADialog(false)
    toast.success("Two-factor authentication enabled")
  }

  const handleRevokeSession = async (sessionId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    toast.success("Session revoked successfully")
    setSessionToRevoke(null)
  }

  const handleRevokeAllSessions = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success("All sessions revoked. Please login again.")
  }

  return (
    <div className="space-y-6">
      {/* Password Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-indigo-600" />
              Password
            </CardTitle>
            <CardDescription>
              Manage your password and keep your account secure
            </CardDescription>
          </div>
          <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
            Change Password
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
            <div className="text-sm text-slate-600 mb-1">Last Changed</div>
            <div className="font-medium text-slate-900">January 10, 2026</div>
            <p className="text-xs text-slate-500 mt-2">
              We recommend changing your password every 90 days
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-indigo-600" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "p-2 rounded-lg",
                  twoFactorEnabled ? "bg-emerald-100" : "bg-slate-100"
                )}
              >
                {twoFactorEnabled ? (
                  <Check className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Shield className="h-5 w-5 text-slate-600" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">
                  Authenticator App
                </h4>
                <p className="text-sm text-slate-600">
                  Use an authenticator app to generate verification codes
                </p>
                {twoFactorEnabled && (
                  <Badge variant="default" className="mt-2 bg-green-500">
                  Enabled
                  </Badge>
                )}
              </div>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  setShow2FADialog(true)
                } else {
                  setTwoFactorEnabled(false)
                  toast.success("Two-factor authentication disabled")
                }
              }}
            />
          </div>

          {twoFactorEnabled && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
              <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Backup Codes
              </h4>
              <p className="text-sm text-amber-700 mb-3">
                Save these backup codes in a secure place. You can use them to
                access your account if you lose your device.
              </p>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download Backup Codes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-indigo-600" />
              Active Sessions
            </CardTitle>
            <CardDescription>
              Manage devices that are currently logged into your account
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRevokeDialog(true)}
          >
            Sign Out All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockSessions.map((session) => (
              <div
                key={session.id}
                className="rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-indigo-100">
                      <Monitor className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-900">
                          {session.device}
                        </h4>
                        {session.is_current && (
                          <Badge variant="default" className="text-xs bg-blue-500">
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-slate-600">
                        <div>IP: {session.ip_address}</div>
                        <div>Location: {session.location}</div>
                        <div>
                          Last active:{" "}
                          {new Date(session.last_active).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  {!session.is_current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSessionToRevoke(session.id)}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Audit Log */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" />
              Security Activity
            </CardTitle>
            <CardDescription>
              Recent security events on your account
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Log
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockSecurityEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-full",
                      event.status === "success"
                        ? "bg-emerald-100"
                        : "bg-red-100"
                    )}
                  >
                    {event.status === "success" ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <X className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 text-sm">
                      {event.event}
                    </div>
                    <div className="text-xs text-slate-600">
                      {new Date(event.timestamp).toLocaleString()} • IP:{" "}
                      {event.ip_address}
                    </div>
                  </div>
                </div>
            <Badge
  variant={event.status === "success" ? "default" : "destructive"}
  className={`text-xs ${
    event.status === "success" 
      ? "bg-green-500 hover:bg-green-600" 
      : ""
  }`}
>
  {event.status}
</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KHC Extension Security */}
      <Card>
        <CardHeader>
          <CardTitle>Extension Access</CardTitle>
          <CardDescription>
            Manage Chrome extension permissions and access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-slate-900 mb-1">
                  Lawmate Chrome Extension
                </h4>
                <p className="text-sm text-slate-600">
                  Version 1.1.0 • Last sync: 2 hours ago
                </p>
              </div>
              <Badge variant="default">
                Connected</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                View Permissions
              </Button>
              <Button variant="outline" size="sm">
                Revoke Access
              </Button>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <h4 className="font-bold text-blue-900 mb-1 text-sm">
              Extension Permissions
            </h4>
            <ul className="text-sm text-blue-700 space-y-1 mt-2">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Access KHC portal data</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Upload documents to your account</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Sync case metadata</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Choose a strong password to keep your account secure
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordForm.current}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, current: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.new}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, new: e.target.value })
                }
              />
              {passwordForm.new && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Password strength</span>
                    <span
                      className={cn(
                        "font-medium",
                        passwordStrength < 40 && "text-red-600",
                        passwordStrength >= 40 &&
                          passwordStrength < 70 &&
                          "text-amber-600",
                        passwordStrength >= 70 && "text-emerald-600"
                      )}
                    >
                      {passwordStrength < 40 && "Weak"}
                      {passwordStrength >= 40 &&
                        passwordStrength < 70 &&
                        "Medium"}
                      {passwordStrength >= 70 && "Strong"}
                    </span>
                  </div>
                  <Progress value={passwordStrength} />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirm}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirm: e.target.value })
                }
              />
            </div>

            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
              <h4 className="text-sm font-bold text-slate-900 mb-2">
                Password Requirements:
              </h4>
              <ul className="text-xs text-slate-600 space-y-1">
                <li className="flex items-start gap-2">
                  <Check
                    className={cn(
                      "h-3 w-3 flex-shrink-0 mt-0.5",
                      passwordForm.new.length >= 8
                        ? "text-emerald-600"
                        : "text-slate-400"
                    )}
                  />
                  <span>At least 8 characters</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check
                    className={cn(
                      "h-3 w-3 flex-shrink-0 mt-0.5",
                      /[A-Z]/.test(passwordForm.new)
                        ? "text-emerald-600"
                        : "text-slate-400"
                    )}
                  />
                  <span>One uppercase letter</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check
                    className={cn(
                      "h-3 w-3 flex-shrink-0 mt-0.5",
                      /[0-9]/.test(passwordForm.new)
                        ? "text-emerald-600"
                        : "text-slate-400"
                    )}
                  />
                  <span>One number</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check
                    className={cn(
                      "h-3 w-3 flex-shrink-0 mt-0.5",
                      /[!@#$%^&*]/.test(passwordForm.new)
                        ? "text-emerald-600"
                        : "text-slate-400"
                    )}
                  />
                  <span>One special character</span>
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordChange}
              disabled={
                !passwordForm.current ||
                !passwordForm.new ||
                passwordForm.new !== passwordForm.confirm ||
                passwordStrength < 60
              }
            >
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan this QR code with your authenticator app
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="p-4 bg-white rounded-lg border-2 border-slate-200">
                <QrCode className="h-48 w-48 text-slate-400" />
              </div>
              <p className="text-sm text-slate-600 text-center">
                Or enter this code manually:
              </p>
              <div className="flex items-center gap-2">
                <code className="px-4 py-2 bg-slate-100 rounded border border-slate-200 font-mono text-sm">
                  JBSW Y3DP EHPK 3PXP
                </code>
                <Button variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
              <p className="text-xs text-slate-500">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShow2FADialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEnable2FA}>Verify & Enable</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Session Dialog */}
      <AlertDialog
        open={!!sessionToRevoke}
        onOpenChange={() => setSessionToRevoke(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will sign out the selected device. You'll need to login again
              on that device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                sessionToRevoke && handleRevokeSession(sessionToRevoke)
              }
            >
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke All Sessions Dialog */}
      <AlertDialog
        open={showRevokeDialog}
        onOpenChange={setShowRevokeDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Out All Devices?</AlertDialogTitle>
            <AlertDialogDescription>
              This will sign you out from all devices including this one. You'll
              need to login again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevokeAllSessions}>
              Sign Out All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function calculatePasswordStrength(password: string): number {
  let strength = 0

  if (password.length >= 8) strength += 25
  if (password.length >= 12) strength += 15
  if (/[a-z]/.test(password)) strength += 10
  if (/[A-Z]/.test(password)) strength += 15
  if (/[0-9]/.test(password)) strength += 15
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20

  return Math.min(strength, 100)
}
