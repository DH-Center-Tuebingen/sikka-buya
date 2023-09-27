SELECT
    RENAME_IF_COLUMN_EXISTS('treasure', 'earliestyear', 'earliest_year');

SELECT
    RENAME_IF_COLUMN_EXISTS('treasure', 'latestyear', 'latest_year');

SELECT
    RENAME_IF_COLUMN_EXISTS('treasure', 'literature', 'description');