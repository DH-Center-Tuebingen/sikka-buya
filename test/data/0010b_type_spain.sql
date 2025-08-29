
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
        3,
        'Spanish',
        'SP1964',
        3,
        /*Perlmutt*/
        null,
        2,
        /*Paris*/
        'Paris',
        4,
        /*1 Peseta*/
        true,
        'hammer',
        1964,
        true,
        13,
        /* Goscinny */
        'Abb. Spanische Flagge',
        'Venid españoles',
        'Al grito acudid.',
        'Dios salve a la Reina,,',
        'Dios salve al país.',
        'Spanischer Bulle',
        'Más allá',
        'Fuerza y honor',
        'La unión hace la fuerza',
        'Bulle ohne Hörner',
        false,
        'Don Quijote de la Mancha',
        'Verrückte Kombination',
        'Offensichtliche Fälschung!',
        false,
        false,
        'SP1964\nPerlmutt\nParis\n1 Złoty\nAbb. Spanische Flagge\nVenid españoles\nAl grito acudid.\nDios salve a la Reina\nDios salve al país.\nSpanischer Bulle\nMás allá\nFuerza y honor\nLa unión hace la fuerza\nBulle ohne Hörner\nDon Quijote de la Mancha\nVerrückte Kombination'
    );

INSERT INTO internal_notes_plain_text (type, text) VALUES (3, 'Offensichtliche Fälschung!');

-- Insert issuers for Spanish type
INSERT INTO issuer (type, person) VALUES (3, 12); -- UDERZO
INSERT INTO issuer (type, person) VALUES (3, 13); -- GOSCINNY

-- Insert issuer titles
INSERT INTO issuer_titles (issuer, title) VALUES 
  ((SELECT id FROM issuer WHERE type = 3 AND person = 12), 1), -- UDERZO - PROF
  ((SELECT id FROM issuer WHERE type = 3 AND person = 12), 2), -- UDERZO - DR
  ((SELECT id FROM issuer WHERE type = 3 AND person = 13), 3), -- GOSCINNY - MONSIEUR
  ((SELECT id FROM issuer WHERE type = 3 AND person = 13), 4); -- GOSCINNY - KOENIG

-- Insert issuer honorifics
INSERT INTO issuer_honorifics (issuer, honorific) VALUES 
  ((SELECT id FROM issuer WHERE type = 3 AND person = 12), 3), -- UDERZO - BULLDOZER
  ((SELECT id FROM issuer WHERE type = 3 AND person = 12), 4), -- UDERZO - FRANCAIS
  ((SELECT id FROM issuer WHERE type = 3 AND person = 13), 1), -- GOSCINNY - BLACK_GIANT
  ((SELECT id FROM issuer WHERE type = 3 AND person = 13), 2); -- GOSCINNY - PEAR

-- Insert overlords for Spanish type
INSERT INTO overlord (type, person, rank) VALUES (3, 7, 1); -- HOLLANDE - rank 1
INSERT INTO overlord (type, person, rank) VALUES (3, 8, 2); -- SARKOZY - rank 2

-- Insert overlord titles
INSERT INTO overlord_titles (overlord_id, title_id) VALUES 
  ((SELECT id FROM overlord WHERE type = 3 AND person = 7), 1), -- HOLLANDE - PROF
  ((SELECT id FROM overlord WHERE type = 3 AND person = 7), 2), -- HOLLANDE - DR
  ((SELECT id FROM overlord WHERE type = 3 AND person = 8), 3), -- SARKOZY - MONSIEUR
  ((SELECT id FROM overlord WHERE type = 3 AND person = 8), 5); -- SARKOZY - KOENIGIN

-- Insert overlord honorifics
INSERT INTO overlord_honorifics (overlord_id, honorific_id) VALUES 
  ((SELECT id FROM overlord WHERE type = 3 AND person = 7), 8), -- HOLLANDE - THE_GREAT
  ((SELECT id FROM overlord WHERE type = 3 AND person = 7), 7), -- HOLLANDE - MERMAID
  ((SELECT id FROM overlord WHERE type = 3 AND person = 8), 5), -- SARKOZY - GENERAL
  ((SELECT id FROM overlord WHERE type = 3 AND person = 8), 9); -- SARKOZY - CREATURE_OF_THE_SEA

-- Insert other persons for Spanish type
INSERT INTO other_person (type, person) VALUES (3, 5); -- DUERER
INSERT INTO other_person (type, person) VALUES (3, 22); -- ARIELLE

-- Insert piece for Spanish type
INSERT INTO piece (type, piece) VALUES (3, 'https://de.wikipedia.org/wiki/Spanien');
INSERT INTO piece (type, piece) VALUES (3, 'https://es.wikipedia.org/wiki/España');