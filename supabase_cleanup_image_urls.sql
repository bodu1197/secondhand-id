-- 1. 중복된 URL 확인 (먼저 실행하여 어떤 데이터가 영향을 받는지 확인)
SELECT id, images
FROM listings
WHERE images::text LIKE '%supabase.co%supabase.co%';

-- 2. 중복 제거 (조심해서 실행!)
-- 이 쿼리는 images 배열의 각 요소에 대해 REGEXP_REPLACE를 적용합니다.
UPDATE listings
SET images = ARRAY(
  SELECT REGEXP_REPLACE(
    unnest(images),
    'https://ulwwlniyoypmfhpjrvdn.supabase.co/storage/v1/object/public/listings-images/',
    '',
    'g'
  )
)::text[]
WHERE images::text LIKE '%supabase.co%supabase.co%';

-- 3. 결과 확인 (수정 후 데이터가 올바른지 확인)
SELECT id, images FROM listings LIMIT 10;