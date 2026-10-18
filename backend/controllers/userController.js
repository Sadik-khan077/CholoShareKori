const { updateProfileSchema, userIdParamSchema } = require('../schemas/userSchema');
const userService = require('../services/userService');

const updateProfile = async (req, res, next) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);
    const result = await userService.updateProfile(req.user.id, validatedData);
    
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      data: result
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    next(error);
  }
};

const getListings = async (req, res, next) => {
  try {
    const { id } = userIdParamSchema.parse(req.params);
    const result = await userService.getUserListings(id);
    
    return res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const { id } = userIdParamSchema.parse(req.params);
    const result = await userService.getUserProfile(id);
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    next(error);
  }
};

module.exports = { updateProfile, getListings, getProfile };