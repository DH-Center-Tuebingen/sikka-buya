INSERT INTO
    mint_region (name, uncertain, location, properties)
VALUES
    (
        'Germany',
        false,
        'POINT(52.51968196 13.376689258)',
        '{"radius": 20000}'
    ),
    (
        'Paris',
        false,
        'POINT(48.863113497 2.337794633)',
        NULL
    ),
    (
        'Ǎtlantis',
        true,
        ST_AsGeoJson(
            '{ "type": "Polygon", "coordinates": [ [ [5.2734375, 41.697525911], [3.779296875, 40.838749138], [5.438232422, 39.300299186], [6.877441406, 39.283293869], [7.492675781, 40.513799155], [6.701660156, 41.557921578], [5.2734375, 41.697525911] ] ] }'
        ),
        NULL
    ),
    (
        'Constantinople',
        true,
        ST_AsGeoJson(
            '{ "coordinates": [ [ [ 28.6101, 40.8729 ], [ 28.8800, 40.7317 ], [ 28.8800, 40.7200 ], [ 29.4791, 40.7367 ], [ 29.4769, 40.9939 ], [ 29.1148, 41.2056 ], [ 28.6101, 40.8729 ] ] ], "type": "Polygon" }'
        ),
        NULL
    );