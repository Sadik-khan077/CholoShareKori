const { z } = require('zod');

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").optional(),
  phone: z.string().min(7, "Valid phone number required.").optional(),
  location: z.string().optional(),
  dept: z.string().optional(),
  batch: z.string().optional(),
  registration_no: z.string().optional(),
  bio: z.string().optional()
});

const userIdParamSchema = z.object({
  id: z.coerce.number().int().positive("A valid user ID is required.")
});

module.exports = { updateProfileSchema, userIdParamSchema };