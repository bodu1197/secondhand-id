ALTER TABLE public.listings
DROP CONSTRAINT IF EXISTS fk_listings_auth_user_id;

ALTER TABLE public.listings
ADD CONSTRAINT fk_listings_public_users_id
FOREIGN KEY (user_id)
REFERENCES public.users (id)
ON DELETE CASCADE;