const savingsGoalModel = require('../models/savingsGoalModel');

/**
 * Get all savings goals with calculated progress percentages.
 */
async function getSavingsGoals(req, res, next) {
  try {
    const goals = await savingsGoalModel.getSavingsGoals(req.supabase, req.user.id);

    const enrichedGoals = goals.map(g => {
      const target = parseFloat(g.target_amount) || 1;
      const current = parseFloat(g.current_amount) || 0;
      const progressPercentage = Math.min(100, Math.round((current / target) * 1000) / 10);
      const remainingAmount = Math.max(0, Math.round((target - current) * 100) / 100);

      return {
        ...g,
        progressPercentage,
        remainingAmount,
        isCompleted: current >= target
      };
    });

    return res.status(200).json({
      success: true,
      data: enrichedGoals,
      message: 'Savings goals retrieved successfully.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new savings goal.
 */
async function createSavingsGoal(req, res, next) {
  try {
    const created = await savingsGoalModel.createSavingsGoal(req.supabase, req.user.id, req.body);
    return res.status(201).json({
      success: true,
      data: created,
      message: 'Savings goal created! You can now start adding funds towards it.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update an existing savings goal or deposit money into it.
 */
async function updateSavingsGoal(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await savingsGoalModel.getSavingsGoalById(req.supabase, req.user.id, id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found or access denied.',
        errors: ['Savings goal not found']
      });
    }

    const updated = await savingsGoalModel.updateSavingsGoal(req.supabase, req.user.id, id, req.body);
    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Savings goal updated successfully.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a savings goal.
 */
async function deleteSavingsGoal(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await savingsGoalModel.getSavingsGoalById(req.supabase, req.user.id, id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found or access denied.',
        errors: ['Savings goal not found']
      });
    }

    await savingsGoalModel.deleteSavingsGoal(req.supabase, req.user.id, id);
    return res.status(200).json({
      success: true,
      data: { id },
      message: 'Savings goal deleted.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal
};
