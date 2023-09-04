ALTER TABLE
    treasure_item DROP COLUMN IF EXISTS mint;

ALTER TABLE
    treasure_item DROP COLUMN IF EXISTS mint_region;

DROP TABLE IF EXISTS mint_region;

CREATE TABLE IF NOT EXISTS mint_region (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    location GEOMETRY,
    properties JSONB,
    uncertain BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE
    treasure_item
ADD
    COLUMN IF NOT EXISTS mint_region INTEGER REFERENCES mint_region(id) ON DELETE RESTRICT ON UPDATE CASCADE;