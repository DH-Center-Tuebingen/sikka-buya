DROP TABLE IF EXISTS treasure_item CASCADE;
DROP TABLE IF EXISTS treasure CASCADE;

CREATE TABLE treasure (
  id SERIAL PRIMARY KEY,
  earliestYear INTEGER,
  latestYear INTEGER,
  literature TEXT,
  name VARCHAR(255) NOT NULL UNIQUE,
  location geometry
);

CREATE TABLE treasure_item (
  id SERIAL PRIMARY KEY,
  coinType INTEGER REFERENCES type(id),
  count INTEGER,
  dynasty INTEGER REFERENCES dynasty(id),
  fragment BOOLEAN,
  material INTEGER REFERENCES material(id),
  mint INTEGER REFERENCES mint(id),
  uncertain_mint TEXT,
  nominal INTEGER REFERENCES nominal(id),
  treasure INTEGER NOT NULL REFERENCES treasure(id) ON DELETE CASCADE,
  weight FLOAT,
  year INTEGER,
  uncertain_year TEXT
);
