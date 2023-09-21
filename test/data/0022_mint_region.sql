INSERT INTO
    mint_region (
        name,
        uncertain,
        location,
        properties,
        description
    )
VALUES
    (
        'Germany',
        false,
        'POINT(52.51 13.37)',
        '{"radius": 20000, "isFeature": true}',
        '<h2>Germany</h2><p>Germany is a country in central Europe.</p>'
    ),
    (
        'Paris',
        false,
        'POINT(48.86 2.33)',
        '{"radius": 10000, "isFeature": true}',
        '<h2>Paris</h2><p>Paris is the capital of France.</p>'
    ),
    (
        'Ǎtlantis',
        true,
        ST_AsGeoJson(
            '{ "type": "Polygon", "coordinates": [ [ [5.27, 41.69], [3.77, 40.83], [5.43, 39.30], [6.87, 39.28], [7.49, 40.51], [6.70, 41.55], [5.27, 41.69] ] ] }'
        ),
        NULL,
        '<h2>Ǎtlantis</h2><p>Ǎtlantis is a fictional island.</p>'
    ),
    (
        'Constantinople',
        true,
        ST_AsGeoJson(
            '{ "coordinates": [ [ [ 28.61, 40.87 ], [ 28.88, 40.73 ], [ 28.88, 40.72 ], [ 29.47, 40.73 ], [ 29.47, 40.99 ], [ 29.11, 41.20 ], [ 28.61, 40.87 ] ] ], "type": "Polygon" }'
        ),
        NULL,
        NULL
    );