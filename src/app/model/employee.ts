import mongoose, { Schema, type Model } from 'mongoose'

export type EmployeeDocument = {
  name: string
  email: string
  role: string
  createdAt: Date
  updatedAt: Date
}

const employeeSchema = new Schema<EmployeeDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254, unique: true },
    role: { type: String, required: true, trim: true, maxlength: 120 },
  },
  { timestamps: true },
)

const Employee = (mongoose.models.Employee as Model<EmployeeDocument> | undefined)
  ?? mongoose.model<EmployeeDocument>('Employee', employeeSchema)

export default Employee