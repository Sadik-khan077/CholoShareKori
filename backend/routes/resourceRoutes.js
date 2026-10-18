const express = require('express');
const router = express.Router();
const db = require('../db');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const resourceController = require('../controllers/resourceController');

// Valid listing types and categories for the 5 Pillars
const VALID_LISTING_TYPES = ['lend', 'borrow', 'buy', 'sell', 'free'];
const VALID_CATEGORIES = [
  'education materials',
  'tools',
  'clothing',
  'food',
  'furniture',
  'outdoor'
];

/**
 * Normalizes resource database records for frontend consumption.
 */
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

// ==========================================
// 1. GET ALL RESOURCES (Filterable & Searchable)
// ==========================================
router.get('/', resourceController.getAllResources);

// ==========================================
// 2. GET USER'S STARRED / BOOKMARKED ITEMS
// ==========================================
router.get('/starred', optionalProtect, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : parseInt(req.query.user_id, 10) || 98;

    const query = `
      SELECT 
        r.*,
        u.name AS user_name,
        u.phone AS user_phone,
        u.location AS user_hall,
        u.dept AS user_dept,
        u.batch AS user_batch,
        u.trust_score AS user_trust_score
      FROM starred s
      JOIN resources r ON s.resource_id = r.id
      JOIN users u ON r.user_id = u.id
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC
    `;

    const [rows] = await db.query(query, [userId]);
    return res.status(200).json({
      success: true,
      data: rows.map(formatResource)
    });
  } catch (error) {
    console.error('Fetch Starred Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch starred items.' });
  }
});

// ==========================================
// 3. GET SINGLE RESOURCE BY ID WITH PEER PROFILE
// ==========================================
router.get('/:id', async (req, res) => {
  try {
    const resourceId = parseInt(req.params.id, 10);
    if (!resourceId) {
      return res.status(400).json({ success: false, message: 'Invalid resource ID.' });
    }

    // Increment views count asynchronously
    db.query('UPDATE resources SET views_count = views_count + 1 WHERE id = ?', [resourceId]).catch(() => {});

    const query = `
      SELECT 
        r.*,
        u.name AS user_name,
        u.email AS user_email,
        u.phone AS user_phone,
        u.location AS user_hall,
        u.dept AS user_dept,
        u.batch AS user_batch,
        u.trust_score AS user_trust_score,
        u.karma_points AS user_karma,
        u.bio AS user_bio
      FROM resources r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `;
    const [rows] = await db.query(query, [resourceId]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Campus resource not found.' });
    }

    const item = formatResource(rows[0]);

    // Also fetch 3 similar campus items in the same category
    const [similarRows] = await db.query(
      `SELECT r.*, u.name as user_name, u.dept as user_dept, u.batch as user_batch, u.trust_score as user_trust_score
       FROM resources r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.category = ? AND r.id != ? AND r.status = 'available' 
       ORDER BY r.created_at DESC 
       LIMIT 3`,
      [item.category, resourceId]
    );

    return res.status(200).json({
      success: true,
      data: {
        ...item,
        similar_items: similarRows.map(formatResource)
      }
    });

  } catch (error) {
    console.error('Get Resource Details Error:', error);
    return res.status(500).json({ success: false, message: 'Server error while retrieving resource details.' });
  }
});

