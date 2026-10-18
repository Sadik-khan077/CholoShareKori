const { z } = require('zod');

const getResourcesSchema = z.object({
  listing_type: z.enum(['lend', 'borrow', 'buy', 'sell', 'free']).optional(),
  category: z.enum([
    'education materials', 'tools', 'clothing', 'food', 'furniture', 'outdoor'
  ]).optional(),
  search: z.string().optional(),
  urgency: z.string().optional(),
  user_id: z.coerce.number().int().positive().optional(),
  status: z.string().default('available'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(100),
  sort: z.enum(['newest', 'oldest', 'price_asc', 'price_desc', 'urgent']).default('newest')
});

module.exports = { getResourcesSchema };