import { type NextRequest, NextResponse } from "next/server"

// In-memory storage (same as above - in production, use database)
const teachers = [
  {
    id: "1",
    name: "Dr. Smith",
    email: "smith@university.edu",
    department: "Mathematics",
    subjects: ["Advanced Mathematics", "Calculus"],
    availability: {
      Monday: ["9:00", "10:00", "11:00"],
      Tuesday: ["9:00", "10:00"],
      Wednesday: ["10:00", "11:00"],
      Thursday: ["9:00"],
      Friday: [],
    },
    phone: "+1234567890",
    maxHoursPerWeek: 20,
  },
  {
    id: "2",
    name: "Prof. Johnson",
    email: "johnson@university.edu",
    department: "Physics",
    subjects: ["General Physics", "Quantum Physics"],
    availability: {
      Monday: ["10:00", "11:00"],
      Tuesday: ["9:00", "14:00"],
      Wednesday: ["14:00", "15:00"],
      Thursday: ["10:00", "11:00"],
      Friday: ["9:00"],
    },
    phone: "+1234567891",
    maxHoursPerWeek: 18,
  },
]

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const teacherData = await request.json()
    const teacherIndex = teachers.findIndex((t) => t.id === params.id)

    if (teacherIndex === -1) {
      return NextResponse.json({ success: false, error: "Teacher not found" }, { status: 404 })
    }

    // Check for duplicate email (excluding current teacher)
    if (teachers.some((t) => t.email === teacherData.email && t.id !== params.id)) {
      return NextResponse.json({ success: false, error: "Teacher with this email already exists" }, { status: 400 })
    }

    teachers[teacherIndex] = { ...teachers[teacherIndex], ...teacherData }
    return NextResponse.json({ success: true, data: teachers[teacherIndex] })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update teacher" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const teacherIndex = teachers.findIndex((t) => t.id === params.id)

    if (teacherIndex === -1) {
      return NextResponse.json({ success: false, error: "Teacher not found" }, { status: 404 })
    }

    teachers.splice(teacherIndex, 1)
    return NextResponse.json({ success: true, message: "Teacher deleted successfully" })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete teacher" }, { status: 500 })
  }
}
