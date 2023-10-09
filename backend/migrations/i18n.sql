CREATE TABLE IF NOT EXISTS i18n (
    id SERIAL PRIMARY KEY ,
    name TEXT NOT NULL,
    value TEXT,
    parent INTEGER REFERENCES settings(id)
) ;