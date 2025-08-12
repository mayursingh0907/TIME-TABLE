"use client"

import { useState, useEffect, useCallback } from "react"
import { Settings, RefreshCw, Send, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import TeacherManagement from "./teacher-management"
import CourseManagement from "./course-management"
import ResourceManagement from "./resource-management"
import TimetableGenerator from "./timetable-generator"

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

export default function TimetableSystem() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [generatedTimetable, setGeneratedTimetable] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const { toast } = useToast()

  // Initialize sample data
  useEffect(() => {
    setTeachers([
      {
        id: 1,
        name: "Dr. Smith",
        subjects: ["Mathematics", "Statistics"],
        availability: generateAvailability(),
        maxHours: 20,
      },
      {
        id: 2,
        name: "Prof. Johnson",
        subjects: ["Physics", "Chemistry"],
        availability: generateAvailability(),
        maxHours: 18,
      },
      {
        id: 3,
        name: "Ms. Davis",
        subjects: ["English", "Literature"],
        availability: generateAvailability(),
        maxHours: 22,
      },
    ])

    setCourses([
      {
        id: 1,
        name: "Advanced Mathematics",
        teacher: "Dr. Smith",
        weeklyHours: 4,
        studentCount: 30,
        difficulty: "high",
      },
      {
        id: 2,
        name: "General Physics",
        teacher: "Prof. Johnson",
        weeklyHours: 3,
        studentCount: 25,
        difficulty: "medium",
      },
      {
        id: 3,
        name: "English Literature",
        teacher: "Ms. Davis",
        weeklyHours: 3,
        studentCount: 28,
        difficulty: "medium",
      },
    ])

    setResources([
      {
        id: 1,
        name: "Physics Lab",
        type: "laboratory",
        capacity: 20,
        equipment: ["microscopes", "computers"],
      },
      {
        id: 2,
        name: "Main Auditorium",
        type: "classroom",
        capacity: 100,
        equipment: ["projector", "sound system"],
      },
      {
        id: 3,
        name: "Computer Lab",
        type: "laboratory",
        capacity: 30,
        equipment: ["computers", "software"],
      },
    ])
  }, [])

  function generateAvailability() {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    const hours = ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
    const availability: Record<string, string[]> = {}
    days.forEach((day) => {
      availability[day] = hours.filter(() => Math.random() > 0.3)
    })
    return availability
  }

  const generateOptimizedTimetable = useCallback(async () => {
    setIsGenerating(true)

    try {
      // Simulate AI processing
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Generate a sample timetable
      const sampleTimetable = {
        Monday: {
          "9:00": [{ course: "Advanced Mathematics", teacher: "Dr. Smith", resource: "Main Auditorium", students: 30 }],
          "10:00": [{ course: "General Physics", teacher: "Prof. Johnson", resource: "Physics Lab", students: 25 }],
          "11:00": [],
          "14:00": [{ course: "English Literature", teacher: "Ms. Davis", resource: "Computer Lab", students: 28 }],
          "15:00": [],
          "16:00": [],
        },
        Tuesday: {
          "9:00": [{ course: "General Physics", teacher: "Prof. Johnson", resource: "Physics Lab", students: 25 }],
          "10:00": [],
          "11:00": [
            { course: "Advanced Mathematics", teacher: "Dr. Smith", resource: "Main Auditorium", students: 30 },
          ],
          "14:00": [],
          "15:00": [{ course: "English Literature", teacher: "Ms. Davis", resource: "Computer Lab", students: 28 }],
          "16:00": [],
        },
        Wednesday: {
          "9:00": [],
          "10:00": [
            { course: "Advanced Mathematics", teacher: "Dr. Smith", resource: "Main Auditorium", students: 30 },
          ],
          "11:00": [{ course: "English Literature", teacher: "Ms. Davis", resource: "Computer Lab", students: 28 }],
          "14:00": [{ course: "General Physics", teacher: "Prof. Johnson", resource: "Physics Lab", students: 25 }],
          "15:00": [],
          "16:00": [],
        },
        Thursday: {
          "9:00": [{ course: "Advanced Mathematics", teacher: "Dr. Smith", resource: "Main Auditorium", students: 30 }],
          "10:00": [],
          "11:00": [],
          "14:00": [],
          "15:00": [],
          "16:00": [],
        },
        Friday: {
          "9:00": [],
          "10:00": [],
          "11:00": [],
          "14:00": [],
          "15:00": [],
          "16:00": [],
        },
      }

      setGeneratedTimetable(sampleTimetable)
      toast({
        title: "Success!",
        description: "Timetable generated successfully using AI optimization!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate timetable. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }, [teachers, courses, resources, toast])

  const addTeacher = () => {
    const newTeacher: Teacher = {
      id: Date.now(),
      name: `Teacher ${teachers.length + 1}`,
      subjects: ["Subject"],
      availability: generateAvailability(),
      maxHours: 20,
    }
    setTeachers([...teachers, newTeacher])
    toast({
      title: "Teacher Added",
      description: "New teacher has been added to the system.",
    })
  }

  const addCourse = () => {
    const newCourse: Course = {
      id: Date.now(),
      name: `Course ${courses.length + 1}`,
      teacher: teachers[0]?.name || "TBD",
      weeklyHours: 3,
      studentCount: 25,
      difficulty: "medium",
    }
    setCourses([...courses, newCourse])
    toast({
      title: "Course Added",
      description: "New course has been added to the system.",
    })
  }

  const addResource = () => {
    const newResource: Resource = {
      id: Date.now(),
      name: `Room ${resources.length + 1}`,
      type: "classroom",
      capacity: 30,
      equipment: ["basic"],
    }
    setResources([...resources, newResource])
    toast({
      title: "Resource Added",
      description: "New resource has been added to the system.",
    })
  }

  const publishTimetable = () => {
    setIsPublished(true)
    toast({
      title: "Published!",
      description: "Timetable has been published to all users successfully!",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Timetable Management System</h1>
          <p className="text-lg text-gray-600">Sophisticated scheduling with AI optimization and genetic algorithms</p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="setup" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="setup" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Setup
            </TabsTrigger>
            <TabsTrigger value="generation" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Generation
            </TabsTrigger>
            <TabsTrigger value="publishing" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Publishing
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Monitoring
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6">
            <TeacherManagement teachers={teachers} onAddTeacher={addTeacher} />
            <CourseManagement courses={courses} onAddCourse={addCourse} />
            <ResourceManagement resources={resources} onAddResource={addResource} />
          </TabsContent>

          <TabsContent value="generation">
            <TimetableGenerator
              isGenerating={isGenerating}
              onGenerate={generateOptimizedTimetable}
              generatedTimetable={generatedTimetable}
            />
          </TabsContent>

          <TabsContent value="publishing" className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Publishing & Distribution</h3>
                  <p className="text-gray-600 mt-1">Share timetable with users and stakeholders</p>
                </div>
              </div>

              {generatedTimetable ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Button onClick={publishTimetable} className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Publish to All Users
                    </Button>
                    {isPublished && <div className="text-green-600 font-medium">✓ Published successfully</div>}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Generate a timetable first to enable publishing options.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">System Monitoring</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{teachers.length}</div>
                  <div className="text-blue-800">Active Teachers</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{courses.length}</div>
                  <div className="text-green-800">Total Courses</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{resources.length}</div>
                  <div className="text-purple-800">Available Resources</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
