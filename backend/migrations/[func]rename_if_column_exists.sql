CREATE
OR REPLACE FUNCTION RENAME_IF_COLUMN_EXISTS(tname TEXT, old_name TEXT, new_name TEXT) RETURNS VOID AS $$ BEGIN IF EXISTS(
  SELECT
    *
  FROM
    information_schema.columns
  WHERE
    table_name = tname
    and column_name = old_name
) THEN
ALTER TABLE
  tname RENAME COLUMN old_name TO new_name;

END IF;

END;

$$ LANGUAGE plpgsql VOLATILE -- Says the function is implemented in the plpgsql language; VOLATILE says the function has side effects.
COST 100;

-- Estimated execution cost of the function.