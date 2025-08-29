
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
        2,
        'FRévô1789',
        'FR1789',
        4,
        /*Silber*/
        null,
        2,
        /*Paris*/
        'Paris',
        3,
        /*1 Taler*/
        false,
        'cast',
        1789,
        true,
        11,
        /* Louis XVI */
        '<div>Abb. Französische Flagge</div>',
        '<div>Contre nous de la tyrannie</div>',
        '<div>Le jour de gloire est arrivé!</div>',
        '<div>Allons enfants de la Patrie,</div>',
        '<div>Flagge wehend</div>',
        '<div>Französischer Hahn</div>',
        '<div>Fraternité</div>',
        '<div>Égalité</div>',
        '<div>Liberté</div>',
        '<div>Hahn trägt Hose</div>',
        false,
        '<div style=" text - align: center;">Av: Nationalhymne</div><div style=" text - align: center;">Rev. revolutionärer Ausspruch</div>',
        '<div style=" text - align: center;">Revolutionsmünze mit König</div>',
        '<div style=" text - align: center;">Bitte Überprüfen!</div>',
        true,
        true,
        'FRévô1789\nSilber\nParis\n1 Taler\nAbb. Französische Flagge\nContre nous de la tyrannie\nLe jour de gloire est arrivé!\nAllons enfants de la Patrie,\nFlagge wehend\nFranzösischer Hahn\nFraternité\nÉgalité\nLiberté\nHahn trägt Hose\nAv: NationalhymneRev. revolutionärer Ausspruch\nRevolutionsmünze mit König'
    );

INSERT INTO internal_notes_plain_text (type, text) VALUES (2, 'Bitte Überprüfen!');

/** ISSUER **/

INSERT INTO issuer (type, person) VALUES (2, 10), /*de Gaule*/ (2, 9) /*Cirac*/;

INSERT INTO
    issuer_titles (issuer, title)
VALUES
    (2, 3), /* de Gaule -> Monsieur */
    (3, 1), /* Cirac -> Prof. */
    (3, 2), /* Cirac -> Dr. */
    (3, 3); /* Cirac -> Monsieur */

INSERT INTO
    issuer_honorifics (issuer, honorific)
VALUES
    (2, 3), /* de Gaule -> bulldozer */
    (2, 5), /* de Gaule -> le générale */
    (3, 3), /* Cirac -> bulldozer */
    (3, 4); /* Cirac -> le Français */

/** OVERLORDS **/
INSERT INTO
    overlord (type, person, rank)
VALUES
    (2, 6, 1), /* 3 - MACRON */
    (2, 7, 2), /* 4 - HOLLANDE */
    (2, 8, 3); /* 5 - SARKOZY */

INSERT INTO
    overlord_titles (overlord_id, title_id)
VALUES
    (3, 1), /* MACRON -> Prof */
    (3, 3), /* MACRON -> Monsieur */
    (4, 2), /* HOLLANDE -> Dr */
    (4, 3), /* HOLLANDE -> Monsieur */
    (5, 3); /* SARKOZY -> Monsieur */

INSERT INTO
    overlord_honorifics (overlord_id, honorific_id)
VALUES
    (3, 6), /* MACRON -> von Deutschland */
    (4, 4), /* HOLLANDE -> le Français */
    (4, 3), /* HOLLANDE -> bulldozer */
    (5, 4); /* SARKOZY -> le Français */

/** COIN MARKS **/
INSERT INTO
    type_coin_marks (type, coin_mark)
VALUES
    (2, 3), /* ê */
    (2, 4);  /* π */

/** COIN VERSES **/
INSERT INTO
    type_coin_verse (type, coin_verse)
VALUES
    (2, 1); /** Koran 9:33 */

/** PIECES **/
INSERT INTO
    piece (type, piece)
VALUES
    (2, 'https://de.wikipedia.org/wiki/Paris');


/** OTHER_PERSONS **/
INSERT INTO
    other_person (type, person)
VALUES
    (2, 12), /* Uderzo */
    (2, 13); /* Goscinny */