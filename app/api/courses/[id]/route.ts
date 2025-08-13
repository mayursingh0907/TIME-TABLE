import { type NextRequest, NextResponse } from "next/server"

// In-memory storage (same as above)
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const courseData = await request.json()
    const courseIndex = courses.findIndex((c) => c.id === params.id)

    if (courseIndex === -1) {
      return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 })
    }

    // Check for duplicate course code (excluding current course)
    if (courses.some((c) => c.code === courseData.code && c.id !== params.id)) {
      return NextResponse.json({ success: false, error: "Course with this code already exists" }, { status: 400 })
    }

    courses[courseIndex] = { ...courses[courseIndex], ...courseData }
    return NextResponse.json({ success: true, data: courses[courseIndex] })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update course" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const courseIndex = courses.findIndex((c) => c.id === params.id)

    if (courseIndex === -1) {
      return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 })
    }

    courses.splice(courseIndex, 1)
    return NextResponse.json({ success: true, message: "Course deleted successfully" })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete course" }, { status: 500 })
  }
}
