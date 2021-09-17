\ c coins;

CREATE TABLE province (id SERIAL, name varchar(40) UNIQUE);

ALTER TABLE
    mint
ADD
    COLUMN province integer;

ALTER TABLE
    mint
ADD
    CONSTRAINT fk_province FOREIGN KEY (province) REFERENCES province (id);