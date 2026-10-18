const db = require('../db'); // Assuming db.js is one level up

// Normalizes resource database records for frontend consumption
function formatResource(item) {
  return {
    ...item,
    id: Number(item.id),
    user_id: Number(item.user_id),
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1,
    views_count: Number(item.views_count) || 0,
    trust_score: Number(item.user_trust_score || item.trust_score) || 99.0,
    condition: item.condition || 'Verified Student Item',
    pickup_spot: item.pickup_spot || item.location || 'TSC or Hall',
    image_url: item.image_url || null,
    user_name: item.user_name || 'Campus Student',
    user_dept: item.user_dept || item.dept || 'Jahangirnagar University',
    user_batch: item.user_batch || item.batch || 'Batch 50'
  };
}

const getResources = async (filters) => {
  const { listing_type, category, search, urgency, user_id, status, page, limit, sort } = filters;
  const conditions = [];
  const params = [];

  if (listing_type) {
    conditions.push('LOWER(r.listing_type) = ?');
    params.push(listing_type.toLowerCase());
  }

  if (category) {
    conditions.push('LOWER(r.category) = ?');
    params.push(category.toLowerCase());
  }

  if (status !== 'all') {
    conditions.push('r.status = ?');
    params.push(status);
  }

  if (user_id) {
    conditions.push('r.user_id = ?');
    params.push(user_id);
  }

  if (urgency) {
    conditions.push('r.urgency = ?');
    params.push(urgency);
  }

  if (search && search.trim()) {
    conditions.push('(r.title LIKE ? OR r.description LIKE ? OR r.location LIKE ? OR r.pickup_spot LIKE ? OR u.name LIKE ?)');
    const term = `%${search.trim()}%`;
    params.push(term, term, term, term, term);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  let orderByClause = 'ORDER BY r.created_at DESC';
  if (sort === 'price_asc') {
    orderByClause = 'ORDER BY r.price ASC';
  } else if (sort === 'price_desc') {
    orderByClause = 'ORDER BY r.price DESC';
  } else if (sort === 'oldest') {
    orderByClause = 'ORDER BY r.created_at ASC';
  } else if (sort === 'urgent') {
    orderByClause = "ORDER BY CASE r.urgency WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END, r.created_at DESC";
  }

  const offset = (page - 1) * limit;

  // Count query
  const countQuery = `
    SELECT COUNT(*) as total
    FROM resources r
    JOIN users u ON r.user_id = u.id
    ${whereClause}
  `;
  const [[{ total }]] = await db.query(countQuery, params);

  // Main data query
  const dataQuery = `
    SELECT 
      r.*,
      u.name AS user_name, u.phone AS user_phone, u.email AS user_email,
      u.location AS user_hall, u.dept AS user_dept, u.batch AS user_batch, u.trust_score AS user_trust_score
    FROM resources r
    JOIN users u ON r.user_id = u.id
    ${whereClause}
    ${orderByClause}
    LIMIT ? OFFSET ?
  `;
  const queryParams = [...params, limit, offset];
  const [resources] = await db.query(dataQuery, queryParams);

  const formatted = resources.map(formatResource);

  return {
    count: formatted.length,
    data: formatted,
    pagination: {
      total: Number(total) || 0,
      page,
      limit,
      pages: Math.ceil((Number(total) || 0) / limit)
    }
  };
};

const getStarredResources = async (userId) => {
  const [resources] = await db.query(
    `SELECT r.*, s.id as star_id, u.name as user_name, u.dept as user_dept, u.batch as user_batch, u.trust_score as user_trust_score
     FROM stars s
     JOIN resources r ON s.resource_id = r.id
     JOIN users u ON r.user_id = u.id
     WHERE s.user_id = ?
     ORDER BY s.created_at DESC`,
    [userId]
  );
  return resources.map(formatResource);
};

module.exports = { getResources, getStarredResources };