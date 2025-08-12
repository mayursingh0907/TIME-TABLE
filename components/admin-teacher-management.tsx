"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Edit, Trash2, Users, Clock, Mail, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface Teacher {
  id: number
  name: string
  email: string
  subjects: string[]
  availability: Record<string, string[]>
  maxHours: number
  department: string
}

interface AdminTeacherManagementProps {
  teachers: Teacher[]
  onAddTeacher: (teacher: Omit<Teacher, "id">) => void
  onUpdateTeacher: (id: number, teacher: Partial<Teacher>) => void
  onDeleteTeacher: (id: number) => void
}

export default function AdminTeacherManagement({
  teachers,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
}: AdminTeacherManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subjects: "",
    maxHours: 20,
    department: "",
    availability: {} as Record<string, string[]>,
  })

  const departments = ["Mathematics", "Physics", "Chemistry", "English", "Computer Science", "Biology", "History"]
  const timeSlots = ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      subjects: "",
      maxHours: 20,
      department: "",
      availability: {},
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const teacherData = {
      name: formData.name,
      email: formData.email,
      subjects: formData.subjects
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
      maxHours: formData.maxHours,
      department: formData.department,
      availability: formData.availability,
    }

    if (editingTeacher) {
      onUpdateTeacher(editingTeacher.id, teacherData)
      setEditingTeacher(null)
    } else {
      onAddTeacher(teacherData)
      setIsAddDialogOpen(false)
    }

    resetForm()
  }

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher)
    setFormData({
      name: teacher.name,
      email: teacher.email,
      subjects: teacher.subjects.join(", "),
      maxHours: teacher.maxHours,
      department: teacher.department,
      availability: teacher.availability,
    })
  }

  const handleAvailabilityChange = (day: string, timeSlot: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: checked
          ? [...(prev.availability[day] || []), timeSlot]
          : (prev.availability[day] || []).filter((slot) => slot !== timeSlot),
      },
    }))
  }

  const TeacherForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
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
          <Label htmlFor="maxHours">Max Hours per Week</Label>
          <Input
            id="maxHours"
            type="number"
            min="1"
            max="40"
            value={formData.maxHours}
            onChange={(e) => setFormData((prev) => ({ ...prev, maxHours: Number.parseInt(e.target.value) }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="subjects">Subjects (comma-separated)</Label>
        <Textarea
          id="subjects"
          value={formData.subjects}
          onChange={(e) => setFormData((prev) => ({ ...prev, subjects: e.target.value }))}
          placeholder="Mathematics, Statistics, Calculus"
          required
        />
      </div>

      <div>
        <Label>Availability</Label>
        <div className="grid grid-cols-1 gap-3 mt-2">
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

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (editingTeacher) {
              setEditingTeacher(null)
            } else {
              setIsAddDialogOpen(false)
            }
            resetForm()
          }}
        >
          Cancel
        </Button>
        <Button type="submit">{editingTeacher ? "Update Teacher" : "Add Teacher"}</Button>
      </div>
    </form>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Teacher Management
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
                      Max {teacher.maxHours}h/week
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
                    onClick={() => onDeleteTeacher(teacher.id)}
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
