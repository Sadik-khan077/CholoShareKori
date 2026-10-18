const { getResourcesSchema } = require('../schemas/resourceSchema');
const resourceService = require('../services/resourceService');

const getAllResources = async (req, res, next) => {
  try {
    // 1. Zod Validation
    const validatedQuery = getResourcesSchema.parse(req.query);

    // 2. Service Logic
    const result = await resourceService.getResources(validatedQuery);

    // 3. Response
    return res.status(200).json({
      success: true,
      ...result
    });

  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters provided.',
        details: error.errors
      });
    }
    next(error);
  }
};

const getStarredItems = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : parseInt(req.query.user_id, 10);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required to view starred items.' });
    }
    const result = await resourceService.getStarredResources(userId);
    return res.status(200).json({ success: true, count: result.length, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllResources, getStarredItems };