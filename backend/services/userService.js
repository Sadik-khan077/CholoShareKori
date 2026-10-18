const db = require('../db');

const updateProfile = async (userId, updateData) => {
  const [userRows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
  if (!userRows || userRows.length === 0) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const current = userRows[0];
  const newName = updateData.name !== undefined && updateData.name.trim() ? updateData.name.trim() : current.name;
  const newPhone = updateData.phone !== undefined && updateData.phone.trim() ? updateData.phone.trim() : current.phone;
  const newLocation = updateData.location !== undefined && updateData.location.trim() ? updateData.location.trim() : current.location;
  const newDept = updateData.dept !== undefined && updateData.dept.trim() ? updateData.dept.trim() : (current.dept || 'Computer Science & Engineering');
  const newBatch = updateData.batch !== undefined && updateData.batch.trim() ? updateData.batch.trim() : (current.batch || 'Batch 50');
  const newReg = updateData.registration_no !== undefined && updateData.registration_no.trim() ? updateData.registration_no.trim() : current.registration_no;
  const newBio = updateData.bio !== undefined ? updateData.bio.trim() : current.bio;

  if (newReg && newReg !== current.registration_no) {
    const [existingReg] = await db.query(
      'SELECT id FROM users WHERE registration_no = ? AND id != ?',
      [newReg, userId]
    );
    if (existingReg && existingReg.length > 0) {
      const error = new Error('Student ID / Registration number is already registered.');
      error.statusCode = 400;
      throw error;
    }
  }

  const updateQuery = `
    UPDATE users 
    SET name = ?, phone = ?, location = ?, dept = ?, batch = ?, registration_no = ?, bio = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  await db.query(updateQuery, [newName, newPhone, newLocation, newDept, newBatch, newReg, newBio, userId]);

  return {
    id: userId,
    name: newName,
    email: current.email,
    phone: newPhone,
    location: newLocation,
    dept: newDept,
    department: newDept,
    batch: newBatch,
    registration_no: newReg,
    bio: newBio,
    trust_score: Number(current.trust_score) || 99.0,
    karma_points: Number(current.karma_points) || 350,
    on_time_rate: current.on_time_rate || '100%',
    role: current.role,
    status: current.status
  };
};

const getUserListings = async (userId) => {
  const [resources] = await db.query(
    `SELECT r.*, u.name as user_name, u.dept as user_dept, u.batch as user_batch, u.trust_score as user_trust_score
     FROM resources r 
     JOIN users u ON r.user_id = u.id 
     WHERE r.user_id = ? AND r.status = 'available' 
     ORDER BY r.created_at DESC`,
    [userId]
  );

  return resources.map(r => ({
    ...r,
    id: Number(r.id),
    user_id: Number(r.user_id),
    price: Number(r.price) || 0,
    quantity: Number(r.quantity) || 1,
    trust_score: Number(r.user_trust_score) || 99.0,
    condition: r.condition || 'Verified Student Item',
    pickup_spot: r.pickup_spot || r.location || 'TSC or Hall'
  }));
};

const getUserProfile = async (targetId) => {
  const [users] = await db.query(
    `SELECT id, name, email, phone, location, dept, batch, registration_no, bio, 
     trust_score, karma_points, on_time_rate, role, status, created_at 
     FROM users 
     WHERE id = ?`,
    [targetId]
  );

  if (!users || users.length === 0) {
    const error = new Error('Campus peer profile not found.');
    error.statusCode = 404;
    throw error;
  }
  return users[0];
};

module.exports = { updateProfile, getUserListings, getUserProfile };