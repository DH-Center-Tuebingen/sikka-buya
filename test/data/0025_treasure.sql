INSERT INTO
  treasure (
    --id,
    name,
    description,
    earliest_year,
    latest_year,
    location,
    properties
  )
VALUES
  (
    --1,
    'London',
    'https://en.wikipedia.org/wiki/Londinium',
    100,
    130,
    ST_GeomFromGeoJSON(
      '{
            "coordinates": [
                [
                   [
                     -0.121,
                     51.527
                 ],
                 [
                   -0.154,
                   51.497
                 ],
                 [
                   -0.088,
                   51.495
                 ],
                 [
                   -0.121,
                   51.527
                 ]
                ]
            ],
            "type": "Polygon"
        }'
    ),
    null
  ),
  (
    --2,
    'La Coruña',
    'https://en.wikipedia.org/wiki/A_Coru%C3%B1a',
    20,
    30,
    ST_GeomFromGeoJSON(
      '{
        "coordinates": [
          -8.403,
          43.369
        ],
        "type": "Point"
      }'
    ),
    '{ "radius": 10000, "isFeature": true }'
  );

INSERT INTO
  treasure_item (
    --id,
    treasure,
    coinType,
    count,
    dynasty,
    fragment,
    material,
    mint_region,
    uncertain_mint,
    nominal,
    weight,
    year,
    uncertain_year
  )
VALUES
  (
    -- GERMAN_TREASURE-ITEM, id: 1
    1,
    -- treasure
    1,
    -- coinType
    100,
    -- count
    1,
    -- dynasty
    TRUE,
    -- fragment
    1,
    -- material
    2,
    -- mint
    null,
    -- uncertain_mint
    2,
    -- nominal
    0.54,
    -- weight
    20,
    -- year
    null -- uncertain_year
  ),
  (
    -- ALESIA_TREASURE_ITEM, id: 2
    1,
    -- treasure
    2,
    -- coinType
    5,
    -- count
    2,
    -- dynasty
    FALSE,
    -- fragment
    3,
    -- material
    null,
    -- mint
    'Alesia',
    -- uncertain_mint
    1,
    -- nominal
    3,
    -- weight
    null,
    -- year
    '23x' -- uncertain_year
  ),
  (
    -- GERMAN_TWO_TREASURE_ITEM, id: 3
    2,
    -- treasure
    1,
    -- coinType
    44,
    -- count
    5,
    -- dynasty
    FALSE,
    -- fragment
    4,
    -- material
    3,
    -- mint
    'UNKNOWN',
    -- uncertain_mint
    4,
    -- nominal
    200,
    -- weight
    1,
    -- year
    '222[a]' -- uncertain_year
  );