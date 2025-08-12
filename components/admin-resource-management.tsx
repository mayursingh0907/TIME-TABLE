"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Edit, Trash2, Settings, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface Resource {
  id: number
  name: string
  type: string
  capacity: number
  equipment: string[]
  location: string
  availability: string[]
}

interface AdminResourceManagementProps {
  resources: Resource[]
  onAddResource: (resource: Omit<Resource, "id">) => void
  onUpdateResource: (id: number, resource: Partial<Resource>) => void
  onDeleteResource: (id: number) => void
}

export default function AdminResourceManagement({
  resources,
  onAddResource,
  onUpdateResource,
  onDeleteResource,
}: AdminResourceManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    capacity: 30,
    equipment: "",
    location: "",
    availability: [] as string[],
  })

  const resourceTypes = ["classroom", "laboratory", "auditorium", "computer lab", "library", "conference room"]
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      capacity: 30,
      equipment: "",
      location: "",
      availability: [],
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const resourceData = {
      name: formData.name,
      type: formData.type,
      capacity: formData.capacity,
      equipment: formData.equipment
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e),
      location: formData.location,
      availability: formData.availability,
    }

    if (editingResource) {
      onUpdateResource(editingResource.id, resourceData)
      setEditingResource(null)
    } else {
      onAddResource(resourceData)
      setIsAddDialogOpen(false)
    }

    resetForm()
  }

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource)
    setFormData({
      name: resource.name,
      type: resource.type,
      capacity: resource.capacity,
      equipment: resource.equipment.join(", "),
      location: resource.location,
      availability: resource.availability,
    })
  }

  const handleAvailabilityChange = (day: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      availability: checked ? [...prev.availability, day] : prev.availability.filter((d) => d !== day),
    }))
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "laboratory":
        return "bg-blue-100 text-blue-800"
      case "auditorium":
        return "bg-purple-100 text-purple-800"
      case "computer lab":
        return "bg-green-100 text-green-800"
      case "classroom":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const ResourceForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Resource Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Resource Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {resourceTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            type="number"
            min="1"
            max="500"
            value={formData.capacity}
            onChange={(e) => setFormData((prev) => ({ ...prev, capacity: Number.parseInt(e.target.value) }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
            placeholder="Building - Floor"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="equipment">Equipment (comma-separated)</Label>
        <Textarea
          id="equipment"
          value={formData.equipment}
          onChange={(e) => setFormData((prev) => ({ ...prev, equipment: e.target.value }))}
          placeholder="projector, computers, whiteboard"
        />
      </div>

      <div>
        <Label>Available Days</Label>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {days.map((day) => (
            <div key={day} className="flex items-center space-x-2">
              <Checkbox
                id={day}
                checked={formData.availability.includes(day)}
                onCheckedChange={(checked) => handleAvailabilityChange(day, checked as boolean)}
              />
              <Label htmlFor={day} className="text-sm">
                {day}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (editingResource) {
              setEditingResource(null)
            } else {
              setIsAddDialogOpen(false)
            }
            resetForm()
          }}
        >
          Cancel
        </Button>
        <Button type="submit">{editingResource ? "Update Resource" : "Add Resource"}</Button>
      </div>
    </form>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Resource Management
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Resource</DialogTitle>
              </DialogHeader>
              <ResourceForm />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-4">
                    <h4 className="font-semibold text-lg text-gray-900">{resource.name}</h4>
                    <Badge className={getTypeColor(resource.type)}>{resource.type}</Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {resource.location}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {resource.equipment.map((item) => (
                      <Badge key={item} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Capacity: {resource.capacity}
                    </div>
                    <div className="text-green-600 font-medium">Available: {resource.availability.join(", ")}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(resource)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteResource(resource.id)}
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
        <Dialog open={!!editingResource} onOpenChange={(open) => !open && setEditingResource(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Resource: {editingResource?.name}</DialogTitle>
            </DialogHeader>
            <ResourceForm />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
