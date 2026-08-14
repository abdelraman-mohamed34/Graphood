-- Atomically and idempotently create an order and its payment for a digital system.
CREATE OR REPLACE FUNCTION public.checkout_system_atomic(
    p_profile_id uuid,
    p_system_id uuid,
    p_plan text,
    p_license_type text,
    p_original_amount numeric,
    p_discount_amount numeric,
    p_discount_percentage numeric,
    p_coupon_id uuid,
    p_amount numeric,
    p_currency text,
    p_provider payment_provider,
    p_description text
)
RETURNS TABLE(order_id uuid, payment_id uuid, is_existing boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_system public.systems%ROWTYPE;
    v_existing_order_id uuid;
    v_existing_payment_id uuid;
    v_order_id uuid;
    v_payment_id uuid;
BEGIN
    IF auth.uid() IS DISTINCT FROM p_profile_id AND auth.role() <> 'service_role' THEN
        RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'UNAUTHORIZED';
    END IF;

    PERFORM pg_advisory_xact_lock(
        hashtextextended(p_profile_id::text || ':' || p_system_id::text, 0)
    );

    SELECT * INTO v_system FROM public.systems WHERE id = p_system_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'SYSTEM_NOT_FOUND';
    END IF;
    IF v_system.status <> 'ACTIVE' OR NOT COALESCE(v_system.is_public, false) THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'SYSTEM_UNAVAILABLE';
    END IF;
    IF v_system.owner_id = p_profile_id THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'CANNOT_PURCHASE_OWN_SYSTEM';
    END IF;

    SELECT o.id, p.id INTO v_existing_order_id, v_existing_payment_id
    FROM public.orders o
    LEFT JOIN public.payments p ON p.order_id = o.id AND p.status = 'PENDING'
    WHERE o.profile_id = p_profile_id
      AND o.system_id = p_system_id
      AND o.status = 'PENDING'
    ORDER BY o.created_at DESC
    LIMIT 1;

    IF v_existing_order_id IS NOT NULL THEN
        RETURN QUERY SELECT v_existing_order_id, v_existing_payment_id, true;
        RETURN;
    END IF;

    INSERT INTO public.orders (
        profile_id, system_id, plan, license_type, original_amount,
        discount_amount, discount_percentage, coupon_id, amount, currency,
        status, description
    ) VALUES (
        p_profile_id, p_system_id, p_plan, p_license_type, p_original_amount,
        p_discount_amount, p_discount_percentage, p_coupon_id, p_amount,
        p_currency, 'PENDING', p_description
    ) RETURNING id INTO v_order_id;

    INSERT INTO public.payments (order_id, provider, amount, currency, status)
    VALUES (v_order_id, p_provider, p_amount, p_currency, 'PENDING')
    RETURNING id INTO v_payment_id;

    RETURN QUERY SELECT v_order_id, v_payment_id, false;
END;
$$;

REVOKE ALL ON FUNCTION public.checkout_system_atomic(uuid, uuid, text, text, numeric, numeric, numeric, uuid, numeric, text, payment_provider, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.checkout_system_atomic(uuid, uuid, text, text, numeric, numeric, numeric, uuid, numeric, text, payment_provider, text) TO authenticated, service_role;
