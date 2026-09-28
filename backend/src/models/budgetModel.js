/**
 * Budget Model
 */

async function getBudgets(supabaseClient, userId) {
  const { data, error } = await supabaseClient
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function getBudgetById(supabaseClient, userId, id) {
  const { data, error } = await supabaseClient
    .from('budgets')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function createBudget(supabaseClient, userId, payload) {
  const record = {
    user_id: userId,
    category: payload.category.trim(),
    amount: parseFloat(payload.amount),
    period: payload.period || 'monthly',
    start_date: payload.start_date || new Date().toISOString().split('T')[0],
    end_date: payload.end_date || null
  };

  const { data, error } = await supabaseClient
    .from('budgets')
    .insert([record])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateBudget(supabaseClient, userId, id, payload) {
  const updates = {};
  if (payload.category !== undefined) updates.category = payload.category.trim();
  if (payload.amount !== undefined) updates.amount = parseFloat(payload.amount);
  if (payload.period !== undefined) updates.period = payload.period;
  if (payload.start_date !== undefined) updates.start_date = payload.start_date;
  if (payload.end_date !== undefined) updates.end_date = payload.end_date;

  const { data, error } = await supabaseClient
    .from('budgets')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteBudget(supabaseClient, userId, id) {
  const { data, error } = await supabaseClient
    .from('budgets')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .select('id')
    .single();

  if (error) throw error;
  return data;
}

module.exports = {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget
};
