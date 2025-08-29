INSERT INTO
    app_user
    (id, email, password, super)
VALUES
    (1, 'tom.testa@example.com'     , 'secure_password'             , true),
    (2, 'susan.sugar@example.com'   , 'super_secure_password'       , false),
    (3, 'writer@example.com'        , 'always_use_strong_passwords' , false),
    (4, 'editor@example.com'        , 'always_use_strong_passwords' , false),
    (5, 'type-editor@example.com'   , 'always_use_strong_passwords' , false)
    ;

INSERT INTO 
    app_user_privilege (app_user, privilege)
VALUES
    (3, 'writer'),
    (4, 'editor'),
    (5, 'type-editor')
    ;
