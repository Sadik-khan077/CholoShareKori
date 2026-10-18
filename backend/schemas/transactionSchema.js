const { z } = require('zod');

const createTransactionSchema = z.object({
  resource_id: z.number().int().positive("A valid resource ID is required."),
  resource_title: z.string().optional(),
  provider_id: z.number().int().positive().optional(),
  requester_id: z.number().int().positive().optional(),
  transaction_type: z.enum(['borrow_request', 'order', 'claim']).default('borrow_request'),
  quantity: z.number().int().positive().min(1).default(1),
  payment_method: z.string().default('cash_on_pickup'),
  duration_days: z.number().int().positive().optional(),
  pickup_spot: z.string().optional(),
  total_price: z.number().nonnegative().optional()
});

module.exports = { createTransactionSchema };