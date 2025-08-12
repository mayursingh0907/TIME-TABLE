"use client"
import { Plus, BookOpen, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Course {
  id: number
  name: string
  teacher: string
  weeklyHours: number
  studentCount: number
  difficulty: "low" | "medium" | "high"
}

interface CourseManagementProps {
  courses: Course[]
  onAddCourse: () => void
}

export default function CourseManagement({ courses, onAddCourse }: CourseManagementProps) {
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Courses
          </CardTitle>
          <Button onClick={onAddCourse} variant="outline" className="flex items-center gap-2 bg-transparent">
            <Plus className="h-4 w-4" />
            Add Course
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">{course.name}</h4>
                  <p className="text-sm text-gray-600">Teacher: {course.teacher}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {course.studentCount} students
                    </div>
                    <div>{course.weeklyHours}h/week</div>
                  </div>
                </div>
                <Badge className={getDifficultyColor(course.difficulty)}>{course.difficulty}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
