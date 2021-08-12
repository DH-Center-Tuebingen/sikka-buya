INSERT INTO
    mint (name, location, uncertain, uncertain_area)
VALUES
    (
        'Berlin',
        'POINT(52.519681960044444 13.376689258464795)',
        false,
        NULL
    ),
    (
        'Paris',
        'POINT(48.86311349660349 2.3377946325579706)',
        false,
        NULL
    ),
    (
        'Rom',
        'POINT(41.90537289952873 12.45290345815694)',
        false,
        NULL
    ),
    (
        'Atlantis',
        'POINT(40.45050569371125 6.154396449638281)',
        true,
        ST_AsGeoJson(
            '{ "type": "Polygon",
            "coordinates": [ [ [ 5.2734375, 41.69752591075902 ],
            [ 3.779296875, 40.83874913796459 ],
            [ 5.438232421875, 39.30029918615029 ],
            [ 6.87744140625, 39.2832938689385 ],
            [ 7.492675781249999, 40.51379915504413 ],
            [ 6.701660156249999, 41.5579215778042 ],
            [ 5.2734375, 41.69752591075902 ] ] ] }'
        )
    );