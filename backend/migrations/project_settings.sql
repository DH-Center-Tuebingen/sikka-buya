CREATE TABLE settings (
    id SERIAL PRIMARY KEY ,
    name TEXT NOT NULL,
    value TEXT,
    parent INTEGER REFERENCES settings(id)
)