// ==========================================
// 4. CREATE A NEW CAMPUS RESOURCE (POST)
// ==========================================
router.post('/', optionalProtect, async (req, res) => {
  try {
    const { 
      id,
      title, 
      category, 
      listing_type, 
      type = 'offer',
      quantity = 1, 
      price = 0, 
      location, 
      pickup_spot,
      image_url,
      description, 
      urgency = 'medium',
      condition = 'Verified Student Item',
      user_id: bodyUserId
    } = req.body;

    // Determine owner: authenticated user takes precedence, fallback to body user_id or demo student 99
    const userId = req.user ? req.user.id : (parseInt(bodyUserId, 10) || 99);

    // Validation
    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Item title must be at least 3 characters long.' });
    }

    if (!category) {
      return res.status(400).json({ success: false, message: 'Category is required.' });
    }

    const cleanListingType = (listing_type && listing_type.toLowerCase()) || 'lend';
    const cleanLocation = (location && location.trim()) || (req.user && req.user.location) || 'TSC (Teacher-Student Centre)';
    const cleanPickupSpot = (pickup_spot && pickup_spot.trim()) || cleanLocation;
    const cleanQuantity = Math.max(1, parseInt(quantity, 10) || 1);
    const cleanPrice = cleanListingType === 'free' ? 0 : Math.max(0, parseFloat(price) || 0);
    const cleanImageUrl = image_url && typeof image_url === 'string' ? image_url.trim() : null;

    const insertQuery = `
      INSERT INTO resources 
      (id, user_id, type, listing_type, title, category, quantity, price, location, pickup_spot, image_url, description, urgency, condition, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')
    `;

    // Support client-provided ID (like Date.now()) or auto-generate
    const customId = id ? parseInt(id, 10) : null;

    let result;
    if (customId) {
      result = await db.query(insertQuery, [
        customId,
        userId,
        type || (cleanListingType === 'borrow' ? 'request' : 'offer'),
        cleanListingType,
        title.trim(),
        category.toLowerCase(),
        cleanQuantity,
        cleanPrice,
        cleanLocation,
        cleanPickupSpot,
        cleanImageUrl,
        description ? description.trim() : null,
        urgency || 'medium',
        condition || 'Good'
      ]);
    } else {
      const autoQuery = `
        INSERT INTO resources 
        (user_id, type, listing_type, title, category, quantity, price, location, pickup_spot, image_url, description, urgency, condition, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')
      `;
      result = await db.query(autoQuery, [
        userId,
        type || (cleanListingType === 'borrow' ? 'request' : 'offer'),
        cleanListingType,
        title.trim(),
        category.toLowerCase(),
        cleanQuantity,
        cleanPrice,
        cleanLocation,
        cleanPickupSpot,
        cleanImageUrl,
        description ? description.trim() : null,
        urgency || 'medium',
        condition || 'Good'
      ]);
    }

    const newId = customId || result[0].insertId;

    return res.status(201).json({
      success: true,
      message: '🎉 Campus listing published successfully!',
      data: {
        id: newId,
        user_id: userId,
        title: title.trim(),
        listing_type: cleanListingType,
        category: category.toLowerCase(),
        price: cleanPrice,
        quantity: cleanQuantity,
        location: cleanLocation,
        pickup_spot: cleanPickupSpot,
        image_url: cleanImageUrl,
        status: 'available'
      }
    });

  } catch (error) {
    console.error('Create Resource Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create campus resource.' });
  }
});

