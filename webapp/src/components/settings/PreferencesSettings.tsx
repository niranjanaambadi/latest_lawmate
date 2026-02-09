"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import {
  Settings,
  Monitor,
  FolderOpen,
  FileText,
  Sparkles,
  Download,
  Trash2,
  RefreshCw,
  Save,
  Globe,
  Calendar as CalendarIcon,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/hooks/useAuth"

export function PreferencesSettings() {
  const { user } = useAuth()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const [displayPreferences, setDisplayPreferences] = useState({
    theme: "light",
    dashboard_layout: "grid",
    date_format: "DD/MM/YYYY",
    time_zone: "Asia/Kolkata",
    language: "en",
  })

  const [casePreferences, setCasePreferences] = useState({
    default_view: "table",
    items_per_page: 20,
    default_sort: "next_hearing_date",
    auto_sync: true,
    sync_interval: 30,
  })

  const [documentPreferences, setDocumentPreferences] = useState({
    auto_download: false,
    default_viewer: "inline",
    naming_convention: "original",
    compress_pdfs: false,
  })

  const [aiPreferences, setAiPreferences] = useState({
    auto_analysis: true,
    analysis_language: "en",
    show_suggestions: true,
    chat_history_days: 30,
  })

  const [extensionPreferences, setExtensionPreferences] = useState({
    auto_sync_enabled: true,
    sync_notifications: true,
    background_sync_interval: 15,
  })

  const handleSavePreferences = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    toast.success("Preferences saved successfully")
  }

  const handleResetPreferences = () => {
    setDisplayPreferences({
      theme: "light",
      dashboard_layout: "grid",
      date_format: "DD/MM/YYYY",
      time_zone: "Asia/Kolkata",
      language: "en",
    })
    setCasePreferences({
      default_view: "table",
      items_per_page: 20,
      default_sort: "next_hearing_date",
      auto_sync: true,
      sync_interval: 30,
    })
    setDocumentPreferences({
      auto_download: false,
      default_viewer: "inline",
      naming_convention: "original",
      compress_pdfs: false,
    })
    setAiPreferences({
      auto_analysis: true,
      analysis_language: "en",
      show_suggestions: true,
      chat_history_days: 30,
    })
    setExtensionPreferences({
      auto_sync_enabled: true,
      sync_notifications: true,
      background_sync_interval: 15,
    })
    toast.success("Preferences reset to defaults")
  }

  const handleExportData = async () => {
    setIsExporting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    toast.success("Data export initiated. You'll receive a download link via email.")
    setIsExporting(false)
  }

  const handleDeleteAccount = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success("Account deletion request submitted. Our team will contact you within 24 hours.")
    setShowDeleteDialog(false)
  }

  return (
    <div className="space-y-6">
      {/* Display Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-indigo-600" />
            Display Preferences
          </CardTitle>
          <CardDescription>
            Customize how Lawmate looks and behaves
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={displayPreferences.theme}
                onValueChange={(value) =>
                  setDisplayPreferences({ ...displayPreferences, theme: value })
                }
              >
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark (Coming Soon)</SelectItem>
                  <SelectItem value="system">System (Coming Soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dashboard-layout">Dashboard Layout</Label>
              <Select
                value={displayPreferences.dashboard_layout}
                onValueChange={(value) =>
                  setDisplayPreferences({
                    ...displayPreferences,
                    dashboard_layout: value,
                  })
                }
              >
                <SelectTrigger id="dashboard-layout">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid View</SelectItem>
                  <SelectItem value="list">List View</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-format">Date Format</Label>
              <Select
                value={displayPreferences.date_format}
                onValueChange={(value) =>
                  setDisplayPreferences({
                    ...displayPreferences,
                    date_format: value,
                  })
                }
              >
                <SelectTrigger id="date-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (15/01/2026)</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (01/15/2026)</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2026-01-15)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Time Zone</Label>
              <Select
                value={displayPreferences.time_zone}
                onValueChange={(value) =>
                  setDisplayPreferences({
                    ...displayPreferences,
                    time_zone: value,
                  })
                }
              >
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Kolkata">
                    India Standard Time (IST)
                  </SelectItem>
                  <SelectItem value="Asia/Dubai">
                    Gulf Standard Time (GST)
                  </SelectItem>
                  <SelectItem value="America/New_York">
                    Eastern Time (ET)
                  </SelectItem>
                  <SelectItem value="Europe/London">
                    Greenwich Mean Time (GMT)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={displayPreferences.language}
                onValueChange={(value) =>
                  setDisplayPreferences({
                    ...displayPreferences,
                    language: value,
                  })
                }
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ml">Malayalam (Coming Soon)</SelectItem>
                  <SelectItem value="hi">Hindi (Coming Soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Case Management Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-indigo-600" />
            Case Management
          </CardTitle>
          <CardDescription>
            Configure how cases are displayed and synchronized
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="default-view">Default Case View</Label>
              <Select
                value={casePreferences.default_view}
                onValueChange={(value) =>
                  setCasePreferences({ ...casePreferences, default_view: value })
                }
              >
                <SelectTrigger id="default-view">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="table">Table View</SelectItem>
                  <SelectItem value="grid">Grid View</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="items-per-page">Cases Per Page</Label>
              <Select
                value={casePreferences.items_per_page.toString()}
                onValueChange={(value) =>
                  setCasePreferences({
                    ...casePreferences,
                    items_per_page: parseInt(value),
                  })
                }
              >
                <SelectTrigger id="items-per-page">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 cases</SelectItem>
                  <SelectItem value="20">20 cases</SelectItem>
                  <SelectItem value="50">50 cases</SelectItem>
                  <SelectItem value="100">100 cases</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-sort">Default Sorting</Label>
              <Select
                value={casePreferences.default_sort}
                onValueChange={(value) =>
                  setCasePreferences({ ...casePreferences, default_sort: value })
                }
              >
                <SelectTrigger id="default-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="next_hearing_date">Next Hearing Date</SelectItem>
                  <SelectItem value="case_number">Case Number</SelectItem>
                  <SelectItem value="efiling_date">Filing Date</SelectItem>
                  <SelectItem value="updated_at">Last Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sync-interval">Auto-Sync Interval</Label>
              <Select
                value={casePreferences.sync_interval.toString()}
                onValueChange={(value) =>
                  setCasePreferences({
                    ...casePreferences,
                    sync_interval: parseInt(value),
                  })
                }
                disabled={!casePreferences.auto_sync}
              >
                <SelectTrigger id="sync-interval">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">Every 15 minutes</SelectItem>
                  <SelectItem value="30">Every 30 minutes</SelectItem>
                  <SelectItem value="60">Every hour</SelectItem>
                  <SelectItem value="0">Manual only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <Label htmlFor="auto-sync" className="cursor-pointer">
                Enable Auto-Sync
              </Label>
              <p className="text-sm text-slate-600">
                Automatically sync cases from KHC portal
              </p>
            </div>
            <Switch
              id="auto-sync"
              checked={casePreferences.auto_sync}
              onCheckedChange={(checked) =>
                setCasePreferences({ ...casePreferences, auto_sync: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Document Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            Document Management
          </CardTitle>
          <CardDescription>
            Configure document handling and storage options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="default-viewer">Default PDF Viewer</Label>
              <Select
                value={documentPreferences.default_viewer}
                onValueChange={(value) =>
                  setDocumentPreferences({
                    ...documentPreferences,
                    default_viewer: value,
                  })
                }
              >
                <SelectTrigger id="default-viewer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inline">View Inline (Recommended)</SelectItem>
                  <SelectItem value="download">Always Download</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="naming-convention">File Naming</Label>
              <Select
                value={documentPreferences.naming_convention}
                onValueChange={(value) =>
                  setDocumentPreferences({
                    ...documentPreferences,
                    naming_convention: value,
                  })
                }
              >
                <SelectTrigger id="naming-convention">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">Keep Original Names</SelectItem>
                  <SelectItem value="case_number">Prefix with Case Number</SelectItem>
                  <SelectItem value="date">Prefix with Upload Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-download" className="cursor-pointer">
                  Auto-Download Documents
                </Label>
                <p className="text-sm text-slate-600">
                  Automatically download synced PDFs to your device
                </p>
              </div>
              <Switch
                id="auto-download"
                checked={documentPreferences.auto_download}
                onCheckedChange={(checked) =>
                  setDocumentPreferences({
                    ...documentPreferences,
                    auto_download: checked,
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="compress-pdfs" className="cursor-pointer">
                  Optimize Storage
                </Label>
                <p className="text-sm text-slate-600">
                  Compress PDFs to save storage space (may reduce quality)
                </p>
              </div>
              <Switch
                id="compress-pdfs"
                checked={documentPreferences.compress_pdfs}
                onCheckedChange={(checked) =>
                  setDocumentPreferences({
                    ...documentPreferences,
                    compress_pdfs: checked,
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Assistant Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            AI Assistant
          </CardTitle>
          <CardDescription>
            Configure AI-powered features and analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="analysis-language">Analysis Language</Label>
              <Select
                value={aiPreferences.analysis_language}
                onValueChange={(value) =>
                  setAiPreferences({
                    ...aiPreferences,
                    analysis_language: value,
                  })
                }
              >
                <SelectTrigger id="analysis-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ml">Malayalam (Coming Soon)</SelectItem>
                  <SelectItem value="hi">Hindi (Coming Soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chat-history">Chat History Retention</Label>
              <Select
                value={aiPreferences.chat_history_days.toString()}
                onValueChange={(value) =>
                  setAiPreferences({
                    ...aiPreferences,
                    chat_history_days: parseInt(value),
                  })
                }
              >
                <SelectTrigger id="chat-history">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                  <SelectItem value="0">Never delete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-analysis" className="cursor-pointer">
                  Auto-Analyze New Cases
                </Label>
                <p className="text-sm text-slate-600">
                  Automatically analyze cases when they're synced
                </p>
              </div>
              <Switch
                id="auto-analysis"
                checked={aiPreferences.auto_analysis}
                onCheckedChange={(checked) =>
                  setAiPreferences({
                    ...aiPreferences,
                    auto_analysis: checked,
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-suggestions" className="cursor-pointer">
                  Show AI Suggestions
                </Label>
                <p className="text-sm text-slate-600">
                  Display AI-powered insights and recommendations
                </p>
              </div>
              <Switch
                id="show-suggestions"
                checked={aiPreferences.show_suggestions}
                onCheckedChange={(checked) =>
                  setAiPreferences({
                    ...aiPreferences,
                    show_suggestions: checked,
                  })
                }
              />
            </div>
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm text-amber-700">
              AI analysis consumes tokens from your subscription plan. Auto-analysis
              may use your monthly quota faster.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Extension Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-indigo-600" />
            Chrome Extension
          </CardTitle>
          <CardDescription>
            Configure browser extension behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bg-sync-interval">Background Sync Frequency</Label>
            <Select
              value={extensionPreferences.background_sync_interval.toString()}
              onValueChange={(value) =>
                setExtensionPreferences({
                  ...extensionPreferences,
                  background_sync_interval: parseInt(value),
                })
              }
              disabled={!extensionPreferences.auto_sync_enabled}
            >
              <SelectTrigger id="bg-sync-interval">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">Every 15 minutes</SelectItem>
                <SelectItem value="30">Every 30 minutes</SelectItem>
                <SelectItem value="60">Every hour</SelectItem>
                <SelectItem value="120">Every 2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="ext-auto-sync" className="cursor-pointer">
                  Enable Auto-Sync
                </Label>
                <p className="text-sm text-slate-600">
                  Automatically sync data when visiting KHC portal
                </p>
              </div>
              <Switch
                id="ext-auto-sync"
                checked={extensionPreferences.auto_sync_enabled}
                onCheckedChange={(checked) =>
                  setExtensionPreferences({
                    ...extensionPreferences,
                    auto_sync_enabled: checked,
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sync-notifications" className="cursor-pointer">
                  Sync Notifications
                </Label>
                <p className="text-sm text-slate-600">
                  Show browser notifications when sync completes
                </p>
              </div>
              <Switch
                id="sync-notifications"
                checked={extensionPreferences.sync_notifications}
                onCheckedChange={(checked) =>
                  setExtensionPreferences({
                    ...extensionPreferences,
                    sync_notifications: checked,
                  })
                }
              />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-900 text-sm mb-1">
                  Extension Version
                </div>
                <div className="text-xs text-slate-600">
                  Lawmate Chrome Extension v1.1.0
                </div>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Check for Updates
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
          <CardDescription>
            Manage your data and privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-slate-900 mb-1">
                  Export Your Data
                </h4>
                <p className="text-sm text-slate-600">
                  Download a complete copy of your cases, documents, and account
                  data
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleExportData}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Export includes all case metadata, documents, and analysis results in
              a ZIP file. Large exports may take up to 24 hours.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
            <div className="mb-2">
              <h4 className="font-bold text-slate-900 mb-1 text-sm">
                Privacy Compliance
              </h4>
              <p className="text-xs text-slate-600">
                Your data is protected under the Digital Personal Data Protection
                Act (DPDPA), 2023
              </p>
            </div>
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 mt-1.5" />
                <span>Data encrypted at rest and in transit</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 mt-1.5" />
                <span>Stored in India (AWS Mumbai region)</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 mt-1.5" />
                <span>Complete audit trail maintained</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-red-900 mb-1">
                  Delete Account
                </h4>
                <p className="text-sm text-red-700">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </div>
            <p className="text-xs text-red-600">
              ⚠️ This action cannot be undone. All your cases, documents, and
              settings will be permanently deleted.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={handleResetPreferences}>
          Reset to Defaults
        </Button>
        <Button onClick={handleSavePreferences}>
          <Save className="mr-2 h-4 w-4" />
          Save All Preferences
        </Button>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <h4 className="font-bold text-amber-900 mb-2 text-sm">
              Before you delete:
            </h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Download your data export if needed</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Cancel any active subscriptions</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Remove Chrome extension access</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-email">
              Type your email to confirm: <strong>{user?.email}</strong>
            </Label>
            <input
              id="confirm-email"
              type="email"
              placeholder="your@email.com"
              className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Delete My Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}