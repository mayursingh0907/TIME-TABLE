"use client"
import { Plus, Users, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Teacher {
  id: number
  name: string
  subjects: string[]
  availability: Record<string, string[]>
  maxHours: number
}

interface TeacherManagementProps {
  teachers: Teacher[]
  onAddTeacher: () => void
}

export default function TeacherManagement({ teachers, onAddTeacher }: TeacherManagementProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Teachers
          </CardTitle>
          <Button onClick={onAddTeacher} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Teacher
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">{teacher.name}</h4>
                  <div className="flex flex-wrap gap-1">
                    {teacher.subjects.map((subject) => (
                      <Badge key={subject} variant="secondary" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Max {teacher.maxHours}h/week
                    </div>
                    <div className="text-green-600 font-medium">
                      {Object.values(teacher.availability).flat().length} slots available
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
