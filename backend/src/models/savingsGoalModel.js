/**
 * Savings Goal Model
 */

async function getSavingsGoals(supabaseClient, userId) {
  const { data, error } = await supabaseClient
    .from('savings_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function getSavingsGoalById(supabaseClient, userId, id) {
  const { data, error } = await supabaseClient
    .from('savings_goals')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function createSavingsGoal(supabaseClient, userId, payload) {
  const record = {
    user_id: userId,
    name: payload.name.trim(),
    target_amount: parseFloat(payload.target_amount),
    current_amount: payload.current_amount ? parseFloat(payload.current_amount) : 0,
    deadline: payload.deadline || null
  };

  const { data, error } = await supabaseClient
    .from('savings_goals')
    .insert([record])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateSavingsGoal(supabaseClient, userId, id, payload) {
  const updates = {};
  if (payload.name !== undefined) updates.name = payload.name.trim();
  if (payload.target_amount !== undefined) updates.target_amount = parseFloat(payload.target_amount);
  if (payload.current_amount !== undefined) updates.current_amount = parseFloat(payload.current_amount);
  if (payload.deadline !== undefined) updates.deadline = payload.deadline;

  const { data, error } = await supabaseClient
    .from('savings_goals')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteSavingsGoal(supabaseClient, userId, id) {
  const { data, error } = await supabaseClient
    .from('savings_goals')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .select('id')
    .single();

  if (error) throw error;
  return data;
}

module.exports = {
  getSavingsGoals,
  getSavingsGoalById,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal
};
