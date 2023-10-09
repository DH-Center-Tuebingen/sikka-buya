INSERT INTO
    mint_region (
        name,
        uncertain,
        location,
        properties
    )
VALUES
    (
        'Germany',
        false,
        'POINT(52.51 13.37)',
        '{"radius": 20000, "isFeature": true}'
    ),
    (
        'Paris',
        false,
        'POINT(48.86 2.33)',
        '{"radius": 10000, "isFeature": true}'
    ),
    (
        'Ǎtlantis',
        true,
        ST_GeomFromGeoJSON(
            '{ "type": "Polygon", "coordinates": [ [ [5.27, 41.69], [3.77, 40.83], [5.43, 39.30], [6.87, 39.28], [7.49, 40.51], [6.70, 41.55], [5.27, 41.69] ] ] }'
        ),
        NULL
    ),
    (
        'Constantinople',
        true,
        ST_GeomFromGeoJSON(
            '{ "coordinates": [ [ [ 28.61, 40.87 ], [ 28.88, 40.73 ], [ 28.88, 40.72 ], [ 29.47, 40.73 ], [ 29.47, 40.99 ], [ 29.11, 41.20 ], [ 28.61, 40.87 ] ] ], "type": "Polygon" }'
        ),
        NULL
    );