ALTER TABLE public.listings
ADD CONSTRAINT fk_user_id_to_public_users
FOREIGN KEY (user_id)
REFERENCES public.users (id)
ON DELETE CASCADE;