"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Bell, Mail, Smartphone, Clock, Save } from "lucide-react"
import { toast } from "sonner"

export function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState({
    case_updates: true,
    document_uploads: true,
    ai_analysis: true,
    deadline_reminders: true,
    subscription_alerts: true,
    security_alerts: true,
  })

  const [pushNotifications, setPushNotifications] = useState({
    case_updates: false,
    document_uploads: false,
    ai_analysis: true,
    deadline_reminders: true,
  })

  const [digestSettings, setDigestSettings] = useState({
    daily_summary: true,
    daily_time: "09:00",
    weekly_report: true,
    weekly_day: "monday",
    monthly_analytics: false,
  })

  const [doNotDisturb, setDoNotDisturb] = useState({
    enabled: false,
    start_time: "22:00",
    end_time: "08:00",
    allow_critical: true,
  })

  const handleSave = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    toast.success("Notification preferences saved")
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-indigo-600" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Choose what email notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-case-updates" className="cursor-pointer">
                Case Updates
              </Label>
              <p className="text-sm text-slate-600">
                New hearings, orders, and judgments
              </p>
            </div>
            <Switch
              id="email-case-updates"
              checked={emailNotifications.case_updates}
              onCheckedChange={(checked) =>
                setEmailNotifications({
                  ...emailNotifications,
                  case_updates: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-documents" className="cursor-pointer">
                Document Uploads
              </Label>
              <p className="text-sm text-slate-600">
                When documents are uploaded or synced
              </p>
            </div>
            <Switch
              id="email-documents"
              checked={emailNotifications.document_uploads}
              onCheckedChange={(checked) =>
                setEmailNotifications({
                  ...emailNotifications,
                  document_uploads: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-ai" className="cursor-pointer">
                AI Analysis Completed
              </Label>
              <p className="text-sm text-slate-600">
                When AI finishes analyzing a case
              </p>
            </div>
            <Switch
              id="email-ai"
              checked={emailNotifications.ai_analysis}
              onCheckedChange={(checked) =>
                setEmailNotifications({
                  ...emailNotifications,
                  ai_analysis: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-deadlines" className="cursor-pointer">
                Deadline Reminders
              </Label>
              <p className="text-sm text-slate-600">
                Reminders for upcoming deadlines
              </p>
            </div>
            <Switch
              id="email-deadlines"
              checked={emailNotifications.deadline_reminders}
              onCheckedChange={(checked) =>
                setEmailNotifications({
                  ...emailNotifications,
                  deadline_reminders: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-subscription" className="cursor-pointer">
                Subscription & Billing
              </Label>
              <p className="text-sm text-slate-600">
                Payment receipts and subscription updates
              </p>
            </div>
            <Switch
              id="email-subscription"
              checked={emailNotifications.subscription_alerts}
              onCheckedChange={(checked) =>
                setEmailNotifications({
                  ...emailNotifications,
                  subscription_alerts: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-security" className="cursor-pointer">
                Security Alerts
              </Label>
              <p className="text-sm text-slate-600">
                Login attempts and security events (always on)
              </p>
            </div>
            <Switch
              id="email-security"
              checked={emailNotifications.security_alerts}
              disabled
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-indigo-600" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Receive instant notifications in your browser
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <p className="text-sm text-blue-700">
              Enable browser notifications to receive real-time alerts. You may
              need to grant permission in your browser.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-case-updates" className="cursor-pointer">
                Case Updates
              </Label>
              <p className="text-sm text-slate-600">
                New hearings and orders
              </p>
            </div>
            <Switch
              id="push-case-updates"
              checked={pushNotifications.case_updates}
              onCheckedChange={(checked) =>
                setPushNotifications({
                  ...pushNotifications,
                  case_updates: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-documents" className="cursor-pointer">
                Document Uploads
              </Label>
              <p className="text-sm text-slate-600">
                Sync completion notifications
              </p>
            </div>
            <Switch
              id="push-documents"
              checked={pushNotifications.document_uploads}
              onCheckedChange={(checked) =>
                setPushNotifications({
                  ...pushNotifications,
                  document_uploads: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-ai" className="cursor-pointer">
                AI Analysis
              </Label>
              <p className="text-sm text-slate-600">Analysis complete alerts</p>
            </div>
            <Switch
              id="push-ai"
              checked={pushNotifications.ai_analysis}
              onCheckedChange={(checked) =>
                setPushNotifications({
                  ...pushNotifications,
                  ai_analysis: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-deadlines" className="cursor-pointer">
                Deadline Reminders
              </Label>
              <p className="text-sm text-slate-600">Time-sensitive alerts</p>
            </div>
            <Switch
              id="push-deadlines"
              checked={pushNotifications.deadline_reminders}
              onCheckedChange={(checked) =>
                setPushNotifications({
                  ...pushNotifications,
                  deadline_reminders: checked,
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Digest Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-indigo-600" />
            Email Digests
          </CardTitle>
          <CardDescription>
            Receive summary emails at scheduled times
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="daily-summary" className="cursor-pointer">
                Daily Summary
              </Label>
              <p className="text-sm text-slate-600">
                Daily recap of your cases and activities
              </p>
            </div>
            <Switch
              id="daily-summary"
              checked={digestSettings.daily_summary}
              onCheckedChange={(checked) =>
                setDigestSettings({
                  ...digestSettings,
                  daily_summary: checked,
                })
              }
            />
          </div>

          {digestSettings.daily_summary && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="daily-time">Send at</Label>
              <Select
                value={digestSettings.daily_time}
                onValueChange={(value) =>
                  setDigestSettings({ ...digestSettings, daily_time: value })
                }
              >
                <SelectTrigger id="daily-time">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="06:00">6:00 AM</SelectItem>
                  <SelectItem value="07:00">7:00 AM</SelectItem>
                  <SelectItem value="08:00">8:00 AM</SelectItem>
                  <SelectItem value="09:00">9:00 AM</SelectItem>
                  <SelectItem value="10:00">10:00 AM</SelectItem>
                  <SelectItem value="18:00">6:00 PM</SelectItem>
                  <SelectItem value="19:00">7:00 PM</SelectItem>
                  <SelectItem value="20:00">8:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="weekly-report" className="cursor-pointer">
                Weekly Report
              </Label>
              <p className="text-sm text-slate-600">
                Weekly overview of case progress
              </p>
            </div>
            <Switch
              id="weekly-report"
              checked={digestSettings.weekly_report}
              onCheckedChange={(checked) =>
                setDigestSettings({
                  ...digestSettings,
                  weekly_report: checked,
                })
              }
            />
          </div>

          {digestSettings.weekly_report && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="weekly-day">Send on</Label>
              <Select
                value={digestSettings.weekly_day}
                onValueChange={(value) =>
                  setDigestSettings({ ...digestSettings, weekly_day: value })
                }
              >
                <SelectTrigger id="weekly-day">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Monday</SelectItem>
                  <SelectItem value="tuesday">Tuesday</SelectItem>
                  <SelectItem value="wednesday">Wednesday</SelectItem>
                  <SelectItem value="thursday">Thursday</SelectItem>
                  <SelectItem value="friday">Friday</SelectItem>
                  <SelectItem value="saturday">Saturday</SelectItem>
                  <SelectItem value="sunday">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="monthly-analytics" className="cursor-pointer">
                Monthly Analytics
              </Label>
              <p className="text-sm text-slate-600">
                Detailed monthly performance report
              </p>
            </div>
            <Switch
              id="monthly-analytics"
              checked={digestSettings.monthly_analytics}
              onCheckedChange={(checked) =>
                setDigestSettings({
                  ...digestSettings,
                  monthly_analytics: checked,
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Do Not Disturb */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600" />
            Do Not Disturb
          </CardTitle>
          <CardDescription>
            Set quiet hours to pause non-critical notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dnd-enabled" className="cursor-pointer">
                Enable Do Not Disturb
              </Label>
              <p className="text-sm text-slate-600">
                Pause notifications during specified hours
              </p>
            </div>
            <Switch
              id="dnd-enabled"
              checked={doNotDisturb.enabled}
              onCheckedChange={(checked) =>
                setDoNotDisturb({
                  ...doNotDisturb,
                  enabled: checked,
                })
              }
            />
          </div>

          {doNotDisturb.enabled && (
            <>
              <div className="grid grid-cols-2 gap-4 ml-6">
                <div className="space-y-2">
                  <Label htmlFor="dnd-start">Start Time</Label>
                  <Select
                    value={doNotDisturb.start_time}
                    onValueChange={(value) =>
                      setDoNotDisturb({ ...doNotDisturb, start_time: value })
                    }
                  >
                    <SelectTrigger id="dnd-start">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20:00">8:00 PM</SelectItem>
                      <SelectItem value="21:00">9:00 PM</SelectItem>
                      <SelectItem value="22:00">10:00 PM</SelectItem>
                      <SelectItem value="23:00">11:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dnd-end">End Time</Label>
                  <Select
                    value={doNotDisturb.end_time}
                    onValueChange={(value) =>
                      setDoNotDisturb({ ...doNotDisturb, end_time: value })
                    }
                  >
                    <SelectTrigger id="dnd-end">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="06:00">6:00 AM</SelectItem>
                      <SelectItem value="07:00">7:00 AM</SelectItem>
                      <SelectItem value="08:00">8:00 AM</SelectItem>
                      <SelectItem value="09:00">9:00 AM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between ml-6">
                <div>
                  <Label htmlFor="dnd-critical" className="cursor-pointer">
                    Allow Critical Alerts
                  </Label>
                  <p className="text-sm text-slate-600">
                    Security and urgent deadline notifications
                  </p>
                </div>
                <Switch
                  id="dnd-critical"
                  checked={doNotDisturb.allow_critical}
                  onCheckedChange={(checked) =>
                    setDoNotDisturb({
                      ...doNotDisturb,
                      allow_critical: checked,
                    })
                  }
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline">Reset to Defaults</Button>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Preferences
        </Button>
      </div>
    </div>
  )
}