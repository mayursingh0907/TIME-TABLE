"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Users, Clock, Mail, Building, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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

export default function AdminTeacherManagement() {
  const { toast } = useToast()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subjects: "",
    maxHoursPerWeek: 20,
    department: "",
    phone: "",
    availability: {} as Record<string, string[]>,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const departments = ["Mathematics", "Physics", "Chemistry", "English", "Computer Science", "Biology", "History"]
  const timeSlots = ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/teachers")
      const result = await response.json()

      if (result.success) {
        setTeachers(result.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch teachers",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch teachers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      subjects: "",
      maxHoursPerWeek: 20,
      department: "",
      phone: "",
      availability: {},
    })
    setFormErrors({})
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) errors.name = "Name is required"
    if (!formData.email.trim()) errors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Invalid email format"
    if (!formData.department) errors.department = "Department is required"
    if (!formData.subjects.trim()) errors.subjects = "At least one subject is required"
    if (formData.maxHoursPerWeek < 1 || formData.maxHoursPerWeek > 40)
      errors.maxHoursPerWeek = "Max hours must be between 1 and 40"

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

    setSubmitting(true)

    const teacherData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      subjects: formData.subjects
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
      maxHoursPerWeek: formData.maxHoursPerWeek,
      department: formData.department,
      phone: formData.phone.trim(),
      availability: formData.availability,
    }

    try {
      let response
      if (editingTeacher) {
        response = await fetch(`/api/teachers/${editingTeacher.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(teacherData),
        })
      } else {
        response = await fetch("/api/teachers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(teacherData),
        })
      }

      const result = await response.json()

      if (result.success) {
        if (editingTeacher) {
          setTeachers((prev) => prev.map((t) => (t.id === editingTeacher.id ? result.data : t)))
          setEditingTeacher(null)
          toast({
            title: "Success",
            description: "Teacher updated successfully",
          })
        } else {
          setTeachers((prev) => [...prev, result.data])
          setIsAddDialogOpen(false)
          toast({
            title: "Success",
            description: "Teacher added successfully",
          })
        }
        resetForm()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save teacher",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save teacher. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (teacherId: string) => {
    try {
      const response = await fetch(`/api/teachers/${teacherId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        setTeachers((prev) => prev.filter((t) => t.id !== teacherId))
        toast({
          title: "Success",
          description: "Teacher deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete teacher",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete teacher. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher)
    setFormData({
      name: teacher.name,
      email: teacher.email,
      subjects: teacher.subjects.join(", "),
      maxHoursPerWeek: teacher.maxHoursPerWeek,
      department: teacher.department,
      phone: teacher.phone || "",
      availability: teacher.availability,
    })
    setFormErrors({})
  }

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({ ...prev, name: value }))
    if (formErrors.name) {
      setFormErrors((prev) => ({ ...prev, name: "" }))
    }
  }

  const handleEmailChange = (value: string) => {
    setFormData((prev) => ({ ...prev, email: value }))
    if (formErrors.email) {
      setFormErrors((prev) => ({ ...prev, email: "" }))
    }
  }

  const handleSubjectsChange = (value: string) => {
    setFormData((prev) => ({ ...prev, subjects: value }))
    if (formErrors.subjects) {
      setFormErrors((prev) => ({ ...prev, subjects: "" }))
    }
  }

  const handleMaxHoursChange = (value: string) => {
    const numValue = Number.parseInt(value) || 0
    setFormData((prev) => ({ ...prev, maxHoursPerWeek: numValue }))
    if (formErrors.maxHoursPerWeek) {
      setFormErrors((prev) => ({ ...prev, maxHoursPerWeek: "" }))
    }
  }

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, phone: value }))
  }

  const handleAvailabilityChange = (day: string, timeSlot: string, checked: boolean) => {
    setFormData((prev) => {
      const newAvailability = { ...prev.availability }
      if (checked) {
        newAvailability[day] = [...(newAvailability[day] || []), timeSlot]
      } else {
        newAvailability[day] = (newAvailability[day] || []).filter((slot) => slot !== timeSlot)
      }
      return {
        ...prev,
        availability: newAvailability,
      }
    })
  }

  const handleCancel = () => {
    if (editingTeacher) {
      setEditingTeacher(null)
    } else {
      setIsAddDialogOpen(false)
    }
    resetForm()
  }

  const TeacherForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={formErrors.name ? "border-red-500" : ""}
            disabled={submitting}
          />
          {formErrors.name && <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleEmailChange(e.target.value)}
            className={formErrors.email ? "border-red-500" : ""}
            disabled={submitting}
          />
          {formErrors.email && <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="department">Department *</Label>
          <Select
            value={formData.department}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, department: value }))}
            disabled={submitting}
          >
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
          <Label htmlFor="maxHours">Max Hours per Week *</Label>
          <Input
            id="maxHours"
            type="number"
            min="1"
            max="40"
            value={formData.maxHoursPerWeek}
            onChange={(e) => handleMaxHoursChange(e.target.value)}
            className={formErrors.maxHoursPerWeek ? "border-red-500" : ""}
            disabled={submitting}
          />
          {formErrors.maxHoursPerWeek && <p className="text-sm text-red-500 mt-1">{formErrors.maxHoursPerWeek}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="subjects">Subjects (comma-separated) *</Label>
          <Textarea
            id="subjects"
            value={formData.subjects}
            onChange={(e) => handleSubjectsChange(e.target.value)}
            placeholder="Mathematics, Statistics, Calculus"
            className={formErrors.subjects ? "border-red-500" : ""}
            disabled={submitting}
          />
          {formErrors.subjects && <p className="text-sm text-red-500 mt-1">{formErrors.subjects}</p>}
        </div>
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="+1234567890"
            disabled={submitting}
          />
        </div>
      </div>

      <div>
        <Label>Availability Schedule</Label>
        <div className="grid grid-cols-1 gap-3 mt-2 max-h-60 overflow-y-auto">
          {days.map((day) => (
            <div key={day} className="border rounded-lg p-3">
              <h4 className="font-medium mb-2">{day}</h4>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot) => (
                  <div key={slot} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${day}-${slot}`}
                      checked={(formData.availability[day] || []).includes(slot)}
                      onCheckedChange={(checked) => handleAvailabilityChange(day, slot, checked as boolean)}
                      disabled={submitting}
                    />
                    <Label htmlFor={`${day}-${slot}`} className="text-sm">
                      {slot}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={handleCancel} disabled={submitting}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          <Save className="h-4 w-4 mr-2" />
          {submitting ? "Saving..." : editingTeacher ? "Update Teacher" : "Add Teacher"}
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
            <p className="text-gray-500">Loading teachers...</p>
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
            <Users className="h-5 w-5" />
            Teacher Management ({teachers.length})
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Teacher
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Teacher</DialogTitle>
              </DialogHeader>
              <TeacherForm />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {teachers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No teachers added yet. Click "Add New Teacher" to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-4">
                      <h4 className="font-semibold text-lg text-gray-900">{teacher.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        <Building className="h-3 w-3 mr-1" />
                        {teacher.department}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      {teacher.email}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.map((subject) => (
                        <Badge key={subject} variant="secondary" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Max {teacher.maxHoursPerWeek}h/week
                      </div>
                      <div className="text-green-600 font-medium">
                        {Object.values(teacher.availability).flat().length} time slots available
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(teacher)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(teacher.id)}
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
        <Dialog open={!!editingTeacher} onOpenChange={(open) => !open && setEditingTeacher(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Teacher: {editingTeacher?.name}</DialogTitle>
            </DialogHeader>
            <TeacherForm />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
