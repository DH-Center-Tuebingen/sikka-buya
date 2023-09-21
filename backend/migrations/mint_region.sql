CREATE TABLE IF NOT EXISTS mint_region (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    location GEOMETRY,
    properties JSONB,
    uncertain BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS treasure (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    earliest_year integer,
    latest_year integer,
    location GEOMETRY,
    properties JSONB,
    uncertain BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE
    treasure
ADD
    IF NOT EXISTS latest_year integer;

ALTER TABLE
    treasure
ADD
    IF NOT EXISTS earliest_year integer;

CREATE TABLE IF NOT EXISTS treasure_item (
    id SERIAL PRIMARY KEY,
    cointype integer,
    count integer,
    dynasty integer REFERENCES dynasty(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    fragment boolean,
    material integer REFERENCES material(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    uncertain_mint text,
    nominal integer REFERENCES nominal(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    treasure integer NOT NULL REFERENCES treasure(id) ON DELETE CASCADE ON UPDATE CASCADE,
    weight double precision,
    year integer,
    uncertain_year text,
    mint_region integer REFERENCES mint_region(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

ALTER TABLE
    treasure_item DROP COLUMN IF EXISTS mint;

ALTER TABLE
    treasure_item DROP COLUMN IF EXISTS mint_area;

ALTER TABLE
    treasure_item
ADD
    COLUMN IF NOT EXISTS mint_region INTEGER REFERENCES mint_region(id) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE
    treasure
ADD
    COLUMN IF NOT EXISTS properties JSONB;