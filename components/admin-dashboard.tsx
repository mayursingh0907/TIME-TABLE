"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Settings,
  RefreshCw,
  Send,
  Shield,
  Users,
  BookOpen,
  Calendar,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Clock,
  Award,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import AdminTeacherManagement from "./admin-teacher-management"
import AdminCourseManagement from "./admin-course-management"
import AdminResourceManagement from "./admin-resource-management"
import TimetableGenerator from "./timetable-generator"

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

export default function AdminDashboard() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [generatedTimetable, setGeneratedTimetable] = useState<Record<string, Record<string, any[]>> | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const { toast } = useToast()

  useEffect(() => {
    setTeachers([
      {
        id: 1,
        name: "Dr. Sarah Smith",
        email: "sarah.smith@university.edu",
        subjects: ["Advanced Mathematics", "Calculus", "Statistics"],
        availability: {
          Monday: ["9:00", "10:00", "11:00"],
          Tuesday: ["9:00", "14:00", "15:00"],
          Wednesday: ["10:00", "11:00", "14:00"],
          Thursday: ["9:00", "10:00", "15:00"],
          Friday: ["9:00", "11:00"],
        },
        maxHours: 20,
        department: "Mathematics",
      },
      {
        id: 2,
        name: "Prof. Michael Johnson",
        email: "michael.johnson@university.edu",
        subjects: ["General Physics", "Quantum Physics", "Thermodynamics"],
        availability: {
          Monday: ["10:00", "11:00", "14:00"],
          Tuesday: ["9:00", "10:00", "11:00"],
          Wednesday: ["9:00", "14:00", "15:00"],
          Thursday: ["11:00", "14:00", "15:00"],
          Friday: ["10:00", "14:00"],
        },
        maxHours: 18,
        department: "Physics",
      },
      {
        id: 3,
        name: "Ms. Emily Davis",
        email: "emily.davis@university.edu",
        subjects: ["English Literature", "Creative Writing", "Grammar"],
        availability: {
          Monday: ["14:00", "15:00", "16:00"],
          Tuesday: ["15:00", "16:00"],
          Wednesday: ["11:00", "15:00", "16:00"],
          Thursday: ["14:00", "15:00"],
          Friday: ["15:00", "16:00"],
        },
        maxHours: 16,
        department: "English",
      },
    ])

    setCourses([
      {
        id: 1,
        name: "Advanced Mathematics",
        code: "MATH301",
        teacher: "Dr. Sarah Smith",
        teacherId: 1,
        weeklyHours: 4,
        studentCount: 30,
        difficulty: "high",
        department: "Mathematics",
        semester: "Fall 2024",
      },
      {
        id: 2,
        name: "General Physics",
        code: "PHYS201",
        teacher: "Prof. Michael Johnson",
        teacherId: 2,
        weeklyHours: 3,
        studentCount: 25,
        difficulty: "medium",
        department: "Physics",
        semester: "Fall 2024",
      },
      {
        id: 3,
        name: "English Literature",
        code: "ENG101",
        teacher: "Ms. Emily Davis",
        teacherId: 3,
        weeklyHours: 3,
        studentCount: 28,
        difficulty: "low",
        department: "English",
        semester: "Fall 2024",
      },
    ])

    setResources([
      {
        id: 1,
        name: "Main Auditorium",
        type: "Lecture Hall",
        capacity: 100,
        equipment: ["Projector", "Sound System", "Whiteboard"],
        location: "Building A, Floor 1",
        availability: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      },
      {
        id: 2,
        name: "Physics Laboratory A",
        type: "Laboratory",
        capacity: 30,
        equipment: ["Lab Equipment", "Safety Gear", "Computers"],
        location: "Building B, Floor 2",
        availability: ["9:00", "10:00", "11:00", "14:00", "15:00"],
      },
      {
        id: 3,
        name: "Computer Lab 1",
        type: "Computer Lab",
        capacity: 35,
        equipment: ["30 Computers", "Projector", "Network Access"],
        location: "Building C, Floor 1",
        availability: ["10:00", "11:00", "14:00", "15:00", "16:00"],
      },
    ])
  }, [])

  const generateTimetable = useCallback(async () => {
    if (teachers.length === 0 || courses.length === 0 || resources.length === 0) {
      toast({
        title: "Cannot Generate Timetable",
        description: "Please add teachers, courses, and resources first.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const timetable: Record<string, Record<string, any[]>> = {}
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
      const timeSlots = ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"]

      // Initialize empty timetable
      days.forEach((day) => {
        timetable[day] = {}
        timeSlots.forEach((slot) => {
          timetable[day][slot] = []
        })
      })

      const scheduledSessions = new Set<string>()

      for (const course of courses) {
        const teacher = teachers.find((t) => t.id === course.teacherId)
        const availableResource = resources.find((r) => r.capacity >= course.studentCount)

        if (!teacher || !availableResource) {
          console.warn(`Skipping course ${course.name}: missing teacher or resource`)
          continue
        }

        let sessionsScheduled = 0
        const sessionsNeeded = course.weeklyHours

        // Try to schedule sessions
        for (const day of days) {
          if (sessionsScheduled >= sessionsNeeded) break

          const teacherAvailableSlots = teacher.availability[day] || []

          for (const slot of teacherAvailableSlots) {
            if (sessionsScheduled >= sessionsNeeded) break

            const sessionKey = `${teacher.id}-${day}-${slot}`
            const resourceKey = `${availableResource.id}-${day}-${slot}`

            // Check for conflicts
            if (!scheduledSessions.has(sessionKey) && !scheduledSessions.has(resourceKey)) {
              timetable[day][slot].push({
                course: course.name,
                code: course.code,
                teacher: teacher.name,
                resource: availableResource.name,
                students: course.studentCount,
                difficulty: course.difficulty,
                department: course.department,
              })

              scheduledSessions.add(sessionKey)
              scheduledSessions.add(resourceKey)
              sessionsScheduled++
            }
          }
        }

        if (sessionsScheduled < sessionsNeeded) {
          toast({
            title: "Partial Schedule",
            description: `Could only schedule ${sessionsScheduled}/${sessionsNeeded} sessions for ${course.name}`,
            variant: "destructive",
          })
        }
      }

      setGeneratedTimetable(timetable)
      toast({
        title: "Timetable Generated Successfully",
        description: "AI-optimized schedule has been created with conflict resolution.",
      })
    } catch (error) {
      console.error("Error generating timetable:", error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate timetable. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }, [teachers, courses, resources, toast])

  const publishTimetable = () => {
    if (!generatedTimetable) {
      toast({
        title: "No Timetable to Publish",
        description: "Please generate a timetable first.",
        variant: "destructive",
      })
      return
    }

    setIsPublished(true)
    toast({
      title: "Timetable Published!",
      description: "The timetable has been successfully published to all users.",
    })
  }

  // CRUD operations for teachers
  const addTeacher = (teacherData: Omit<Teacher, "id">) => {
    const newTeacher: Teacher = {
      ...teacherData,
      id: Date.now(),
    }
    setTeachers([...teachers, newTeacher])
    toast({
      title: "Teacher Added",
      description: `${teacherData.name} has been added to the system.`,
    })
  }

  const updateTeacher = (id: number, teacherData: Partial<Teacher>) => {
    setTeachers(teachers.map((teacher) => (teacher.id === id ? { ...teacher, ...teacherData } : teacher)))
    // Update courses that reference this teacher
    if (teacherData.name) {
      setCourses(courses.map((course) => (course.teacherId === id ? { ...course, teacher: teacherData.name } : course)))
    }
    toast({
      title: "Teacher Updated",
      description: "Teacher information has been updated successfully.",
    })
  }

  const handleDeleteTeacher = (id: number) => {
    const teacher = teachers.find((t) => t.id === id)
    const assignedCourses = courses.filter((c) => c.teacherId === id)

    if (assignedCourses.length > 0) {
      toast({
        title: "Cannot Delete Teacher",
        description: `${teacher?.name} is assigned to ${assignedCourses.length} course(s). Please reassign or delete those courses first.`,
        variant: "destructive",
      })
      return
    }

    setTeachers((prev) => prev.filter((teacher) => teacher.id !== id))
    toast({
      title: "Teacher Removed",
      description: `${teacher?.name} has been removed from the system.`,
    })
  }

  // CRUD operations for courses
  const addCourse = (courseData: Omit<Course, "id">) => {
    const newCourse: Course = {
      ...courseData,
      id: Date.now(),
    }
    setCourses([...courses, newCourse])
    toast({
      title: "Course Added",
      description: `${courseData.name} has been added to the system.`,
    })
  }

  const updateCourse = (id: number, courseData: Partial<Course>) => {
    setCourses(courses.map((course) => (course.id === id ? { ...course, ...courseData } : course)))
    toast({
      title: "Course Updated",
      description: "Course information has been updated successfully.",
    })
  }

  const deleteCourse = (id: number) => {
    const course = courses.find((c) => c.id === id)
    setCourses(courses.filter((course) => course.id !== id))
    toast({
      title: "Course Removed",
      description: `${course?.name} has been removed from the system.`,
    })
  }

  // CRUD operations for resources
  const addResource = (resourceData: Omit<Resource, "id">) => {
    const newResource: Resource = {
      ...resourceData,
      id: Date.now(),
    }
    setResources([...resources, newResource])
    toast({
      title: "Resource Added",
      description: `${resourceData.name} has been added to the system.`,
    })
  }

  const updateResource = (id: number, resourceData: Partial<Resource>) => {
    setResources(resources.map((resource) => (resource.id === id ? { ...resource, ...resourceData } : resource)))
    toast({
      title: "Resource Updated",
      description: "Resource information has been updated successfully.",
    })
  }

  const deleteResource = (id: number) => {
    const resource = resources.find((r) => r.id === id)
    setResources(resources.filter((resource) => resource.id !== id))
    toast({
      title: "Resource Removed",
      description: `${resource?.name} has been removed from the system.`,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-800 rounded-2xl shadow-xl border border-white/20 p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Shield className="h-10 w-10" />
                </div>
                Timetable Management System
              </h1>
              <p className="text-blue-100 text-lg font-medium">
                AI-powered academic scheduling and resource optimization
              </p>
              <div className="flex items-center gap-2 text-blue-200">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm">Intelligent conflict resolution & automated scheduling</span>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold">{teachers.length}</div>
                    <div className="text-xs text-blue-200">Teachers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{courses.length}</div>
                    <div className="text-xs text-blue-200">Courses</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{resources.length}</div>
                    <div className="text-xs text-blue-200">Resources</div>
                  </div>
                </div>
              </div>
              {isPublished && (
                <div className="flex items-center gap-3 bg-green-500/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-green-400/30">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                  <span className="font-semibold text-green-100">Timetable Published</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg border border-white/20 dark:border-slate-700/50 rounded-2xl p-2 h-16">
            <TabsTrigger
              value="dashboard"
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger
              value="teachers"
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Teachers</span>
            </TabsTrigger>
            <TabsTrigger
              value="courses"
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Courses</span>
            </TabsTrigger>
            <TabsTrigger
              value="resources"
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Resources</span>
            </TabsTrigger>
            <TabsTrigger
              value="generation"
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Generate</span>
            </TabsTrigger>
            <TabsTrigger
              value="publishing"
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Publish</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl border border-blue-400/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative flex items-center justify-between text-white">
                  <div className="space-y-2">
                    <p className="text-blue-100 font-medium">Total Teachers</p>
                    <p className="text-4xl font-bold">{teachers.length}</p>
                    <div className="flex items-center gap-1 text-blue-200">
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-xs">Active faculty</span>
                    </div>
                  </div>
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <Users className="h-8 w-8" />
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 shadow-xl border border-emerald-400/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative flex items-center justify-between text-white">
                  <div className="space-y-2">
                    <p className="text-emerald-100 font-medium">Active Courses</p>
                    <p className="text-4xl font-bold">{courses.length}</p>
                    <div className="flex items-center gap-1 text-emerald-200">
                      <Award className="h-3 w-3" />
                      <span className="text-xs">This semester</span>
                    </div>
                  </div>
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <BookOpen className="h-8 w-8" />
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl p-6 shadow-xl border border-violet-400/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative flex items-center justify-between text-white">
                  <div className="space-y-2">
                    <p className="text-violet-100 font-medium">Available Resources</p>
                    <p className="text-4xl font-bold">{resources.length}</p>
                    <div className="flex items-center gap-1 text-violet-200">
                      <Settings className="h-3 w-3" />
                      <span className="text-xs">Facilities</span>
                    </div>
                  </div>
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <Settings className="h-8 w-8" />
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-xl border border-orange-400/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative flex items-center justify-between text-white">
                  <div className="space-y-2">
                    <p className="text-orange-100 font-medium">Total Students</p>
                    <p className="text-4xl font-bold">
                      {courses.reduce((sum, course) => sum + course.studentCount, 0)}
                    </p>
                    <div className="flex items-center gap-1 text-orange-200">
                      <Users className="h-3 w-3" />
                      <span className="text-xs">Enrolled</span>
                    </div>
                  </div>
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <Calendar className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 dark:border-slate-700/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Quick Actions</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Button
                  onClick={() => setActiveTab("teachers")}
                  variant="outline"
                  className="h-24 flex flex-col gap-3 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-emerald-200 dark:border-emerald-800 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900 dark:hover:to-teal-900 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  <Users className="h-6 w-6 text-emerald-600" />
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">Manage Teachers</span>
                </Button>
                <Button
                  onClick={() => setActiveTab("courses")}
                  variant="outline"
                  className="h-24 flex flex-col gap-3 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-orange-200 dark:border-orange-800 hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-900 dark:hover:to-red-900 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  <BookOpen className="h-6 w-6 text-orange-600" />
                  <span className="font-semibold text-orange-700 dark:text-orange-300">Manage Courses</span>
                </Button>
                <Button
                  onClick={() => setActiveTab("generation")}
                  className="h-24 flex flex-col gap-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  <RefreshCw className="h-6 w-6" />
                  <span className="font-semibold">Generate Timetable</span>
                </Button>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 dark:border-slate-700/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">System Status</h3>
              </div>
              <div className="space-y-4">
                {teachers.length === 0 && (
                  <Alert className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800 dark:text-amber-200">
                      No teachers added yet. Add teachers to start creating your timetable.
                    </AlertDescription>
                  </Alert>
                )}
                {courses.length === 0 && (
                  <Alert className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800 dark:text-amber-200">
                      No courses added yet. Add courses to start creating your timetable.
                    </AlertDescription>
                  </Alert>
                )}
                {resources.length === 0 && (
                  <Alert className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800 dark:text-amber-200">
                      No resources added yet. Add resources like classrooms and labs.
                    </AlertDescription>
                  </Alert>
                )}
                {teachers.length > 0 && courses.length > 0 && resources.length > 0 && !generatedTimetable && (
                  <Alert className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                    <AlertCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      System ready! You can now generate your timetable.
                    </AlertDescription>
                  </Alert>
                )}
                {generatedTimetable && !isPublished && (
                  <Alert className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 dark:text-blue-200">
                      Timetable generated but not published yet. Go to the Publish tab to share it.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="teachers">
            <AdminTeacherManagement
              teachers={teachers}
              onAddTeacher={addTeacher}
              onUpdateTeacher={updateTeacher}
              onDeleteTeacher={handleDeleteTeacher}
            />
          </TabsContent>

          <TabsContent value="courses">
            <AdminCourseManagement
              courses={courses}
              teachers={teachers}
              onAddCourse={addCourse}
              onUpdateCourse={updateCourse}
              onDeleteCourse={deleteCourse}
            />
          </TabsContent>

          <TabsContent value="resources">
            <AdminResourceManagement
              resources={resources}
              onAddResource={addResource}
              onUpdateResource={updateResource}
              onDeleteResource={deleteResource}
            />
          </TabsContent>

          <TabsContent value="generation">
            <TimetableGenerator
              isGenerating={isGenerating}
              onGenerate={generateTimetable}
              generatedTimetable={generatedTimetable}
              teachers={teachers}
              courses={courses}
              resources={resources}
            />
          </TabsContent>

          <TabsContent value="publishing" className="space-y-8">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 dark:border-slate-700/50">
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl">
                      <Send className="h-5 w-5 text-white" />
                    </div>
                    Publishing & Distribution
                  </h3>
                  <p className="text-muted-foreground text-lg">Share timetable with users and stakeholders</p>
                </div>
              </div>

              {generatedTimetable ? (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={publishTimetable}
                      className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                      disabled={isPublished}
                    >
                      <Send className="h-4 w-4" />
                      {isPublished ? "Published" : "Publish to All Users"}
                    </Button>
                    {isPublished && (
                      <div className="flex items-center gap-3 bg-green-100 dark:bg-green-900 px-4 py-2 rounded-xl border border-green-200 dark:border-green-800">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                        <span className="font-semibold text-green-700 dark:text-green-300">Published successfully</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
                      <h4 className="font-bold mb-3 text-blue-900 dark:text-blue-100 flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Email Notifications
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                        Send timetable updates to all teachers and students
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!isPublished}
                        className="w-full border-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 bg-transparent"
                      >
                        Send Emails
                      </Button>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
                      <h4 className="font-bold mb-3 text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Export Options
                      </h4>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-4">
                        Download timetable in various formats
                      </p>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 bg-transparent"
                          disabled={!isPublished}
                        >
                          Export as PDF
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 bg-transparent"
                          disabled={!isPublished}
                        >
                          Export as Excel
                        </Button>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950 border border-violet-200 dark:border-violet-800 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
                      <h4 className="font-bold mb-3 text-violet-900 dark:text-violet-100 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Mobile App
                      </h4>
                      <p className="text-sm text-violet-700 dark:text-violet-300 mb-4">Sync with mobile applications</p>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!isPublished}
                        className="w-full border-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900 bg-transparent"
                      >
                        Sync to Mobile
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                  <div className="p-4 bg-gradient-to-r from-slate-200 to-gray-200 dark:from-slate-700 dark:to-gray-700 rounded-2xl w-fit mx-auto mb-6">
                    <Calendar className="h-12 w-12 text-slate-600 dark:text-slate-400" />
                  </div>
                  <h4 className="text-xl font-bold mb-3 text-foreground">No Timetable Generated</h4>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Generate a timetable first to enable publishing options and share with your academic community.
                  </p>
                  <Button
                    onClick={() => setActiveTab("generation")}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    Go to Generation
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
