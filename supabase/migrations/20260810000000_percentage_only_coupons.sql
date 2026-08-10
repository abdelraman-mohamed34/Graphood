-- Coupons are percentage-only. Existing values are interpreted as percentage
-- rates because the previous UI stored the entered discount in this column.
UPDATE public.coupons
SET discount_type = 'PERCENT',
    discount_value = LEAST(100, GREATEST(1, discount_value)),
    max_discount = NULL
WHERE discount_type <> 'PERCENT'
   OR discount_value < 1
   OR discount_value > 100
   OR max_discount IS NOT NULL;

ALTER TABLE public.coupons
    DROP CONSTRAINT IF EXISTS coupons_discount_type_check,
    DROP CONSTRAINT IF EXISTS coupons_discount_value_check;

ALTER TABLE public.coupons
    ADD CONSTRAINT coupons_discount_type_check
        CHECK (discount_type = 'PERCENT'),
    ADD CONSTRAINT coupons_discount_value_check
        CHECK (discount_value BETWEEN 1 AND 100),
    ADD CONSTRAINT coupons_percentage_has_no_cap_check
        CHECK (max_discount IS NULL);

ALTER TABLE public.orders
    ADD COLUMN discount_percentage numeric NULL;

UPDATE public.orders AS orders
SET discount_percentage = coupons.discount_value
FROM public.coupons AS coupons
WHERE orders.coupon_id = coupons.id
  AND orders.discount_amount > 0;

ALTER TABLE public.orders
    ADD CONSTRAINT orders_discount_percentage_check
        CHECK (discount_percentage IS NULL OR discount_percentage BETWEEN 1 AND 100);
