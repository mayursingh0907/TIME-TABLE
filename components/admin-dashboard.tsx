"use client"

import { useState, useEffect, useCallback } from "react"
import { Settings, RefreshCw, Send, Shield, Users, BookOpen, Calendar, AlertCircle } from "lucide-react"
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
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-card rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                Timetable Management System
              </h1>
              <p className="text-muted-foreground mt-2">Comprehensive academic scheduling and resource management</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-lg">
                <strong>{teachers.length}</strong> Teachers • <strong>{courses.length}</strong> Courses •{" "}
                <strong>{resources.length}</strong> Resources
              </div>
              {isPublished && (
                <div className="flex items-center gap-2 text-green-600 font-medium bg-green-50 dark:bg-green-950 px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                  Timetable Published
                </div>
              )}
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-card shadow-sm">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="teachers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Teachers
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="generation" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="publishing" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Publish
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-card rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Teachers</p>
                    <p className="text-3xl font-bold text-blue-600">{teachers.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-card rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Courses</p>
                    <p className="text-3xl font-bold text-green-600">{courses.length}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="bg-card rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Available Resources</p>
                    <p className="text-3xl font-bold text-purple-600">{resources.length}</p>
                  </div>
                  <Settings className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <div className="bg-card rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {courses.reduce((sum, course) => sum + course.studentCount, 0)}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={() => setActiveTab("teachers")} variant="outline" className="h-20 flex flex-col gap-2">
                  <Users className="h-6 w-6" />
                  Manage Teachers
                </Button>
                <Button onClick={() => setActiveTab("courses")} variant="outline" className="h-20 flex flex-col gap-2">
                  <BookOpen className="h-6 w-6" />
                  Manage Courses
                </Button>
                <Button
                  onClick={() => setActiveTab("generation")}
                  className="h-20 flex flex-col gap-2 bg-primary hover:bg-primary/90"
                >
                  <RefreshCw className="h-6 w-6" />
                  Generate Timetable
                </Button>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4 text-foreground">System Status</h3>
              <div className="space-y-3">
                {teachers.length === 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No teachers added yet. Add teachers to start creating your timetable.
                    </AlertDescription>
                  </Alert>
                )}
                {courses.length === 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No courses added yet. Add courses to start creating your timetable.
                    </AlertDescription>
                  </Alert>
                )}
                {resources.length === 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>No resources added yet. Add resources like classrooms and labs.</AlertDescription>
                  </Alert>
                )}
                {teachers.length > 0 && courses.length > 0 && resources.length > 0 && !generatedTimetable && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>System ready! You can now generate your timetable.</AlertDescription>
                  </Alert>
                )}
                {generatedTimetable && !isPublished && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
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

          <TabsContent value="publishing" className="space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-medium text-foreground">Publishing & Distribution</h3>
                  <p className="text-muted-foreground mt-1">Share timetable with users and stakeholders</p>
                </div>
              </div>

              {generatedTimetable ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={publishTimetable}
                      className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                      disabled={isPublished}
                    >
                      <Send className="h-4 w-4" />
                      {isPublished ? "Published" : "Publish to All Users"}
                    </Button>
                    {isPublished && (
                      <div className="flex items-center gap-2 text-green-600 font-medium">
                        <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                        Published successfully
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="border rounded-lg p-4 bg-card">
                      <h4 className="font-medium mb-2 text-foreground">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Send timetable updates to all teachers and students
                      </p>
                      <Button variant="outline" size="sm" disabled={!isPublished}>
                        Send Emails
                      </Button>
                    </div>
                    <div className="border rounded-lg p-4 bg-card">
                      <h4 className="font-medium mb-2 text-foreground">Export Options</h4>
                      <p className="text-sm text-muted-foreground mb-3">Download timetable in various formats</p>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full bg-transparent" disabled={!isPublished}>
                          Export as PDF
                        </Button>
                        <Button variant="outline" size="sm" className="w-full bg-transparent" disabled={!isPublished}>
                          Export as Excel
                        </Button>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4 bg-card">
                      <h4 className="font-medium mb-2 text-foreground">Mobile App</h4>
                      <p className="text-sm text-muted-foreground mb-3">Sync with mobile applications</p>
                      <Button variant="outline" size="sm" disabled={!isPublished}>
                        Sync to Mobile
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h4 className="text-lg font-medium mb-2 text-foreground">No Timetable Generated</h4>
                  <p className="mb-4">Generate a timetable first to enable publishing options.</p>
                  <Button onClick={() => setActiveTab("generation")}>Go to Generation</Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
