"use client"
import { Plus, MapPin, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Resource {
  id: number
  name: string
  type: string
  capacity: number
  equipment: string[]
}

interface ResourceManagementProps {
  resources: Resource[]
  onAddResource: () => void
}

export default function ResourceManagement({ resources, onAddResource }: ResourceManagementProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Resources & Rooms
          </CardTitle>
          <Button onClick={onAddResource} variant="outline" className="flex items-center gap-2 bg-transparent">
            <Plus className="h-4 w-4" />
            Add Resource
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {resources.map((resource) => (
            <div key={resource.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">{resource.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <Badge variant="outline">{resource.type}</Badge>
                    <div className="flex items-center gap-1">
                      <Monitor className="h-4 w-4" />
                      Capacity: {resource.capacity}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {resource.equipment.map((item) => (
                      <Badge key={item} variant="secondary" className="text-xs">
                        {item}
                      </Badge>
                    ))}
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
