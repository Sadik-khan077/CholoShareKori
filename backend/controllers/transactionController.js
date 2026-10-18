const { createTransactionSchema } = require('../schemas/transactionSchema');
const transactionService = require('../services/transactionService');

const create = async (req, res, next) => {
  try {
    // 1. Zod Validation
    const validatedData = createTransactionSchema.parse(req.body);

    // 2. Service Logic
    const authUserId = req.user ? req.user.id : null;
    const result = await transactionService.createTransaction(validatedData, authUserId);

    // 3. Response
    return res.status(201).json(result);

  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message
      });
    }
    next(error);
  }
};

module.exports = { create };