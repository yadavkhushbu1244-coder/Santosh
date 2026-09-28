/**
 * Transaction Model
 * Enforces ownership checks and delegates queries to Supabase.
 */

async function getTransactions(supabaseClient, userId, options = {}) {
  const {
    type,
    category,
    startDate,
    endDate,
    search,
    limit = 50,
    offset = 0,
    sortBy = 'transaction_date',
    sortOrder = 'desc'
  } = options;

  let query = supabaseClient
    .from('transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  if (type) {
    query = query.eq('type', type);
  }

  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  if (startDate) {
    query = query.gte('transaction_date', startDate);
  }

  if (endDate) {
    query = query.lte('transaction_date', endDate);
  }

  if (search && search.trim().length > 0) {
    // Search in description and notes safely using ilike
    const s = `%${search.trim()}%`;
    query = query.or(`description.ilike.${s},notes.ilike.${s}`);
  }

  const ascending = String(sortOrder).toLowerCase() === 'asc';
  const allowedSortFields = ['transaction_date', 'amount', 'category', 'created_at'];
  const safeSortField = allowedSortFields.includes(sortBy) ? sortBy : 'transaction_date';

  query = query
    .order(safeSortField, { ascending })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    transactions: data || [],
    totalCount: count || 0,
    limit: Number(limit),
    offset: Number(offset)
  };
}

async function getTransactionById(supabaseClient, userId, id) {
  const { data, error } = await supabaseClient
    .from('transactions')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function createTransaction(supabaseClient, userId, payload) {
  const newRecord = {
    user_id: userId,
    type: payload.type,
    amount: parseFloat(payload.amount),
    category: payload.category.trim(),
    description: payload.description.trim(),
    transaction_date: payload.transaction_date || new Date().toISOString().split('T')[0],
    payment_method: payload.payment_method || 'Cash',
    notes: payload.notes ? payload.notes.trim() : null
  };

  const { data, error } = await supabaseClient
    .from('transactions')
    .insert([newRecord])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateTransaction(supabaseClient, userId, id, payload) {
  const updates = {};
  if (payload.type !== undefined) updates.type = payload.type;
  if (payload.amount !== undefined) updates.amount = parseFloat(payload.amount);
  if (payload.category !== undefined) updates.category = payload.category.trim();
  if (payload.description !== undefined) updates.description = payload.description.trim();
  if (payload.transaction_date !== undefined) updates.transaction_date = payload.transaction_date;
  if (payload.payment_method !== undefined) updates.payment_method = payload.payment_method;
  if (payload.notes !== undefined) updates.notes = payload.notes ? payload.notes.trim() : null;

  const { data, error } = await supabaseClient
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteTransaction(supabaseClient, userId, id) {
  const { data, error } = await supabaseClient
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .select('id')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch all transactions for a user (used by calculation and analytics services).
 */
async function getAllUserTransactions(supabaseClient, userId, startDate = null) {
  let query = supabaseClient
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false });

  if (startDate) {
    query = query.gte('transaction_date', startDate);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getAllUserTransactions
};
