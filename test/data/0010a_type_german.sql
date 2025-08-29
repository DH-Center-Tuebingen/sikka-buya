INSERT INTO
    type (
        id,
        project_id,
        treadwell_id,
        material,
        purity,
        mint,
        mint_as_on_coin,
        nominal,
        small,
        procedure,
        year_of_mint,
        donativ,
        caliph,
        front_side_field_text,
        front_side_inner_inscript,
        front_side_intermediate_inscript,
        front_side_outer_inscript,
        front_side_misc,
        back_side_field_text,
        back_side_inner_inscript,
        back_side_intermediate_inscript,
        back_side_outer_inscript,
        back_side_misc,
        cursive_script,
        literature,
        specials,
        internal_notes,
        mint_uncertain,
        year_uncertain,
        plain_text
    )
VALUES
    (
        1,
        'GER1989',
        'GD89',
        1,
        /*Gold*/
        700,
        1,
        /*Berlin*/
        'Börlin',
        2,
        /*1 Mark*/
        true,
        'pressed',
        1989,
        true,
        4,
        /* Karl der Große */
        '<div>Abbildung des deutschen Michels</div>',
        '<div>Danach lasst uns alle streben</div>',
        '<div>für das deutsche Vaterland!</div>',
        '<div>Einigkeit und Recht und Freiheit</div>',
        '<div>Michel ohne Mütze</div>',
        '<div>Abbildung eines Birnbaums</div>',
        '<div>Und kam die goldene Herbsteszeit,</div>',
        '<div>Ein Birnbaum in seinem Garten stand,</div>',
        '<div>Herr von Ribbeck auf Ribbeck im Havelland,</div>',
        '<div>Birnbaum ohne Früchte</div>',
        false,
        '<div style=" text - align: center;">Av: Nationalhymne</div><div style=" text - align: center;">Rev. Gedicht Fontane</div>',
        '<div style=" text - align: center;">Keine</div>',
        '<div style=" text - align: center;">Bitte nochmal neu!</div>',
        false,
        false,
        'GER1989\nGøld\nBerlin\n1 Mark\nAbbildung des deutschen Michels\nDanach lasst uns alle streben\nfür das deutsche Vaterland!\nEinigkeit und Recht und Freiheit\nMichel ohne Mütze\nAbbildung eines Birnbaums\nUnd kam die goldene Herbsteszeit,\nEin Birnbaum in seinem Garten stand,\nHerr von Ribbeck auf Ribbeck im Havelland,\nBirnbaum ohne Früchte\nAv: NationalhymneRev. Gedicht Fontane\nKeine'
    );

INSERT INTO internal_notes_plain_text (type, text) VALUES (1, 'Bitte nochmal neu!');

/** ISSUERS **/ 
    
INSERT INTO issuer (type, person) VALUES (1, 1); /* Kohl */
INSERT INTO issuer_titles (issuer, title) VALUES (1, 1),/* Prof. */ (1, 2) /* Dr. */;
INSERT INTO  issuer_honorifics (issuer, honorific) VALUES (1, 1) /* der Schwarze Riese */, (1, 2) /* die Birne */;


/** OVERLORDS **/
INSERT INTO overlord (type, person, rank) VALUES (1, 2, 2) /* MERKEL */, (1, 17, 1) /* WESTERWELLE */;

INSERT INTO overlord_titles (overlord_id, title_id) VALUES (1, 1) /* Prof. */, (2, 2) /* Dr. */;
INSERT INTO overlord_honorifics (overlord_id, honorific_id) VALUES  (1, 1) /* der Schwarze Riese */, (1, 6) /* von Deutschland */, (2, 6) /* von Deutschland */;

/** COIN_MARKS **/
INSERT INTO
    type_coin_marks (type, coin_mark)
VALUES
    (1, 1),/* Ä */
    (1, 2),/* Ü */
    (1, 4);/* π */


/** COIN_VERSE **/
INSERT INTO
    type_coin_verse (type, coin_verse)
VALUES
    (1, 2), /* شاي أسود */
    (1, 3); /* Koran 30:4‒5 */

/** Pieces **/
INSERT INTO
    piece (type, piece)
VALUES
    (1, 'https://www.berlin.de/'),
    (1, 'https://de.wikipedia.org/wiki/Berlin');

/** Other Persons **/
INSERT INTO
    other_person (type, person)
VALUES
    (1, 5) /* Dürer */;