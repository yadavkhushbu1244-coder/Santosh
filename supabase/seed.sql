-- ==============================================================================
-- TEENAGER EXPENSE TRACKER - OPTIONAL SAMPLE SEED DATA
-- ==============================================================================
-- Replace 'YOUR_USER_ID_HERE' with your real Supabase user UUID (from auth.users)
-- ==============================================================================

DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Try to pick the first existing user in auth.users if available
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;

    IF v_user_id IS NOT NULL THEN
        -- Seed Profile
        INSERT INTO public.profiles (user_id, display_name, currency)
        VALUES (v_user_id, 'Alex Rivera', 'INR')
        ON CONFLICT (user_id) DO UPDATE SET display_name = 'Alex Rivera', currency = 'INR';

        -- Seed Budgets
        INSERT INTO public.budgets (user_id, category, amount, period) VALUES
        (v_user_id, 'Food', 2500.00, 'monthly'),
        (v_user_id, 'Entertainment', 1500.00, 'monthly'),
        (v_user_id, 'Gaming', 1000.00, 'monthly'),
        (v_user_id, 'Shopping', 2000.00, 'monthly'),
        (v_user_id, 'Transportation', 800.00, 'monthly')
        ON CONFLICT (user_id, category, period) DO NOTHING;

        -- Seed Savings Goals
        INSERT INTO public.savings_goals (user_id, name, target_amount, current_amount, deadline) VALUES
        (v_user_id, 'Noise Cancelling Headphones', 6000.00, 3200.00, CURRENT_DATE + INTERVAL '60 days'),
        (v_user_id, 'Sneakers', 4500.00, 1800.00, CURRENT_DATE + INTERVAL '45 days'),
        (v_user_id, 'College Emergency Stash', 10000.00, 4250.00, CURRENT_DATE + INTERVAL '180 days')
        ON CONFLICT DO NOTHING;

        -- Seed Income Transactions
        INSERT INTO public.transactions (user_id, type, amount, category, description, transaction_date, payment_method, notes) VALUES
        (v_user_id, 'income', 5000.00, 'Allowance / Pocket Money', 'Monthly allowance from parents', CURRENT_DATE - INTERVAL '15 days', 'Allowance / Pocket Money', 'For chores and school'),
        (v_user_id, 'income', 3000.00, 'Other', 'Tutoring math neighbor kid', CURRENT_DATE - INTERVAL '7 days', 'UPI / Card', 'Weekend tutoring session');

        -- Seed Expense Transactions
        INSERT INTO public.transactions (user_id, type, amount, category, description, transaction_date, payment_method, notes) VALUES
        (v_user_id, 'expense', 220.00, 'Food', 'School cafeteria lunch & juice', CURRENT_DATE - INTERVAL '14 days', 'Cash', 'Burger and smoothie'),
        (v_user_id, 'expense', 450.00, 'Food', 'Pizza with friends after school', CURRENT_DATE - INTERVAL '10 days', 'UPI / Card', 'Dominos treat'),
        (v_user_id, 'expense', 850.00, 'Entertainment', 'Movie tickets & popcorn', CURRENT_DATE - INTERVAL '8 days', 'UPI / Card', 'Avengers re-release with group'),
        (v_user_id, 'expense', 799.00, 'Gaming', 'Battle Pass & in-game skin', CURRENT_DATE - INTERVAL '6 days', 'Digital Wallet', 'Season 5 pass'),
        (v_user_id, 'expense', 199.00, 'Subscriptions', 'Music streaming monthly fee', CURRENT_DATE - INTERVAL '5 days', 'UPI / Card', 'Spotify Student Plan'),
        (v_user_id, 'expense', 120.00, 'Transportation', 'Bus pass recharge', CURRENT_DATE - INTERVAL '4 days', 'Cash', 'Weekly local bus card'),
        (v_user_id, 'expense', 350.00, 'Education', 'Physics notebook and stationery', CURRENT_DATE - INTERVAL '3 days', 'Cash', 'Class project supplies'),
        (v_user_id, 'expense', 650.00, 'Shopping', 'Graphic tee on sale', CURRENT_DATE - INTERVAL '2 days', 'UPI / Card', 'Weekend mall shopping'),
        (v_user_id, 'expense', 180.00, 'Food', 'Boba tea with sibling', CURRENT_DATE - INTERVAL '1 days', 'UPI / Card', 'After sports practice');

        RAISE NOTICE 'Successfully seeded sample teen data for user %', v_user_id;
    ELSE
        RAISE NOTICE 'No user found in auth.users. Please create a user first before running seed.';
    END IF;
END $$;
