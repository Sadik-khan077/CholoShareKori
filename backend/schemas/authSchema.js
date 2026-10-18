const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, "Valid student name is required."),
  email: z.string().email("Valid university or personal email address is required."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
  phone: z.string().min(7, "Valid contact phone number is required."),
  location: z.string().optional(),
  registration_no: z.string().optional(),
  dept: z.string().optional(),
  batch: z.string().optional(),
  bio: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email("A valid email address is required to log in."),
  password: z.string().min(1, "Password is required.")
});

module.exports = { registerSchema, loginSchema };