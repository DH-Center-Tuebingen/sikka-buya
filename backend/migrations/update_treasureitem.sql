-- add uncertain_mint, uncertain_year
ALTER TABLE
  treasure_item
ADD
  COLUMN uncertain_mint TEXT;

ALTER TABLE
  treasure_item
ADD
  COLUMN uncertain_year TEXT;