// ==========================================
// 5. UPDATE AN EXISTING RESOURCE (PUT)
// ==========================================
router.put('/:id', optionalProtect, async (req, res) => {
  try {
    const resourceId = parseInt(req.params.id, 10);
    if (!resourceId) {
      return res.status(400).json({ success: false, message: 'Invalid resource ID.' });
    }

    const [existing] = await db.query('SELECT * FROM resources WHERE id = ?', [resourceId]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    const current = existing[0];
    const userId = req.user ? req.user.id : null;

    // Authorization check: if authenticated, verify ownership or admin
    if (userId && Number(current.user_id) !== Number(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized. You do not own this listing.' });
    }

    const { 
      title, 
      category, 
      listing_type, 
      quantity, 
      price, 
      location, 
      pickup_spot,
      image_url,
      description, 
      urgency, 
      condition,
      status 
    } = req.body;

    const updatedTitle = title !== undefined && title.trim() ? title.trim() : current.title;
    const updatedCategory = category !== undefined ? category.toLowerCase() : current.category;
    const updatedListingType = listing_type !== undefined ? listing_type.toLowerCase() : current.listing_type;
    const updatedQuantity = quantity !== undefined ? Math.max(0, parseInt(quantity, 10)) : current.quantity;
    const updatedPrice = price !== undefined ? Math.max(0, parseFloat(price) || 0) : current.price;
    const updatedLocation = location !== undefined && location.trim() ? location.trim() : current.location;
    const updatedPickup = pickup_spot !== undefined && pickup_spot.trim() ? pickup_spot.trim() : (current.pickup_spot || updatedLocation);
    const updatedImageUrl = image_url !== undefined ? (image_url ? image_url.trim() : null) : current.image_url;
    const updatedDesc = description !== undefined ? description : current.description;
    const updatedUrgency = urgency !== undefined ? urgency : current.urgency;
    const updatedCondition = condition !== undefined ? condition : current.condition;
    const updatedStatus = status !== undefined ? status : current.status;

    const updateQuery = `
      UPDATE resources 
      SET title = ?, category = ?, listing_type = ?, quantity = ?, price = ?, 
          location = ?, pickup_spot = ?, image_url = ?, description = ?, urgency = ?, condition = ?, 
          status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await db.query(updateQuery, [
      updatedTitle,
      updatedCategory,
      updatedListingType,
      updatedQuantity,
      updatedPrice,
      updatedLocation,
      updatedPickup,
      updatedImageUrl,
      updatedDesc,
      updatedUrgency,
      updatedCondition,
      updatedStatus,
      resourceId
    ]);

    return res.status(200).json({
      success: true,
      message: 'Resource listing updated successfully.',
      data: {
        id: resourceId,
        title: updatedTitle,
        price: updatedPrice,
        quantity: updatedQuantity,
        location: updatedLocation,
        image_url: updatedImageUrl,
        status: updatedStatus
      }
    });

  } catch (error) {
    console.error('Update Resource Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update resource.' });
  }
});

// ==========================================
// 6. DELETE A RESOURCE (DELETE)
// ==========================================
router.delete('/:id', optionalProtect, async (req, res) => {
  try {
    const resourceId = parseInt(req.params.id, 10);
    if (!resourceId) {
      return res.status(400).json({ success: false, message: 'Invalid resource ID.' });
    }

    const [existing] = await db.query('SELECT user_id FROM resources WHERE id = ?', [resourceId]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    if (req.user && Number(existing[0].user_id) !== Number(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized. You do not own this listing.' });
    }

    await db.query('DELETE FROM resources WHERE id = ?', [resourceId]);

    return res.status(200).json({
      success: true,
      message: 'Resource removed from campus marketplace.'
    });

  } catch (error) {
    console.error('Delete Resource Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete resource.' });
  }
});

// ==========================================
// 7. STAR / BOOKMARK TOGGLE
// ==========================================
router.post('/:id/star', optionalProtect, async (req, res) => {
  try {
    const resourceId = parseInt(req.params.id, 10);
    const userId = req.user ? req.user.id : (parseInt(req.body.user_id, 10) || 98);

    await db.query('INSERT OR IGNORE INTO starred (user_id, resource_id) VALUES (?, ?)', [userId, resourceId]);

    return res.status(200).json({
      success: true,
      message: 'Item added to bookmarks.',
      isStarred: true
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to star item.' });
  }
});

router.delete('/:id/star', optionalProtect, async (req, res) => {
  try {
    const resourceId = parseInt(req.params.id, 10);
    const userId = req.user ? req.user.id : (parseInt(req.body.user_id, 10) || 98);

    await db.query('DELETE FROM starred WHERE user_id = ? AND resource_id = ?', [userId, resourceId]);

    return res.status(200).json({
      success: true,
      message: 'Item removed from bookmarks.',
      isStarred: false
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to remove star.' });
  }
});

module.exports = router;