import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectToDatabase } from '@/lib/mongodb'
import Employee from '@/app/model/employee'

type EmployeeInput = {
  name: string
  email: string
  role: string
}

function parseEmployeeInput(value: unknown): EmployeeInput | null {
  if (!value || typeof value !== 'object') return null

  const input = value as Record<string, unknown>
  if (typeof input.name !== 'string' || typeof input.email !== 'string' || typeof input.role !== 'string') {
    return null
  }

  const employee = {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role.trim(),
  }

  if (!employee.name || !employee.role || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email)) {
    return null
  }

  return employee
}

function databaseError(error: unknown) {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'Set MONGODB_URI in .env.local to connect to MongoDB.' }, { status: 503 })
  }

  console.error('Employee database request failed:', error)
  return NextResponse.json({ error: 'The employee database request failed.' }, { status: 500 })
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!mongoose.isValidObjectId(params.id)) {
    return NextResponse.json({ error: 'Employee not found.' }, { status: 404 })
  }

  let input: EmployeeInput | null
  try {
    input = parseEmployeeInput(await request.json())
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
  }

  if (!input) {
    return NextResponse.json({ error: 'Enter a name, valid email address, and role.' }, { status: 400 })
  }

  try {
    await connectToDatabase()
    const employee = await Employee.findByIdAndUpdate(params.id, input, { new: true, runValidators: true }).exec()
    if (!employee) return NextResponse.json({ error: 'Employee not found.' }, { status: 404 })

    return NextResponse.json({
      employee: {
        id: employee._id.toString(),
        name: employee.name,
        email: employee.email,
        role: employee.role,
        createdAt: employee.createdAt,
      },
    })
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json({ error: 'An employee with this email already exists.' }, { status: 409 })
    }
    return databaseError(error)
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!mongoose.isValidObjectId(params.id)) {
    return NextResponse.json({ error: 'Employee not found.' }, { status: 404 })
  }

  try {
    await connectToDatabase()
    const employee = await Employee.findByIdAndDelete(params.id).exec()
    if (!employee) return NextResponse.json({ error: 'Employee not found.' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    return databaseError(error)
  }
}