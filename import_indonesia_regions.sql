-- SQL script to create tables and import data for Indonesian provinces and regencies.
-- This script is designed to be run in the Supabase SQL Editor or a PostgreSQL client.

-- 1. Create 'provinces' table
CREATE TABLE IF NOT EXISTS provinces (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL
);

-- 2. Create 'regencies' table
CREATE TABLE IF NOT EXISTS regencies (
    id BIGINT PRIMARY KEY,
    province_id BIGINT NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
    name TEXT NOT NULL
);

-- 3. Insert sample data for provinces (first 5 rows from provinces.csv)
-- For full import, use the COPY command as described below.
INSERT INTO provinces (id, name) VALUES
(11, 'ACEH'),
(12, 'SUMATERA UTARA'),
(13, 'SUMATERA BARAT'),
(14, 'RIAU'),
(15, 'JAMBI')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert sample data for regencies (first 5 rows from regencies.csv)
-- For full import, use the COPY command as described below.
INSERT INTO regencies (id, province_id, name) VALUES
(1101, 11, 'KABUPATEN SIMEULUE'),
(1102, 11, 'KABUPATEN ACEH SINGKIL'),
(1103, 11, 'KABUPATEN ACEH SELATAN'),
(1104, 11, 'KABUPATEN ACEH TENGGARA'),
(1105, 11, 'KABUPATEN ACEH TIMUR')
ON CONFLICT (id) DO NOTHING;

-- ---
-- Instructions for bulk import using the COPY command:
-- The COPY command is the most efficient way to import large CSV files into PostgreSQL.
-- However, it typically requires direct access to the PostgreSQL server or a psql client.
-- If you are using Supabase, you might need to:
--   a) Upload your CSV files to a Supabase Storage bucket.
--   b) Use the 'COPY FROM PROGRAM' command if your Supabase instance allows it,
--      or use a tool like 'psql' locally to connect to your Supabase database
--      and run the COPY commands.

-- Example COPY command for 'provinces.csv' (run this from a psql client connected to your Supabase DB):
-- \copy provinces FROM 'C:/Users/ohyus/Project/aaa/provinces.csv' WITH (FORMAT CSV, DELIMITER ',', HEADER FALSE);

-- Example COPY command for 'regencies.csv' (run this from a psql client connected to your Supabase DB):
-- \copy regencies FROM 'C:/Users/ohyus/Project/aaa/regencies.csv' WITH (FORMAT CSV, DELIMITER ',', HEADER FALSE);

-- IMPORTANT:
-- - Adjust the file paths in the COPY commands to match the location where you run psql.
-- - If your CSV files have a header row, change 'HEADER FALSE' to 'HEADER TRUE'.
-- - Ensure the user running the COPY command has sufficient permissions.
-- - For Supabase, consider using their UI's table editor for direct CSV import if available,
--   or uploading to Storage and then using a SQL query to import from Storage.
