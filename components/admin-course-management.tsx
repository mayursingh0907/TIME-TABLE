"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, BookOpen, Users, Clock, Building, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface Teacher {
  id: string
  name: string
  email: string
  subjects: string[]
  availability: Record<string, string[]>
  maxHoursPerWeek: number
  department: string
  phone?: string
}

interface Course {
  id: string
  name: string
  code: string
  teacherName: string
  teacherId: string
  credits: number
  difficulty: string
  studentsEnrolled: number
  duration: number
  requiresLab: boolean
  department: string
  semester: string
}

export default function AdminCourseManagement() {
  const { toast } = useToast()
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    teacherId: "",
    credits: 3,
    studentsEnrolled: 25,
    difficulty: "Beginner",
    department: "",
    semester: "Fall 2024",
    duration: 60,
    requiresLab: false,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const departments = ["Mathematics", "Physics", "Chemistry", "English", "Computer Science", "Biology", "History"]
  const semesters = ["Fall 2024", "Spring 2025", "Summer 2025"]
  const difficulties = ["Beginner", "Intermediate", "Advanced"]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [coursesResponse, teachersResponse] = await Promise.all([fetch("/api/courses"), fetch("/api/teachers")])

      const coursesResult = await coursesResponse.json()
      const teachersResult = await teachersResponse.json()

      if (coursesResult.success) {
        setCourses(coursesResult.data)
      }
      if (teachersResult.success) {
        setTeachers(teachersResult.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      teacherId: "",
      credits: 3,
      studentsEnrolled: 25,
      difficulty: "Beginner",
      department: "",
      semester: "Fall 2024",
      duration: 60,
      requiresLab: false,
    })
    setFormErrors({})
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) errors.name = "Course name is required"
    if (!formData.code.trim()) errors.code = "Course code is required"
    if (!formData.department) errors.department = "Department is required"
    if (!formData.teacherId) errors.teacherId = "Teacher selection is required"
    if (formData.credits < 1 || formData.credits > 10) errors.credits = "Credits must be between 1 and 10"
    if (formData.studentsEnrolled < 1 || formData.studentsEnrolled > 200)
      errors.studentsEnrolled = "Student count must be between 1 and 200"

    // Check if teacher can teach the subject
    const selectedTeacher = teachers.find((t) => t.id === formData.teacherId)
    if (selectedTeacher && selectedTeacher.department !== formData.department) {
      errors.teacherId = "Selected teacher is not from the same department"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }

    const selectedTeacher = teachers.find((t) => t.id === formData.teacherId)
    if (!selectedTeacher) {
      toast({
        title: "Error",
        description: "Selected teacher not found",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    const courseData = {
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      teacherName: selectedTeacher.name,
      teacherId: formData.teacherId,
      credits: formData.credits,
      studentsEnrolled: formData.studentsEnrolled,
      difficulty: formData.difficulty,
      department: formData.department,
      semester: formData.semester,
      duration: formData.duration,
      requiresLab: formData.requiresLab,
    }

    try {
      let response
      if (editingCourse) {
        response = await fetch(`/api/courses/${editingCourse.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(courseData),
        })
      } else {
        response = await fetch("/api/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(courseData),
        })
      }

      const result = await response.json()

      if (result.success) {
        if (editingCourse) {
          setCourses((prev) => prev.map((c) => (c.id === editingCourse.id ? result.data : c)))
          setEditingCourse(null)
          toast({
            title: "Success",
            description: "Course updated successfully",
          })
        } else {
          setCourses((prev) => [...prev, result.data])
          setIsAddDialogOpen(false)
          toast({
            title: "Success",
            description: "Course added successfully",
          })
        }
        resetForm()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save course",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (courseId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        setCourses((prev) => prev.filter((c) => c.id !== courseId))
        toast({
          title: "Success",
          description: "Course deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete course",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete course. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
    setFormData({
      name: course.name,
      code: course.code,
      teacherId: course.teacherId,
      credits: course.credits,
      studentsEnrolled: course.studentsEnrolled,
      difficulty: course.difficulty,
      department: course.department,
      semester: course.semester,
      duration: course.duration,
      requiresLab: course.requiresLab,
    })
    setFormErrors({})
  }

  const handleCancel = () => {
    if (editingCourse) {
      setEditingCourse(null)
    } else {
      setIsAddDialogOpen(false)
    }
    resetForm()
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "advanced":
        return "bg-red-100 text-red-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "beginner":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Filter teachers by department when department is selected
  const availableTeachers = formData.department
    ? teachers.filter((t) => t.department === formData.department)
    : teachers

  const handleDepartmentChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      department: value,
      teacherId: "", // Reset teacher when department changes
    }))
  }

  const CourseForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Course Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className={formErrors.name ? "border-red-500" : ""}
            disabled={submitting}
          />
          {formErrors.name && <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>}
        </div>
        <div>
          <Label htmlFor="code">Course Code *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
            placeholder="e.g., MATH301"
            className={formErrors.code ? "border-red-500" : ""}
            disabled={submitting}
          />
          {formErrors.code && <p className="text-sm text-red-500 mt-1">{formErrors.code}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="department">Department *</Label>
          <Select value={formData.department} onValueChange={handleDepartmentChange} disabled={submitting}>
            <SelectTrigger className={formErrors.department ? "border-red-500" : ""}>
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
          {formErrors.department && <p className="text-sm text-red-500 mt-1">{formErrors.department}</p>}
        </div>
        <div>
          <Label htmlFor="semester">Semester *</Label>
          <Select
            value={formData.semester}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, semester: value }))}
            disabled={submitting}
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
        <Label htmlFor="teacher">Assigned Teacher *</Label>
        <Select
          value={formData.teacherId}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, teacherId: value }))}
          disabled={!formData.department || submitting}
        >
          <SelectTrigger className={formErrors.teacherId ? "border-red-500" : ""}>
            <SelectValue placeholder={formData.department ? "Select teacher" : "Select department first"} />
          </SelectTrigger>
          <SelectContent>
            {availableTeachers.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.name} - {teacher.department}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formErrors.teacherId && <p className="text-sm text-red-500 mt-1">{formErrors.teacherId}</p>}
        {formData.department && availableTeachers.length === 0 && (
          <p className="text-sm text-amber-600 mt-1">No teachers available in {formData.department} department</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="credits">Credits *</Label>
          <Input
            id="credits"
            type="number"
            min="1"
            max="10"
            value={formData.credits}
            onChange={(e) => setFormData((prev) => ({ ...prev, credits: Number.parseInt(e.target.value) || 0 }))}
            className={formErrors.credits ? "border-red-500" : ""}
            disabled={submitting}
          />
          {formErrors.credits && <p className="text-sm text-red-500 mt-1">{formErrors.credits}</p>}
        </div>
        <div>
          <Label htmlFor="studentsEnrolled">Student Count *</Label>
          <Input
            id="studentsEnrolled"
            type="number"
            min="1"
            max="200"
            value={formData.studentsEnrolled}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, studentsEnrolled: Number.parseInt(e.target.value) || 0 }))
            }
            className={formErrors.studentsEnrolled ? "border-red-500" : ""}
            disabled={submitting}
          />
          {formErrors.studentsEnrolled && <p className="text-sm text-red-500 mt-1">{formErrors.studentsEnrolled}</p>}
        </div>
        <div>
          <Label htmlFor="difficulty">Difficulty Level *</Label>
          <Select
            value={formData.difficulty}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, difficulty: value }))}
            disabled={submitting}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map((diff) => (
                <SelectItem key={diff} value={diff}>
                  {diff}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={handleCancel} disabled={submitting}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          <Save className="h-4 w-4 mr-2" />
          {submitting ? "Saving..." : editingCourse ? "Update Course" : "Add Course"}
        </Button>
      </div>
    </form>
  )

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading courses...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Management ({courses.length})
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" disabled={teachers.length === 0}>
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
        {teachers.length === 0 && <p className="text-sm text-amber-600">Add teachers first before creating courses</p>}
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              No courses added yet.{" "}
              {teachers.length > 0
                ? 'Click "Add New Course" to get started.'
                : "Add teachers first, then create courses."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
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
                      Instructor: <span className="font-medium">{course.teacherName}</span>
                    </p>

                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.studentsEnrolled} students
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.credits} credits • {course.duration}min
                      </div>
                      {course.requiresLab && (
                        <Badge variant="secondary" className="text-xs">
                          Lab Required
                        </Badge>
                      )}
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
                      onClick={() => handleDelete(course.id)}
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
        )}

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
