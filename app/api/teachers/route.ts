import { type NextRequest, NextResponse } from "next/server"

// In-memory storage (replace with database in production)
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

export async function GET() {
  return NextResponse.json({ success: true, data: teachers })
}

export async function POST(request: NextRequest) {
  try {
    const teacherData = await request.json()

    // Validate required fields
    if (!teacherData.name || !teacherData.email || !teacherData.department) {
      return NextResponse.json({ success: false, error: "Name, email, and department are required" }, { status: 400 })
    }

    // Check for duplicate email
    if (teachers.some((t) => t.email === teacherData.email)) {
      return NextResponse.json({ success: false, error: "Teacher with this email already exists" }, { status: 400 })
    }

    const newTeacher = {
      id: Date.now().toString(),
      ...teacherData,
      subjects: teacherData.subjects || [],
      availability: teacherData.availability || {},
      phone: teacherData.phone || "",
      maxHoursPerWeek: teacherData.maxHoursPerWeek || 20,
    }

    teachers.push(newTeacher)
    return NextResponse.json({ success: true, data: newTeacher })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create teacher" }, { status: 500 })
  }
}
