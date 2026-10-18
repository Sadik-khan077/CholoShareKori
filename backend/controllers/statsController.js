const statsService = require('../services/statsService');

const getStats = async (req, res, next) => {
  try {
    const data = await statsService.getCampusStats();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getPulse = async (req, res, next) => {
  try {
    const data = await statsService.getPulseEvents();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getLocations = async (req, res, next) => {
  try {
    const data = await statsService.getLocations();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const data = await statsService.getCategories();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getPulse, getLocations, getCategories };