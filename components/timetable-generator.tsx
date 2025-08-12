"use client"

import React from "react"
import { RefreshCw, Settings, Sparkles, Calendar, Users, BookOpen, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface Teacher {
  id: number
  name: string
  email: string
  subjects: string[]
  availability: Record<string, string[]>
  maxHours: number
  department: string
}

interface Course {
  id: number
  name: string
  code: string
  teacher: string
  teacherId: number
  weeklyHours: number
  studentCount: number
  difficulty: "low" | "medium" | "high"
  department: string
  semester: string
}

interface Resource {
  id: number
  name: string
  type: string
  capacity: number
  equipment: string[]
  location: string
  availability: string[]
}

interface TimetableGeneratorProps {
  isGenerating: boolean
  onGenerate: () => void
  generatedTimetable: any
  teachers: Teacher[]
  courses: Course[]
  resources: Resource[]
}

export default function TimetableGenerator({
  isGenerating,
  onGenerate,
  generatedTimetable,
  teachers,
  courses,
  resources,
}: TimetableGeneratorProps) {
  const canGenerate = teachers.length > 0 && courses.length > 0 && resources.length > 0

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Timetable Generation
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">Generate optimized schedule using advanced AI algorithms</p>
            </div>
            <Button onClick={onGenerate} disabled={isGenerating || !canGenerate} className="flex items-center gap-2">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Generated Timetable
            </CardTitle>
            <p className="text-sm text-gray-600">AI-optimized schedule with conflict resolution</p>
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
                            <div className="font-semibold text-blue-900 mb-1">{session.course}</div>
                            <div className="text-blue-700 mb-1">👨‍🏫 {session.teacher}</div>
                            <div className="text-blue-600 mb-1">🏢 {session.resource}</div>
                            <div className="flex items-center justify-between">
                              <span className="text-blue-600">👥 {session.students}</span>
                              <Badge variant="outline" className="text-xs">
                                {session.code}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-1">Total Sessions</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {Object.values(generatedTimetable).reduce(
                    (total: number, day: any) =>
                      total +
                      Object.values(day).reduce(
                        (dayTotal: number, timeSlot: any) => dayTotal + (Array.isArray(timeSlot) ? timeSlot.length : 0),
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
      )}
    </div>
  )
}
