"use client"

import React from "react"
import {
  RefreshCw,
  Settings,
  Sparkles,
  Calendar,
  Users,
  BookOpen,
  AlertTriangle,
  Download,
  Mail,
  FileText,
  Smartphone,
  Share2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

interface Teacher {
  id: number
  name: string
  subjects: string[]
  availability: Record<string, string[]>
  maxHours: number
}

interface Course {
  id: number
  name: string
  teacher: string
  weeklyHours: number
  studentCount: number
  difficulty: "low" | "medium" | "high"
}

interface Resource {
  id: number
  name: string
  type: string
  capacity: number
  equipment: string[]
}

interface TimetableGeneratorProps {
  isGenerating: boolean
  onGenerate: () => void
  generatedTimetable: any
  teachers: Teacher[]
  courses: Course[]
  resources: Resource[]
}

export default function EnhancedTimetableGenerator({
  isGenerating,
  onGenerate,
  generatedTimetable,
  teachers = [],
  courses = [],
  resources = [],
}: TimetableGeneratorProps) {
  const { toast } = useToast()
  const canGenerate = teachers.length > 0 && courses.length > 0 && resources.length > 0

  const exportToPDF = async () => {
    try {
      // Dynamic import to avoid SSR issues
      const jsPDF = (await import("jspdf")).default
      const doc = new jsPDF("l", "mm", "a4") // landscape orientation

      doc.setFontSize(20)
      doc.text("AI Generated Timetable", 20, 20)

      doc.setFontSize(12)
      let yPosition = 40

      Object.entries(generatedTimetable).forEach(([day, daySchedule]: [string, any]) => {
        doc.setFontSize(14)
        doc.text(day, 20, yPosition)
        yPosition += 10

        Object.entries(daySchedule).forEach(([time, sessions]: [string, any]) => {
          if (Array.isArray(sessions) && sessions.length > 0) {
            doc.setFontSize(10)
            sessions.forEach((session: any) => {
              doc.text(`${time}: ${session.course} - ${session.teacher} (${session.resource})`, 30, yPosition)
              yPosition += 6
            })
          }
        })
        yPosition += 5
      })

      doc.save("timetable.pdf")
      toast({
        title: "Success!",
        description: "Timetable exported to PDF successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  const exportToExcel = async () => {
    try {
      if (!generatedTimetable) {
        toast({
          title: "No Data",
          description: "Please generate a timetable first before exporting.",
          variant: "destructive",
        })
        return
      }

      // Dynamic import to avoid SSR issues
      const XLSX = await import("xlsx")

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new()
      const wsData: any[][] = []

      // Header row with styling
      wsData.push(["Time Slot", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"])

      // Time slots
      const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"]
      const timeKeys = ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

      timeSlots.forEach((timeSlot, index) => {
        const timeKey = timeKeys[index]
        const row = [timeSlot]

        days.forEach((day) => {
          const sessions = generatedTimetable[day]?.[timeKey] || []
          if (sessions.length > 0) {
            const sessionText = sessions
              .map((s: any) => `${s.course}\nTeacher: ${s.teacher}\nRoom: ${s.resource}\nStudents: ${s.students}`)
              .join("\n\n")
            row.push(sessionText)
          } else {
            row.push("Free Period")
          }
        })
        wsData.push(row)
      })

      // Add summary information
      wsData.push([]) // Empty row
      wsData.push(["SUMMARY"])
      wsData.push(["Total Teachers:", teachers.length])
      wsData.push(["Total Courses:", courses.length])
      wsData.push(["Total Resources:", resources.length])
      wsData.push(["Generated on:", new Date().toLocaleDateString()])

      const ws = XLSX.utils.aoa_to_sheet(wsData)

      // Set column widths
      ws["!cols"] = [
        { wch: 12 }, // Time column
        { wch: 25 }, // Monday
        { wch: 25 }, // Tuesday
        { wch: 25 }, // Wednesday
        { wch: 25 }, // Thursday
        { wch: 25 }, // Friday
      ]

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Weekly Timetable")

      // Create a second sheet with teacher schedules
      const teacherWsData: any[][] = []
      teacherWsData.push(["Teacher", "Course", "Day", "Time", "Room", "Students"])

      Object.entries(generatedTimetable).forEach(([day, daySchedule]: [string, any]) => {
        Object.entries(daySchedule).forEach(([time, sessions]: [string, any]) => {
          if (Array.isArray(sessions) && sessions.length > 0) {
            sessions.forEach((session: any) => {
              teacherWsData.push([session.teacher, session.course, day, time, session.resource, session.students])
            })
          }
        })
      })

      const teacherWs = XLSX.utils.aoa_to_sheet(teacherWsData)
      XLSX.utils.book_append_sheet(wb, teacherWs, "Teacher Schedule")

      // Create blob and download file manually instead of using XLSX.writeFile
      const timestamp = new Date().toISOString().split("T")[0]
      const filename = `timetable_${timestamp}.xlsx`

      // Convert workbook to array buffer
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })

      // Create blob and download
      const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      const url = URL.createObjectURL(blob)

      // Create download link and trigger download
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Excel Export Successful!",
        description: `Timetable exported with ${wsData.length - 7} time slots across 2 worksheets.`,
      })
    } catch (error) {
      console.error("Excel export error:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export Excel file. Please ensure your browser supports file downloads.",
        variant: "destructive",
      })
    }
  }

  const sendEmail = async () => {
    try {
      if (!generatedTimetable) {
        toast({
          title: "No Data",
          description: "Please generate a timetable first before sending email.",
          variant: "destructive",
        })
        return
      }

      // Create comprehensive email content
      let emailContent = "🎓 AI GENERATED TIMETABLE\n"
      emailContent += "=".repeat(50) + "\n\n"

      emailContent += `Generated on: ${new Date().toLocaleDateString()}\n`
      emailContent += `Total Teachers: ${teachers.length}\n`
      emailContent += `Total Courses: ${courses.length}\n`
      emailContent += `Total Resources: ${resources.length}\n\n`

      // Weekly schedule
      emailContent += "📅 WEEKLY SCHEDULE:\n"
      emailContent += "-".repeat(30) + "\n\n"

      const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"]
      const timeKeys = ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"]

      Object.entries(generatedTimetable).forEach(([day, daySchedule]: [string, any]) => {
        emailContent += `📌 ${day.toUpperCase()}:\n`

        let hasClasses = false
        timeKeys.forEach((timeKey, index) => {
          const sessions = daySchedule[timeKey] || []
          if (Array.isArray(sessions) && sessions.length > 0) {
            hasClasses = true
            sessions.forEach((session: any) => {
              emailContent += `   ${timeSlots[index]}: ${session.course}\n`
              emailContent += `      👨‍🏫 Teacher: ${session.teacher}\n`
              emailContent += `      🏢 Room: ${session.resource}\n`
              emailContent += `      👥 Students: ${session.students}\n\n`
            })
          }
        })

        if (!hasClasses) {
          emailContent += "   No classes scheduled\n"
        }
        emailContent += "\n"
      })

      // Teacher summary
      emailContent += "👨‍🏫 TEACHER ASSIGNMENTS:\n"
      emailContent += "-".repeat(30) + "\n"
      teachers.forEach((teacher) => {
        emailContent += `• ${teacher.name}: ${teacher.subjects.join(", ")}\n`
      })

      emailContent += "\n📧 This timetable was generated using AI optimization algorithms.\n"
      emailContent += "For any changes or updates, please contact the administration.\n"

      // Create mailto link with enhanced formatting
      const subject = encodeURIComponent(`🎓 AI Generated Timetable - ${new Date().toLocaleDateString()}`)
      const body = encodeURIComponent(emailContent)

      // Check if the email content is too long for mailto (some email clients have limits)
      if (body.length > 2000) {
        // Fallback: Create a simplified version
        let shortContent = "🎓 AI Generated Timetable\n\n"
        shortContent += "Please find the weekly timetable below:\n\n"

        Object.entries(generatedTimetable).forEach(([day, daySchedule]: [string, any]) => {
          shortContent += `${day}: `
          const dayClasses = []
          Object.entries(daySchedule).forEach(([time, sessions]: [string, any]) => {
            if (Array.isArray(sessions) && sessions.length > 0) {
              sessions.forEach((session: any) => {
                dayClasses.push(`${time} ${session.course}`)
              })
            }
          })
          shortContent += dayClasses.length > 0 ? dayClasses.join(", ") : "No classes"
          shortContent += "\n"
        })

        const shortBody = encodeURIComponent(shortContent)
        const mailtoLink = `mailto:?subject=${subject}&body=${shortBody}`
        window.open(mailtoLink)
      } else {
        const mailtoLink = `mailto:?subject=${subject}&body=${body}`
        window.open(mailtoLink)
      }

      toast({
        title: "📧 Email Client Opened",
        description: "Your default email client has been opened with the formatted timetable content.",
      })
    } catch (error) {
      console.error("Email error:", error)
      toast({
        title: "Email Failed",
        description: "Failed to open email client. Please try copying the timetable manually.",
        variant: "destructive",
      })
    }
  }

  const syncToPhone = async () => {
    try {
      // Create ICS calendar file content
      let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//AI Timetable//EN\n"

      const now = new Date()
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1)) // Monday

      Object.entries(generatedTimetable).forEach(([day, daySchedule]: [string, any], dayIndex) => {
        Object.entries(daySchedule).forEach(([time, sessions]: [string, any]) => {
          if (Array.isArray(sessions) && sessions.length > 0) {
            sessions.forEach((session: any, sessionIndex: number) => {
              const eventDate = new Date(startOfWeek)
              eventDate.setDate(startOfWeek.getDate() + dayIndex)

              const [hours, minutes] = time.split(":").map(Number)
              eventDate.setHours(hours, minutes, 0, 0)

              const endDate = new Date(eventDate)
              endDate.setHours(hours + 1, minutes, 0, 0) // 1 hour duration

              const formatDate = (date: Date) => {
                return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
              }

              icsContent += `BEGIN:VEVENT\n`
              icsContent += `UID:${Date.now()}-${dayIndex}-${sessionIndex}@timetable.ai\n`
              icsContent += `DTSTART:${formatDate(eventDate)}\n`
              icsContent += `DTEND:${formatDate(endDate)}\n`
              icsContent += `SUMMARY:${session.course}\n`
              icsContent += `DESCRIPTION:Teacher: ${session.teacher}\\nLocation: ${session.resource}\\nStudents: ${session.students}\n`
              icsContent += `LOCATION:${session.resource}\n`
              icsContent += `END:VEVENT\n`
            })
          }
        })
      })

      icsContent += "END:VCALENDAR"

      // Create and download ICS file
      const blob = new Blob([icsContent], { type: "text/calendar" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "timetable.ics"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Calendar File Downloaded",
        description: "Import the .ics file to your phone's calendar app to sync the timetable.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create calendar file. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Timetable Generation
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Generate optimized schedule using advanced AI algorithms
              </p>
            </div>
            <Button
              onClick={onGenerate}
              disabled={isGenerating || !canGenerate}
              className="flex items-center gap-2 w-full lg:w-auto"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4" />
                  Generate Schedule
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Validation Alerts */}
          {!canGenerate && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-medium">Missing Required Data</div>
                  <div className="text-sm space-y-1">
                    {teachers.length === 0 && <div>• Add at least one teacher</div>}
                    {courses.length === 0 && <div>• Add at least one course</div>}
                    {resources.length === 0 && <div>• Add at least one resource (classroom/lab)</div>}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Generation Status */}
          {isGenerating && (
            <Alert className="mb-6">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-medium">AI Processing in Progress</div>
                  <div className="text-sm space-y-1">
                    <div>• Analyzing teacher availability and constraints</div>
                    <div>• Processing course requirements with AI optimization</div>
                    <div>• Matching resources to course needs</div>
                    <div>• Minimizing conflicts and maximizing efficiency</div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {canGenerate && !isGenerating && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Teachers Ready</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{teachers.length}</p>
                <p className="text-sm text-blue-700">
                  {teachers.reduce((sum, t) => sum + Object.values(t.availability).flat().length, 0)} total time slots
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900">Courses to Schedule</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{courses.length}</p>
                <p className="text-sm text-green-700">
                  {courses.reduce((sum, c) => sum + c.weeklyHours, 0)} total weekly hours
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-900">Resources Available</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{resources.length}</p>
                <p className="text-sm text-purple-700">
                  {resources.reduce((sum, r) => sum + r.capacity, 0)} total capacity
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {generatedTimetable && (
        <>
          {/* Export and Share Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Export & Share Options
              </CardTitle>
              <p className="text-sm text-muted-foreground">Export your timetable in various formats</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button onClick={exportToPDF} className="flex items-center gap-2 h-auto p-4 flex-col">
                  <FileText className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Export PDF</div>
                    <div className="text-xs opacity-75">Printable format</div>
                  </div>
                </Button>

                <Button
                  onClick={exportToExcel}
                  variant="outline"
                  className="flex items-center gap-2 h-auto p-4 flex-col bg-transparent"
                >
                  <Download className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Export Excel</div>
                    <div className="text-xs opacity-75">Spreadsheet format</div>
                  </div>
                </Button>

                <Button
                  onClick={sendEmail}
                  variant="outline"
                  className="flex items-center gap-2 h-auto p-4 flex-col bg-transparent"
                >
                  <Mail className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Send Email</div>
                    <div className="text-xs opacity-75">Share via email</div>
                  </div>
                </Button>

                <Button
                  onClick={syncToPhone}
                  variant="outline"
                  className="flex items-center gap-2 h-auto p-4 flex-col bg-transparent"
                >
                  <Smartphone className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Sync to Phone</div>
                    <div className="text-xs opacity-75">Calendar integration</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generated Timetable Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Generated Timetable
              </CardTitle>
              <p className="text-sm text-muted-foreground">AI-optimized schedule with conflict resolution</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-6 gap-2 text-sm min-w-[900px]">
                  {/* Header */}
                  <div className="font-semibold bg-gray-100 p-4 rounded-lg text-center">Time Slot</div>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                    <div key={day} className="font-semibold bg-gray-100 p-4 rounded-lg text-center">
                      {day}
                    </div>
                  ))}

                  {/* Time slots */}
                  {["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"].map((time) => (
                    <React.Fragment key={time}>
                      <div className="font-medium bg-gray-50 p-4 rounded-lg text-center border">{time}</div>
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                        <div key={`${day}-${time}`} className="border rounded-lg p-2 min-h-[100px] bg-white">
                          {generatedTimetable[day]?.[time]?.map((session: any, index: number) => (
                            <div
                              key={index}
                              className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 mb-2 text-xs hover:shadow-md transition-shadow"
                            >
                              <div className="font-semibold text-blue-900 mb-1 truncate">{session.course}</div>
                              <div className="text-blue-700 mb-1 truncate">👨‍🏫 {session.teacher}</div>
                              <div className="text-blue-600 mb-1 truncate">🏢 {session.resource}</div>
                              <div className="flex items-center justify-between">
                                <span className="text-blue-600">👥 {session.students}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-1">Total Sessions</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {Object.values(generatedTimetable).reduce(
                      (total: number, day: any) =>
                        total +
                        Object.values(day).reduce(
                          (dayTotal: number, timeSlot: any) =>
                            dayTotal + (Array.isArray(timeSlot) ? timeSlot.length : 0),
                          0,
                        ),
                      0,
                    )}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-1">Courses Scheduled</h4>
                  <p className="text-2xl font-bold text-green-600">{courses.length}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-1">Teachers Assigned</h4>
                  <p className="text-2xl font-bold text-purple-600">{teachers.length}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-medium text-orange-900 mb-1">Resources Used</h4>
                  <p className="text-2xl font-bold text-orange-600">{resources.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
