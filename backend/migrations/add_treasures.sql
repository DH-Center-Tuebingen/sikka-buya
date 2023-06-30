DROP TABLE IF EXISTS treasure_item CASCADE;
DROP TABLE IF EXISTS treasure CASCADE;

CREATE TABLE treasure (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  location geometry
);

CREATE TABLE treasure_item (
  id SERIAL PRIMARY KEY,
  count INTEGER,
  coin INTEGER REFERENCES type(id),
  treasure INTEGER NOT NULL REFERENCES treasure(id) ON DELETE CASCADE,
  dynasty INTEGER REFERENCES dynasty(id),
  mint INTEGER REFERENCES mint(id),
  year INTEGER,
  nominal INTEGER REFERENCES nominal(id),
  material INTEGER REFERENCES material(id),
  fragment BOOLEAN
);
