ALTER TABLE public.listings
DROP CONSTRAINT IF EXISTS fk_user_id_to_public_users;

ALTER TABLE public.listings
ADD CONSTRAINT fk_listings_auth_user_id
FOREIGN KEY (user_id)
REFERENCES auth.users (id)
ON DELETE CASCADE;