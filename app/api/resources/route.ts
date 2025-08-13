import { type NextRequest, NextResponse } from "next/server"

// In-memory storage (replace with database in production)
const resources = [
  {
    id: "1",
    name: "Main Auditorium",
    type: "Classroom",
    capacity: 100,
    location: "Building A, Floor 1",
    equipment: ["Projector", "Sound System", "Whiteboard"],
    availability: {
      Monday: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      Tuesday: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      Wednesday: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      Thursday: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      Friday: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
    },
  },
  {
    id: "2",
    name: "Physics Lab",
    type: "Laboratory",
    capacity: 30,
    location: "Building B, Floor 2",
    equipment: ["Lab Equipment", "Safety Gear", "Computers"],
    availability: {
      Monday: ["10:00", "11:00", "14:00", "15:00"],
      Tuesday: ["9:00", "14:00", "15:00", "16:00"],
      Wednesday: ["14:00", "15:00", "16:00"],
      Thursday: ["10:00", "11:00", "14:00"],
      Friday: ["9:00", "10:00", "11:00"],
    },
  },
]

export async function GET() {
  return NextResponse.json({ success: true, data: resources })
}

export async function POST(request: NextRequest) {
  try {
    const resourceData = await request.json()

    // Validate required fields
    if (!resourceData.name || !resourceData.type) {
      return NextResponse.json({ success: false, error: "Name and type are required" }, { status: 400 })
    }

    const newResource = {
      id: Date.now().toString(),
      ...resourceData,
      capacity: resourceData.capacity || 30,
      location: resourceData.location || "",
      equipment: resourceData.equipment || [],
      availability: resourceData.availability || {},
    }

    resources.push(newResource)
    return NextResponse.json({ success: true, data: newResource })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create resource" }, { status: 500 })
  }
}
