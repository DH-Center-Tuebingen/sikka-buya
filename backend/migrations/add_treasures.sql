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
  coinType INTEGER REFERENCES type(id),
  count INTEGER,

  dynasty INTEGER REFERENCES dynasty(id),
  fragment BOOLEAN,
  id SERIAL PRIMARY KEY,
  material INTEGER REFERENCES material(id),
  mint INTEGER REFERENCES mint(id),
  nominal INTEGER REFERENCES nominal(id),
  treasure INTEGER NOT NULL REFERENCES treasure(id) ON DELETE CASCADE,
  weight FLOAT,
  year TEXT
);
