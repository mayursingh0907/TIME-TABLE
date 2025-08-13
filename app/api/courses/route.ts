import { type NextRequest, NextResponse } from "next/server"

// In-memory storage (replace with database in production)
const courses = [
  {
    id: "1",
    name: "Advanced Mathematics",
    code: "MATH301",
    department: "Mathematics",
    semester: "Fall 2024",
    credits: 3,
    difficulty: "Advanced",
    teacherId: "1",
    teacherName: "Dr. Smith",
    studentsEnrolled: 30,
    duration: 60,
    requiresLab: false,
  },
  {
    id: "2",
    name: "General Physics",
    code: "PHYS101",
    department: "Physics",
    semester: "Fall 2024",
    credits: 4,
    difficulty: "Beginner",
    teacherId: "2",
    teacherName: "Prof. Johnson",
    studentsEnrolled: 25,
    duration: 90,
    requiresLab: true,
  },
]

export async function GET() {
  return NextResponse.json({ success: true, data: courses })
}

export async function POST(request: NextRequest) {
  try {
    const courseData = await request.json()

    // Validate required fields
    if (!courseData.name || !courseData.code || !courseData.department) {
      return NextResponse.json({ success: false, error: "Name, code, and department are required" }, { status: 400 })
    }

    // Check for duplicate course code
    if (courses.some((c) => c.code === courseData.code)) {
      return NextResponse.json({ success: false, error: "Course with this code already exists" }, { status: 400 })
    }

    const newCourse = {
      id: Date.now().toString(),
      ...courseData,
      credits: courseData.credits || 3,
      difficulty: courseData.difficulty || "Beginner",
      studentsEnrolled: courseData.studentsEnrolled || 0,
      duration: courseData.duration || 60,
      requiresLab: courseData.requiresLab || false,
    }

    courses.push(newCourse)
    return NextResponse.json({ success: true, data: newCourse })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create course" }, { status: 500 })
  }
}
