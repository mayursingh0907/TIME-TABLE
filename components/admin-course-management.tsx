"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Edit, Trash2, BookOpen, Users, Clock, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface AdminCourseManagementProps {
  courses: Course[]
  teachers: Teacher[]
  onAddCourse: (course: Omit<Course, "id">) => void
  onUpdateCourse: (id: number, course: Partial<Course>) => void
  onDeleteCourse: (id: number) => void
}

export default function AdminCourseManagement({
  courses,
  teachers,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
}: AdminCourseManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    teacherId: 0,
    weeklyHours: 3,
    studentCount: 25,
    difficulty: "medium" as "low" | "medium" | "high",
    department: "",
    semester: "Fall 2024",
  })

  const departments = ["Mathematics", "Physics", "Chemistry", "English", "Computer Science", "Biology", "History"]
  const semesters = ["Fall 2024", "Spring 2025", "Summer 2025"]

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      teacherId: 0,
      weeklyHours: 3,
      studentCount: 25,
      difficulty: "medium",
      department: "",
      semester: "Fall 2024",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const selectedTeacher = teachers.find((t) => t.id === formData.teacherId)
    if (!selectedTeacher) return

    const courseData = {
      name: formData.name,
      code: formData.code,
      teacher: selectedTeacher.name,
      teacherId: formData.teacherId,
      weeklyHours: formData.weeklyHours,
      studentCount: formData.studentCount,
      difficulty: formData.difficulty,
      department: formData.department,
      semester: formData.semester,
    }

    if (editingCourse) {
      onUpdateCourse(editingCourse.id, courseData)
      setEditingCourse(null)
    } else {
      onAddCourse(courseData)
      setIsAddDialogOpen(false)
    }

    resetForm()
  }

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
    setFormData({
      name: course.name,
      code: course.code,
      teacherId: course.teacherId,
      weeklyHours: course.weeklyHours,
      studentCount: course.studentCount,
      difficulty: course.difficulty,
      department: course.department,
      semester: course.semester,
    })
  }

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

  const CourseForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Course Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="code">Course Code</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
            placeholder="e.g., MATH301"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="department">Department</Label>
          <Select
            value={formData.department}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, department: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="semester">Semester</Label>
          <Select
            value={formData.semester}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, semester: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((sem) => (
                <SelectItem key={sem} value={sem}>
                  {sem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="teacher">Assigned Teacher</Label>
        <Select
          value={formData.teacherId.toString()}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, teacherId: Number.parseInt(value) }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select teacher" />
          </SelectTrigger>
          <SelectContent>
            {teachers.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id.toString()}>
                {teacher.name} - {teacher.department}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="weeklyHours">Weekly Hours</Label>
          <Input
            id="weeklyHours"
            type="number"
            min="1"
            max="10"
            value={formData.weeklyHours}
            onChange={(e) => setFormData((prev) => ({ ...prev, weeklyHours: Number.parseInt(e.target.value) }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="studentCount">Student Count</Label>
          <Input
            id="studentCount"
            type="number"
            min="1"
            max="200"
            value={formData.studentCount}
            onChange={(e) => setFormData((prev) => ({ ...prev, studentCount: Number.parseInt(e.target.value) }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="difficulty">Difficulty Level</Label>
          <Select
            value={formData.difficulty}
            onValueChange={(value: "low" | "medium" | "high") =>
              setFormData((prev) => ({ ...prev, difficulty: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (editingCourse) {
              setEditingCourse(null)
            } else {
              setIsAddDialogOpen(false)
            }
            resetForm()
          }}
        >
          Cancel
        </Button>
        <Button type="submit">{editingCourse ? "Update Course" : "Add Course"}</Button>
      </div>
    </form>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Management
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Course</DialogTitle>
              </DialogHeader>
              <CourseForm />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-4">
                    <h4 className="font-semibold text-lg text-gray-900">{course.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {course.code}
                    </Badge>
                    <Badge className={getDifficultyColor(course.difficulty)}>{course.difficulty}</Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building className="h-4 w-4" />
                    {course.department} • {course.semester}
                  </div>

                  <p className="text-sm text-gray-600">
                    Instructor: <span className="font-medium">{course.teacher}</span>
                  </p>

                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {course.studentCount} students
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {course.weeklyHours}h/week
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(course)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteCourse(course.id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingCourse} onOpenChange={(open) => !open && setEditingCourse(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Course: {editingCourse?.name}</DialogTitle>
            </DialogHeader>
            <CourseForm />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
