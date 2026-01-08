const { default: routesDe } = require('./de/routes.de')
const { default: cmsDe } = require('./de/cms.de')
const { default: permissionsDe } = require('./de/permissions.de')

const general = {
    type:
        "Typ | Typen",
    no:
        "nein",
    type_catalogue:
        "Typenkatalog",
    longitude:
        "Längengrad",
    latitude:
        "Breitengrad",
    online:
        "online",
    offline:
        "offline",
    server_status:
        "server status",
    delete_submit:
        "Entfernen",
    user:
        "Nutzer | Nutzer",
    yes: "ja",
    or: "oder",
    and: "und"
}

const editor = {
    admin_properties:
        "Administration",
    data_properties:
        "Daten",
    create_type:
        "Neuen Typ anlegen",
    administration:
        "Admin-Bereich",
    assist_tools:
        "Hilfsprogramme",
    compare_last_cleanup:
        "Vergleiche Letzte Bereinigung",
    move_to_verses:
        "nach Vers verschieben",
    move_to_coin_mark:
        "nach Einzelwort verschieben",
    expert_search:
        "Expertensuche"
}


const property = {
    additional_persons:
        "Sonstige Personen",
    backside:
        "Revers",

    caliph: "Kalif | Kalifen",
    misc:
        "Randbeschriftung",
    circular_text:
        "Umschrift | Umschriften",
    coin_mark:
        "Münz- und Beizeichen",
    coin_verse:
        "besondere Einzelworte, Formeln, Koranverse",
    cursive_script:
        "kursive Schriftart",
    completed:
        "Geprüft",
    donativ:
        "Geschenkmünze",
    dynasty:
        "Dynastie | Dynastien",
    exclude_from_type_catalogue:
        "Von Katalog ausschließen",
    exclude_from_map_app:
        "Von Karte ausschließen",
    field_text:
        "Feld",
    frontside:
        "Avers",
    historical_region:
        "Historische Region | Historische Regionen",
    honorific:
        "Ehrenname | Ehrennamen",
    issuing_state:
        "Ausgebender Staat | Ausgebende Staaten",
    isolated_characters:
        "isolierter Buchstabe | isolierte Buchstaben",
    issuer:
        "Münzherr",
    intermediate_inscript:
        "Mittlere Umschrift",
    internal_notes:
        "Interne Anmerkungen",
    inner_inscript:
        "innere Umschrift",
    literature_and_remarks:
        "Literatur und Anmerkungen",
    material:
        "Material | Materialien",
    mint_year:
        "Prägejahr",
    mint:
        "Prägeort | Prägeorte",
    mint_as_on_coin:
        "Prägeort wie auf Münze",
    mint_uncertain:
        "Prägeort Nicht Sicher",
    nominal:
        "Nominal | Nominale",
    overlord:
        "Oberherr | Oberherren",
    outer_inscript:
        "äußere Umschrift",
    person:
        "Person | Personen",
    piece:
        "Exemplar | Exemplare",
    procedure:
        "Herstellungsart | Herstellungsarten",
    procedures:
    {
        cast:
            "gegossen",
        pressed:
            "geprägt",
    },
    purity: "Feingehalt",
    province: "Region | Regionen",
    reviewed: "Erledigt",
    role:
        "Rolle | Rollen",
    sides:
    {
        front:
            "Vorderseite",
        back:
            "Rückseite"
    },
    specialities_and_variants:
        "Besonderheiten / Varianten",
    small:
        "kleine Münze",
    title:
        "Titel",
    type:
        "Typ",
    type_id:
        "sikka:būya-ID | sikka:būya-IDs",

    treadwell_id:
        "Treadwell-ID | Treadwell-IDs",
    uncertain_location:
        "Verortung unsicher",
    excludeFromTypeCatalogue:
        "Nicht für Typenkatalog",
    excludeFromMapApp:
        "nicht für polit. Karten",
    varieties:
        "Varianten",
    year_uncertain:
        "Jahr Nicht Sicher"
}

const role = {
    cutter: "Stempelschneider | Stempelschneider",
    heir: "designierter Thronfolger des Kalifen | designierter Thronfolger des Kalifen",
    warden: "Münzwardein | Münzwardeien",
    buyid: "Būyide | Būyiden",
    caliph: "Kalif | Kalifen",
    vassal: "Vasallendynastie",
    donator: "Donator | Donatoren",
}

const attribute = {
    name:
        "Name | Namen",
    shortName:
        "Kurzform",
    longitude:
        "Längengrad",
    latitude:
        "Breitengrad",
    test:
        "Typ",
}


const info = {
    overlords: "Notiz: Bei der Oberherren-Eingabe geht man in der Hierarchie von unten (1.) nach oben, d. h. Nr. 2. steht über Nr. 1, Nr. 3 über Nr. 2 usw."

}

const message = {
    list_empty: "Keine Elemente in der Liste.",
    filter_list: "Text eingeben um Liste zu filtern ...",
    filter_is_active: "Filter sind derzeit aktiv! Clicken zum deaktivieren!"
}

const error = {
    could_not_update_element:
        "Das angegebene Element konnte nicht aktualisiert werden. Die Datenbank ist nicht erreichbar.",
    loading_element:
        "Das angefragte Element konnte nicht geladen werden. Gehe zur Liste zurück oder erstelle ein neues Element hier. Kontaktiere einen Admin, falls das Problem weiterhin besteht."
    ,
    loading_list:
        "List konnte nicht geladen werden. Anscheinend ist die Datenbank nicht verfügbar. Oder es liegt ein Anfragefehler vor.",
    delete_list_item_prevented:
        "Eintrag konnte nicht gelöscht werden. Wahscheinlich wird er noch von anderen Einträgen referenziert."
}


const warning = {
    filtered_list_is_empty:
        "Es gibt keine Treffer mit dem angegebenen Filter!",
    list_is_empty:
        "Bisher sind keine Werte in dieser Liste.",
    leave_without_saving:
        "Wollen Sie ohne speichern das Dokument schließen? Alle Änderungen gehen hierbei verloren!"
}

const form = {
    create:
        "erstellen",
    submit:
        "senden",
    cancel:
        "abbrechen"
}

const navigation = {
    back:
        "zurück"
}

const system = {
    login:
        "anmelden",
    logout:
        "abmelden",
    email:
        "E-Mail",
    password:
        "Password",
    register:
        "Registrieren",
    register_title:
        "Registrierung"
}

const catalog = {
    reset_filters: "Filter zurücksetzen"
}

module.exports = {
    attribute,
    catalog,
    cms: cmsDe,
    editor,
    error,
    form,
    info,
    general,
    message,
    navigation,
    permissions: permissionsDe,
    property,
    role,
    warning,
    system,
    routes: routesDe
}