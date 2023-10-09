--
-- PostgreSQL database dump
--

-- Dumped from database version 12.16
-- Dumped by pg_dump version 12.16

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
--SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry, geography, and raster spatial types and functions';


--
-- Name: unaccent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;


--
-- Name: EXTENSION unaccent; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION unaccent IS 'text search dictionary that removes accents';


--
-- Name: rename_if_column_exists(text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: app_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_user (
    id integer NOT NULL,
    name character varying,
    email character varying NOT NULL,
    password character varying,
    super boolean
);


--
-- Name: app_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.app_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: app_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.app_user_id_seq OWNED BY public.app_user.id;


--
-- Name: app_user_privilege; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_user_privilege (
    app_user integer NOT NULL,
    privilege text NOT NULL
);


--
-- Name: coin_marks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coin_marks (
    id integer NOT NULL,
    name character varying
);


--
-- Name: coin_marks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.coin_marks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: coin_marks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.coin_marks_id_seq OWNED BY public.coin_marks.id;


--
-- Name: coin_verse; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coin_verse (
    id integer NOT NULL,
    name text
);


--
-- Name: coin_verse_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.coin_verse_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: coin_verse_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.coin_verse_id_seq OWNED BY public.coin_verse.id;


--
-- Name: comment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comment (
    id integer NOT NULL,
    text character varying(40),
    property character varying(200),
    property_id integer,
    "time" timestamp without time zone DEFAULT now(),
    user_id integer
);


--
-- Name: dynasty; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dynasty (
    id integer NOT NULL,
    name character varying
);


--
-- Name: dynasty_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dynasty_id_seq
    AS integer
    START WITH 10
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dynasty_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dynasty_id_seq OWNED BY public.dynasty.id;


--
-- Name: epoch; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.epoch (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: epoch_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.epoch_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: epoch_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.epoch_id_seq OWNED BY public.epoch.id;


--
-- Name: honorific; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.honorific (
    id integer NOT NULL,
    name character varying
);


--
-- Name: honorific_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.honorific_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: honorific_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.honorific_id_seq OWNED BY public.honorific.id;


--
-- Name: i18n; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.i18n (
    id integer NOT NULL,
    name text NOT NULL,
    value text,
    parent integer
);


--
-- Name: i18n_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.i18n_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: i18n_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.i18n_id_seq OWNED BY public.i18n.id;


--
-- Name: internal_notes_plain_text; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.internal_notes_plain_text (
    text text,
    type integer
);


--
-- Name: issuer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.issuer (
    id integer NOT NULL,
    type integer,
    person integer
);


--
-- Name: issuer_honorifics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.issuer_honorifics (
    issuer integer,
    honorific integer
);


--
-- Name: issuer_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.issuer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: issuer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.issuer_id_seq OWNED BY public.issuer.id;


--
-- Name: issuer_titles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.issuer_titles (
    issuer integer,
    title integer
);


--
-- Name: material; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.material (
    id integer NOT NULL,
    name character varying
);


--
-- Name: material_color; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.material_color (
    material integer,
    color character(7)
);


--
-- Name: material_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.material_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: material_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.material_id_seq OWNED BY public.material.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    run_on timestamp without time zone NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: mint; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mint (
    id integer NOT NULL,
    name character varying,
    unsafe boolean,
    location public.geometry,
    uncertain boolean,
    uncertain_area public.geometry,
    province integer
);


--
-- Name: mint_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mint_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mint_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mint_id_seq OWNED BY public.mint.id;


--
-- Name: mint_region; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mint_region (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    location public.geometry,
    properties jsonb,
    uncertain boolean DEFAULT false NOT NULL
);


--
-- Name: mint_region_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mint_region_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mint_region_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mint_region_id_seq OWNED BY public.mint_region.id;


--
-- Name: nominal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nominal (
    id integer NOT NULL,
    name character varying
);


--
-- Name: nominal_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nominal_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: nominal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.nominal_id_seq OWNED BY public.nominal.id;


--
-- Name: note; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.note (
    text text,
    property character varying(40),
    property_id integer
);


--
-- Name: notes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notes_id_seq OWNED BY public.comment.id;


--
-- Name: other_person; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.other_person (
    type integer,
    person integer
);


--
-- Name: overlord; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.overlord (
    id integer NOT NULL,
    rank integer,
    type integer,
    person integer
);


--
-- Name: overlord_honorifics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.overlord_honorifics (
    overlord_id integer,
    honorific_id integer
);


--
-- Name: overlord_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.overlord_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: overlord_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.overlord_id_seq OWNED BY public.overlord.id;


--
-- Name: overlord_titles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.overlord_titles (
    overlord_id integer,
    title_id integer
);


--
-- Name: person; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.person (
    id integer NOT NULL,
    name character varying,
    role_legacy character varying,
    dynasty integer,
    short_name character varying,
    role integer
);


--
-- Name: person_color; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.person_color (
    person integer NOT NULL,
    color character(7)
);


--
-- Name: person_explorer_custom_sorting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.person_explorer_custom_sorting (
    "position" integer,
    person integer
);


--
-- Name: person_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.person_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: person_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.person_id_seq OWNED BY public.person.id;


--
-- Name: person_role; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.person_role (
    id integer NOT NULL,
    name character varying
);


--
-- Name: person_role_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.person_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: person_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.person_role_id_seq OWNED BY public.person_role.id;


--
-- Name: piece; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.piece (
    id integer NOT NULL,
    piece character varying,
    type integer
);


--
-- Name: piece_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.piece_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: piece_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.piece_id_seq OWNED BY public.piece.id;


--
-- Name: province; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.province (
    id integer NOT NULL,
    name character varying(40)
);


--
-- Name: province_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.province_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: province_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.province_id_seq OWNED BY public.province.id;


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    name text NOT NULL,
    value text,
    parent integer
);


--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- Name: title; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.title (
    id integer NOT NULL,
    name character varying
);


--
-- Name: title_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.title_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: title_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.title_id_seq OWNED BY public.title.id;


--
-- Name: treasure; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.treasure (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    earliest_year integer,
    latest_year integer,
    location public.geometry,
    properties jsonb,
    uncertain boolean DEFAULT false NOT NULL
);


--
-- Name: treasure_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.treasure_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: treasure_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.treasure_id_seq OWNED BY public.treasure.id;


--
-- Name: treasure_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.treasure_item (
    id integer NOT NULL,
    cointype integer,
    count integer,
    fragment boolean,
    material integer,
    uncertain_mint text,
    nominal integer,
    treasure integer NOT NULL,
    weight double precision,
    year integer,
    uncertain_year text,
    mint_region integer,
    epoch integer,
    reconstructed boolean DEFAULT false NOT NULL,
    mint_region_uncertain boolean DEFAULT false NOT NULL,
    mint_as_on_coin text
);


--
-- Name: treasure_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.treasure_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: treasure_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.treasure_item_id_seq OWNED BY public.treasure_item.id;


--
-- Name: type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.type (
    id integer NOT NULL,
    project_id character varying,
    treadwell_id character varying,
    material integer,
    mint integer,
    mint_as_on_coin character varying,
    nominal integer,
    year_of_mint character varying,
    donativ boolean,
    procedure character varying,
    caliph integer,
    front_side_field_text character varying,
    front_side_inner_inscript character varying,
    front_side_intermediate_inscript character varying,
    front_side_outer_inscript character varying,
    front_side_misc character varying,
    back_side_field_text character varying,
    back_side_inner_inscript character varying,
    back_side_intermediate_inscript character varying,
    back_side_outer_inscript character varying,
    back_side_misc character varying,
    cursive_script boolean,
    isolated_characters character varying,
    literature character varying,
    specials character varying,
    exclude_from_type_catalogue boolean DEFAULT false,
    exclude_from_map_app boolean DEFAULT false,
    internal_notes character varying DEFAULT ''::character varying,
    mint_uncertain boolean,
    year_uncertain boolean,
    plain_text text,
    search_vectors tsvector,
    purity numeric(8,4),
    small boolean DEFAULT false NOT NULL
);


--
-- Name: type_coin_marks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.type_coin_marks (
    type integer,
    coin_mark integer
);


--
-- Name: type_coin_verse; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.type_coin_verse (
    type integer,
    coin_verse integer
);


--
-- Name: type_completed; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.type_completed (
    type integer NOT NULL
);


--
-- Name: type_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.type_id_seq OWNED BY public.type.id;


--
-- Name: type_reviewed; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.type_reviewed (
    type integer NOT NULL
);


--
-- Name: web_page; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.web_page (
    id integer NOT NULL,
    title text,
    subtitle text,
    image integer,
    summary text,
    body text,
    page_group integer,
    created_timestamp timestamp without time zone NOT NULL,
    modified_timestamp timestamp without time zone NOT NULL,
    published_timestamp timestamp without time zone,
    author integer
);


--
-- Name: web_page_block; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.web_page_block (
    id integer NOT NULL,
    type text NOT NULL,
    "position" integer NOT NULL,
    text text,
    image integer,
    page integer,
    parent integer
);


--
-- Name: web_page_block_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.web_page_block_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: web_page_block_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.web_page_block_id_seq OWNED BY public.web_page_block.id;


--
-- Name: web_page_group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.web_page_group (
    id integer NOT NULL,
    name text
);


--
-- Name: web_page_group_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.web_page_group_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: web_page_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.web_page_group_id_seq OWNED BY public.web_page_group.id;


--
-- Name: web_page_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.web_page_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: web_page_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.web_page_id_seq OWNED BY public.web_page.id;


--
-- Name: web_page_image; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.web_page_image (
    id integer NOT NULL,
    url text,
    uploaded timestamp without time zone
);


--
-- Name: web_page_image_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.web_page_image_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: web_page_image_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.web_page_image_id_seq OWNED BY public.web_page_image.id;


--
-- Name: app_user id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_user ALTER COLUMN id SET DEFAULT nextval('public.app_user_id_seq'::regclass);


--
-- Name: coin_marks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coin_marks ALTER COLUMN id SET DEFAULT nextval('public.coin_marks_id_seq'::regclass);


--
-- Name: coin_verse id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coin_verse ALTER COLUMN id SET DEFAULT nextval('public.coin_verse_id_seq'::regclass);


--
-- Name: comment id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment ALTER COLUMN id SET DEFAULT nextval('public.notes_id_seq'::regclass);


--
-- Name: dynasty id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dynasty ALTER COLUMN id SET DEFAULT nextval('public.dynasty_id_seq'::regclass);


--
-- Name: epoch id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.epoch ALTER COLUMN id SET DEFAULT nextval('public.epoch_id_seq'::regclass);


--
-- Name: honorific id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.honorific ALTER COLUMN id SET DEFAULT nextval('public.honorific_id_seq'::regclass);


--
-- Name: i18n id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.i18n ALTER COLUMN id SET DEFAULT nextval('public.i18n_id_seq'::regclass);


--
-- Name: issuer id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issuer ALTER COLUMN id SET DEFAULT nextval('public.issuer_id_seq'::regclass);


--
-- Name: material id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material ALTER COLUMN id SET DEFAULT nextval('public.material_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: mint id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mint ALTER COLUMN id SET DEFAULT nextval('public.mint_id_seq'::regclass);


--
-- Name: mint_region id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mint_region ALTER COLUMN id SET DEFAULT nextval('public.mint_region_id_seq'::regclass);


--
-- Name: nominal id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nominal ALTER COLUMN id SET DEFAULT nextval('public.nominal_id_seq'::regclass);


--
-- Name: overlord id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.overlord ALTER COLUMN id SET DEFAULT nextval('public.overlord_id_seq'::regclass);


--
-- Name: person id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.person ALTER COLUMN id SET DEFAULT nextval('public.person_id_seq'::regclass);


--
-- Name: person_role id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.person_role ALTER COLUMN id SET DEFAULT nextval('public.person_role_id_seq'::regclass);


--
-- Name: piece id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.piece ALTER COLUMN id SET DEFAULT nextval('public.piece_id_seq'::regclass);


--
-- Name: province id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.province ALTER COLUMN id SET DEFAULT nextval('public.province_id_seq'::regclass);


--
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- Name: title id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.title ALTER COLUMN id SET DEFAULT nextval('public.title_id_seq'::regclass);


--
-- Name: treasure id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.treasure ALTER COLUMN id SET DEFAULT nextval('public.treasure_id_seq'::regclass);


--
-- Name: treasure_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.treasure_item ALTER COLUMN id SET DEFAULT nextval('public.treasure_item_id_seq'::regclass);


--
-- Name: type id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.type ALTER COLUMN id SET DEFAULT nextval('public.type_id_seq'::regclass);


--
-- Name: web_page id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_page ALTER COLUMN id SET DEFAULT nextval('public.web_page_id_seq'::regclass);


--
-- Name: web_page_block id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_page_block ALTER COLUMN id SET DEFAULT nextval('public.web_page_block_id_seq'::regclass);


--
-- Name: web_page_group id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_page_group ALTER COLUMN id SET DEFAULT nextval('public.web_page_group_id_seq'::regclass);


--
-- Name: web_page_image id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_page_image ALTER COLUMN id SET DEFAULT nextval('public.web_page_image_id_seq'::regclass);


--
-- Data for Name: app_user; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.app_user VALUES (1, NULL, 'admin@sikka-buya.de', '$2b$10$67jHE8fkL/h4qXC7tVldTeNVB3XwnrCi1srM/OV88JQzjp9w2QPYG', true);


--
-- Data for Name: app_user_privilege; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: coin_marks; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.coin_marks VALUES (1, 'drei Punkte (∴)');
INSERT INTO public.coin_marks VALUES (2, 'bāʾ/tāʾ/ṯāʾ');


--
-- Data for Name: coin_verse; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.coin_verse VALUES (1, 'Koran 9:33');
INSERT INTO public.coin_verse VALUES (2, 'محمد رسول الله');
INSERT INTO public.coin_verse VALUES (3, 'Koran 30:4‒5');


--
-- Data for Name: comment; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: dynasty; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.dynasty VALUES (1, 'Būyide');
INSERT INTO public.dynasty VALUES (2, 'ʿAbbāside');


--
-- Data for Name: epoch; Type: TABLE DATA; Schema: public; Owner: -
--
INSERT INTO public.epoch VALUES (1, 'Stone Age');
INSERT INTO public.epoch VALUES (2, 'Bronze Age');
INSERT INTO public.epoch VALUES (3, 'Iron Age');



--
-- Data for Name: honorific; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.honorific VALUES (1, '… ad-Daula');
INSERT INTO public.honorific VALUES (3, '… al-Mulūk');


--
-- Data for Name: i18n; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: internal_notes_plain_text; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.internal_notes_plain_text VALUES ('FINT 2010-6-33
https://www.fint-ikmk.uni-tuebingen.de/ikmk/mk-edit/mk_object_seiten.php?id=66

muss suchen Nur und Husam ad-Dawala Siraz 389H. ?', 4);


--
-- Data for Name: issuer; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.issuer VALUES (5, 4, 1);
INSERT INTO public.issuer VALUES (6, 4, 2);


--
-- Data for Name: issuer_honorifics; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.issuer_honorifics VALUES (5, 1);
INSERT INTO public.issuer_honorifics VALUES (5, 3);


--
-- Data for Name: issuer_titles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.issuer_titles VALUES (5, 2);
INSERT INTO public.issuer_titles VALUES (6, 1);


--
-- Data for Name: material; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.material VALUES (1, 'Gold');
INSERT INTO public.material VALUES (2, 'Silber');


--
-- Data for Name: material_color; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.material_color VALUES (1, '#FFD700');
INSERT INTO public.material_color VALUES (2, '#C0C0C0');


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: mint; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.mint VALUES (2, 'Fārs', NULL, '0101000020E6100000C3F5285C8FC24140AE47E17A148E4140', true, '0103000020E61000000100000006000000EC51B81E852B3B40713D0AD7A3904A40713D0AD7A3B03B40B81E85EB51384B40EC51B81E852B3B40CDCCCCCCCCCC4B400000000000C03A4014AE47E17AD44B40AE47E17A146E3A40AE47E17A146E4B406666666666A63A40295C8FC2F5C84A40', 1);
INSERT INTO public.mint VALUES (1, 'Šīrāz', NULL, '0101000020E6100000E9BACF750A963D40809730D2FF4A4A40', false, '0103000020E610000000000000', 1);


--
-- Data for Name: mint_region; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.mint_region VALUES (1, 'Maharlu', '', '0101000020E61000007B895494D0793D401D9A6E2974654A40', '{"radius": 18000, "isFeature": true}', false);
INSERT INTO public.mint_region VALUES (2, 'Kavir', '', '0101000020E6100000AE7C06123A47414085ECDFF1A9344A40', '{"radius": 34000, "isFeature": true}', true);


--
-- Data for Name: nominal; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.nominal VALUES (1, 'Dinar');
INSERT INTO public.nominal VALUES (2, 'Ruknī-Dinar');


--
-- Data for Name: note; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.note VALUES ('', 'mint', 2);
INSERT INTO public.note VALUES ('älteste Moschee (Saffaridenzeit)', 'mint', 1);


--
-- Data for Name: other_person; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: overlord; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: overlord_honorifics; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: overlord_titles; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: person; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.person VALUES (1, 'Rukn ad-Daula Abū ʿAlī al-Ḥasan b. Būya', NULL, 1, 'Rukn ad-Daula', NULL);
INSERT INTO public.person VALUES (2, 'Sulṭān ad-Daula Abū Šuǧāʿ Fanā-Ḫusra b. Bahāʾ ad-Daula Ḫusra-Fīrūz', NULL, NULL, 'Sulṭān ad-Daula', NULL);
INSERT INTO public.person VALUES (3, 'al-Muṭīʿ li-᾽llāh, Abu ᾽l-Qāsim al-Faḍl b. al-Muqtadir', NULL, 2, 'al-Muṭīʿ', 5);
INSERT INTO public.person VALUES (4, 'ʿIzz ad-Daula Abū Manṣūr Baḫtiyār b. Muʿizz ad-Daula Aḥmad', NULL, 1, 'ʿIzz ad-Daula', NULL);
INSERT INTO public.person VALUES (5, 'ʿUmdat ad-Daula Abū Isḥāq Ibrāhīm b. Muʿizz ad-Daula Aḥmad', NULL, 1, 'ʿUmdat ad-Daula', NULL);
INSERT INTO public.person VALUES (6, 'Abu ’l-Ḥasan Muḥammad b. al-Mustakfī', NULL, 2, 'Abu ’l-Ḥasan b. al-Mustakfī', 3);
INSERT INTO public.person VALUES (7, 'al-Qādir bi-᾽llāh, Abu ᾽l-ʿAbbās Aḥmad b. Isḥāq', NULL, 2, 'al-Qādir', 5);


--
-- Data for Name: person_color; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.person_color VALUES (1, '#ff00ff');
INSERT INTO public.person_color VALUES (2, '#00ffff');
INSERT INTO public.person_color VALUES (3, '#ffff00');
INSERT INTO public.person_color VALUES (4, '#d14a46');
INSERT INTO public.person_color VALUES (5, '#ffa953');


--
-- Data for Name: person_explorer_custom_sorting; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: person_role; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.person_role VALUES (3, 'heir');
INSERT INTO public.person_role VALUES (4, 'cutter');
INSERT INTO public.person_role VALUES (5, 'caliph');


--
-- Data for Name: piece; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.piece VALUES (5, 'https://www.zeno.ru/showphoto.php?photo=139208', 4);
INSERT INTO public.piece VALUES (6, 'https://www.zeno.ru/showphoto.php?photo=40340', 4);


--
-- Data for Name: province; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.province VALUES (1, 'Fārs');
INSERT INTO public.province VALUES (3, 'ʿUmān');
INSERT INTO public.province VALUES (10, 'Ḫūzistān');


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: title; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.title VALUES (1, 'malik');
INSERT INTO public.title VALUES (2, 'šāhānšāh');


--
-- Data for Name: treasure; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.treasure VALUES (1, 'Südufer Kasp. Meer', '<div style="text-align: center;"><b>Test</b></div><div style="text-align: left;">asd<b>sdasd</b>sdsd</div>', 330, 390, '0101000020E6100000A1445848D11B42403B4A9F02929C4A40', '{"radius": 217000, "isFeature": true}', false);
INSERT INTO public.treasure VALUES (2, 'Test', NULL, NULL, NULL, NULL, NULL, false);


--
-- Data for Name: treasure_item; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.treasure_item VALUES (3, 4, 2, true, 2, NULL, 1, 1, 9, 389, NULL, 1, NULL, false, false, NULL);
INSERT INTO public.treasure_item VALUES (4, NULL, 10, false, 1, 'Shama', NULL, 1, 60, NULL, '3[3-9]x', 2, NULL, false, false, 'Shama');


--
-- Data for Name: type; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.type VALUES (4, 'Šīr389', 's-389', 2, 1, 'Šīrāz', 1, '389', true, 'cast', 3, '<div style="text-align: center;">لا إله إلا الله</div><div style="text-align: center;">وحده لا شريك له</div>', '<div style="text-align: left;"><b>aaaa</b></div>', '<div style="text-align: right;"><i>bb</i></div>', '<div style="text-align: center;">بسم الله ضرب هذا الدرهم بشيراز سنة تسع وثمانين وثلثمائة<br></div>', '<div style="text-align: center;"><b><i>CCC</i></b></div>', '<div style="text-align: center;">محمد رسول الله</div><div style="text-align: left;"><font color="#808080"><span></span></font></div>', '<div style="text-align: center;"><i>2</i><br></div><div style="text-align: center;"><i>2</i></div><div style="text-align: center;"><i>2</i></div>', '<div style="text-align: right;"><b>3</b></div>', '<div style="text-align: center;">محمد رسول الله + Koran 9:33</div><div style="text-align: center;"></div>', '<div style="text-align: center;">5</div>', true, NULL, '<div style="text-align: center;"><br></div>', 'Im Av.-Feld unten zwei Punkte.

Av.-Randzier: Perlkreis, daran außen vier (?) Ringe, in denen jeweils ein Ringlein sitzt (⊚). Rev.-Feldbegrenzung: Perlkreis.<div><b></b></div>', false, false, '<div style="text-align: center;">FINT 2010-6-33
https://www.fint-ikmk.uni-tuebingen.de/ikmk/mk-edit/mk_object_seiten.php?id=66

muss suchen Nur und Husam ad-Dawala Siraz 389H. ?<br></div>', true, true, 'Šīr389
<h3>material</h3>Silber
<h3>nominal</h3>Dinar
<h3>Av. Feld</h3><div style="text-align: center;">لا إله إلا الله</div><div style="text-align: center;">وحده لا شريك له</div>
<h3>Av. innere Umschrift</h3><div style="text-align: left;"><b>aaaa</b></div>
<h3>Av. mittlere Umschrift</h3><div style="text-align: right;"><i>bb</i></div>
<h3>Av. äußere Umschrift</h3><div style="text-align: center;">بسم الله ضرب هذا الدرهم بشيراز سنة تسع وثمانين وثلثمائة<br></div>
<h3>Av. Randbeschriftung</h3><div style="text-align: center;"><b><i>CCC</i></b></div>
<h3>Rev. Feld</h3><div style="text-align: center;">محمد رسول الله</div><div style="text-align: left;"><font color="#808080"><span></span></font></div>
<h3>Rev. innere Umschrift</h3><div style="text-align: center;"><i>2</i><br></div><div style="text-align: center;"><i>2</i></div><div style="text-align: center;"><i>2</i></div>
<h3>Rev. mittlere Umschrift</h3><div style="text-align: right;"><b>3</b></div>
<h3>Rev. äußere Umschrift</h3><div style="text-align: center;">محمد رسول الله + Koran 9:33</div><div style="text-align: center;"></div>
<h3>Rev. Randbeschriftung</h3><div style="text-align: center;">5</div>
<h3>Besonderheiten/Varianten</h3>Im Av.-Feld unten zwei Punkte.

Av.-Randzier: Perlkreis, daran außen vier (?) Ringe, in denen jeweils ein Ringlein sitzt (⊚). Rev.-Feldbegrenzung: Perlkreis.<div><b></b></div>', '''2'':46,47,48 ''3'':52 ''33'':61 ''5'':64 ''9'':60 ''aaaa'':17 ''auss'':23,54,76 ''av'':4,14,18,22,35,67,72 ''bb'':21 ''besonderheiten/varianten'':65 ''ccc'':37 ''daran'':75 ''den'':80 ''feld'':5,39,68 ''feldbegrenz'':86 ''inn'':15,44 ''jeweil'':81 ''koran'':59 ''material'':2 ''mittl'':19,50 ''perlkreis'':74,87 ''punkt'':71 ''randbeschrift'':36,63 ''randzi'':73 ''rev'':38,43,49,53,62,85 ''ring'':78 ''ringlein'':83 ''silb'':3 ''sitzt'':84 ''umschrift'':16,20,24,45,51,55 ''unt'':69 ''vier'':77 ''zwei'':70 ''šīr389'':1 ''إلا'':8 ''إله'':7 ''الدرهم'':29 ''الله'':9,26,42,58 ''بسم'':25 ''بشيراز'':30 ''تسع'':32 ''رسول'':41,57 ''سنة'':31 ''شريك'':12 ''ضرب'':27 ''لا'':6,11 ''له'':13 ''محمد'':40,56 ''هذا'':28 ''وثلثمائة'':34 ''وثمانين'':33 ''وحده'':10', NULL, false);


--
-- Data for Name: type_coin_marks; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.type_coin_marks VALUES (4, 1);
INSERT INTO public.type_coin_marks VALUES (4, 2);


--
-- Data for Name: type_coin_verse; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: type_completed; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: type_reviewed; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: web_page; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: web_page_block; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: web_page_group; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: web_page_image; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Name: app_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.app_user_id_seq', 1, true);


--
-- Name: coin_marks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.coin_marks_id_seq', 2, true);


--
-- Name: coin_verse_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.coin_verse_id_seq', 3, true);


--
-- Name: dynasty_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.dynasty_id_seq', 2, true);


--
-- Name: epoch_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.epoch_id_seq', 4, false);


--
-- Name: honorific_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.honorific_id_seq', 3, true);


--
-- Name: i18n_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.i18n_id_seq', 1, false);


--
-- Name: issuer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.issuer_id_seq', 6, true);


--
-- Name: material_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.material_id_seq', 2, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.migrations_id_seq', 1, false);


--
-- Name: mint_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mint_id_seq', 2, true);


--
-- Name: mint_region_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mint_region_id_seq', 2, true);


--
-- Name: nominal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.nominal_id_seq', 2, true);


--
-- Name: notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notes_id_seq', 1, false);


--
-- Name: overlord_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.overlord_id_seq', 1, false);


--
-- Name: person_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.person_id_seq', 7, true);


--
-- Name: person_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.person_role_id_seq', 5, true);


--
-- Name: piece_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.piece_id_seq', 6, true);


--
-- Name: province_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.province_id_seq', 10, true);


--
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.settings_id_seq', 1, false);


--
-- Name: title_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.title_id_seq', 2, true);


--
-- Name: treasure_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.treasure_id_seq', 2, true);


--
-- Name: treasure_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.treasure_item_id_seq', 4, true);


--
-- Name: type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.type_id_seq', 4, true);


--
-- Name: web_page_block_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.web_page_block_id_seq', 1, false);


--
-- Name: web_page_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.web_page_group_id_seq', 1, false);


--
-- Name: web_page_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.web_page_id_seq', 1, false);


--
-- Name: web_page_image_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.web_page_image_id_seq', 1, false);


--
-- Name: app_user app_user_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT app_user_email_key UNIQUE (email);


--
-- Name: app_user app_user_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT app_user_name_key UNIQUE (name);


--
-- Name: app_user app_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT app_user_pkey PRIMARY KEY (id);


--
-- Name: app_user_privilege app_user_privilege_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_user_privilege
    ADD CONSTRAINT app_user_privilege_pkey PRIMARY KEY (app_user, privilege);


--
-- Name: coin_marks coin_marks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coin_marks
    ADD CONSTRAINT coin_marks_pkey PRIMARY KEY (id);


--
-- Name: coin_verse coin_verse_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coin_verse
    ADD CONSTRAINT coin_verse_pkey PRIMARY KEY (id);


--
-- Name: dynasty dynasty_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dynasty
    ADD CONSTRAINT dynasty_name_key UNIQUE (name);


--
-- Name: dynasty dynasty_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dynasty
    ADD CONSTRAINT dynasty_pkey PRIMARY KEY (id);


--
-- Name: epoch epoch_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.epoch
    ADD CONSTRAINT epoch_pkey PRIMARY KEY (id);


--
-- Name: honorific honorific_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.honorific
    ADD CONSTRAINT honorific_pkey PRIMARY KEY (id);


--
-- Name: i18n i18n_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.i18n
    ADD CONSTRAINT i18n_pkey PRIMARY KEY (id);


--
-- Name: internal_notes_plain_text internal_notes_plain_text_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.internal_notes_plain_text
    ADD CONSTRAINT internal_notes_plain_text_type_key UNIQUE (type);


--
-- Name: issuer issuer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issuer
    ADD CONSTRAINT issuer_pkey PRIMARY KEY (id);


--
-- Name: material_color material_color_material_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_color
    ADD CONSTRAINT material_color_material_key UNIQUE (material);


--
-- Name: material material_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material
    ADD CONSTRAINT material_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: mint mint_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mint
    ADD CONSTRAINT mint_pkey PRIMARY KEY (id);


--
-- Name: mint_region mint_region_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mint_region
    ADD CONSTRAINT mint_region_pkey PRIMARY KEY (id);


--
-- Name: nominal nominal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nominal
    ADD CONSTRAINT nominal_pkey PRIMARY KEY (id);


--
-- Name: note note_property_property_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.note
    ADD CONSTRAINT note_property_property_id_key UNIQUE (property, property_id);


--
-- Name: comment notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT notes_pkey PRIMARY KEY (id);


--
-- Name: comment notes_text_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT notes_text_key UNIQUE (text);


--
-- Name: overlord overlord_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.overlord
    ADD CONSTRAINT overlord_pkey PRIMARY KEY (id);


--
-- Name: person_color person_color_person_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.person_color
    ADD CONSTRAINT person_color_person_key UNIQUE (person);


--
-- Name: person_explorer_custom_sorting person_explorer_custom_sorting_person_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.person_explorer_custom_sorting
    ADD CONSTRAINT person_explorer_custom_sorting_person_key UNIQUE (person);


--
-- Name: person person_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.person
    ADD CONSTRAINT person_pkey PRIMARY KEY (id);


--
-- Name: person_role person_role_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.person_role
    ADD CONSTRAINT person_role_name_key UNIQUE (name);


--
-- Name: person_role person_role_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.person_role
    ADD CONSTRAINT person_role_pkey PRIMARY KEY (id);


--
-- Name: piece piece_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.piece
    ADD CONSTRAINT piece_pkey PRIMARY KEY (id);


--
-- Name: province province_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.province
    ADD CONSTRAINT province_name_key UNIQUE (name);


--
-- Name: province province_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.province
    ADD CONSTRAINT province_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: title title_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.title
    ADD CONSTRAINT title_pkey PRIMARY KEY (id);


--
-- Name: treasure_item treasure_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.treasure_item
    ADD CONSTRAINT treasure_item_pkey PRIMARY KEY (id);


--
-- Name: treasure treasure_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.treasure
    ADD CONSTRAINT treasure_pkey PRIMARY KEY (id);


--
-- Name: type_completed type_completed_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.type_completed
    ADD CONSTRAINT type_completed_type_key UNIQUE (type);


--
-- Name: type type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.type
    ADD CONSTRAINT type_pkey PRIMARY KEY (id);


--
-- Name: type type_project_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.type
    ADD CONSTRAINT type_project_id_key UNIQUE (project_id);


--
-- Name: type_reviewed type_reviewed_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.type_reviewed
    ADD CONSTRAINT type_reviewed_type_key UNIQUE (type);


--
-- Name: web_page_block web_page_block_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_page_block
    ADD CONSTRAINT web_page_block_pkey PRIMARY KEY (id);


--
-- Name: web_page_group web_page_group_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_page_group
    ADD CONSTRAINT web_page_group_pkey PRIMARY KEY (id);


--
-- Name: web_page_image web_page_image_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_page_image
    ADD CONSTRAINT web_page_image_pkey PRIMARY KEY (id);


--
-- Name: web_page web_page_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_page
    ADD CONSTRAINT web_page_pkey PRIMARY KEY (id);


--
-- Name: idx_search_vectors; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_search_vectors ON public.type USING gin (search_vectors);


--
-- Name: app_user_privilege app_user_privilege_app_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_user_privilege
    ADD CONSTRAINT app_user_privilege_app_user_fkey FOREIGN KEY (app_user) REFERENCES public.app_user(id);


--
-- Name: type_coin_marks cmt_coin_mark_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.type_coin_marks
    ADD CONSTRAINT cmt_coin_mark_fk FOREIGN KEY (coin_mark) REFERENCES public.coin_marks(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: type_coin_marks cmt_type_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.type_coin_marks
    ADD CONSTRAINT cmt_type_fk FOREIGN KEY (type) REFERENCES public.type(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: mint fk_province; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mint
    ADD CONSTRAINT fk_province FOREIGN KEY (province) REFERENCES public.province(id);


--
-- Name: i18n i18n_parent_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.i18n
    ADD CONSTRAINT i18n_parent_fkey FOREIGN KEY (parent) REFERENCES public.settings(id);


--
-- Name: issuer_honorifics ih_honorific_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issuer_honorifics
    ADD CONSTRAINT ih_honorific_fk FOREIGN KEY (honorific) REFERENCES public.honorific(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: issuer_honorifics ih_issuer_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issuer_honorifics
    ADD CONSTRAINT ih_issuer_fk FOREIGN KEY (issuer) REFERENCES public.issuer(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: internal_notes_plain_text internal_notes_plain_text_type_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.internal_notes_plain_text
    ADD CONSTRAINT internal_notes_plain_text_type_fkey FOREIGN KEY (type) REFERENCES public.type(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: issuer issuer_person_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issuer
    ADD CONSTRAINT issuer_person_fk FOREIGN KEY (person) REFERENCES public.person(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: issuer issuer_type_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issuer
    ADD CONSTRAINT issuer_type_fk FOREIGN KEY (type) REFERENCES public.type(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: issuer_titles it_issuer_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issuer_titles
    ADD CONSTRAINT it_issuer_fk FOREIGN KEY (issuer) REFERENCES public.issuer(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: issuer_titles it_title_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issuer_titles
    ADD CONSTRAINT it_title_fk FOREIGN KEY (title) REFERENCES public.title(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: material_color material_color_material_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_color
    ADD CONSTRAINT material_color_material_fkey FOREIGN KEY (material) REFERENCES public.material(id) ON DELETE CASCADE;


--
-- Name: overlord_honorifics oh_honorific_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.overlord_honorifics
    ADD CONSTRAINT oh_honorific_fk FOREIGN KEY (honorific_id) REFERENCES public.honorific(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: overlord_honorifics oh_overlord_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.overlord_honorifics
    ADD CONSTRAINT oh_overlord_fk FOREIGN KEY (overlord_id) REFERENCES public.overlord(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: other_person other_person_person_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.other_person
    ADD CONSTRAINT other_person_person_fk FOREIGN KEY (person) REFERENCES public.person(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: other_person other_person_type_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.other_person
    ADD CONSTRAINT other_person_type_fk FOREIGN KEY (type) REFERENCES public.type(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: overlord_titles overlord_honorific_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.overlord_titles
    ADD CONSTRAINT overlord_honorific_fk FOREIGN KEY (title_id) REFERENCES public.title(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: overlord overlord_person_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.overlord
    ADD CONSTRAINT overlord_person_fk FOREIGN KEY (person) REFERENCES public.person(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: overlord_titles overlord_title_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.overlord_titles
    ADD CONSTRAINT overlord_title_fk FOREIGN KEY (overlord_id) REFERENCES public.overlord(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: overlord overlord_type_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.overlord
    ADD CONSTRAINT overlord_type_fk FOREIGN KEY (type) REFERENCES public.type(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: person_color person_color_person_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.person_color
    ADD CONSTRAINT person_color_person_fkey FOREIGN KEY (person) REFERENCES public.person(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: person person_dynasty_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.person
    ADD CONSTRAINT person_dynasty_fk FOREIGN KEY (dynasty) REFERENCES public.dynasty(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: person_explorer_custom_sorting person_explorer_custom_sorting_person_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.person_explorer_custom_sorting
    ADD CONSTRAINT person_explorer_custom_sorting_person_fkey FOREIGN KEY (person) REFERENCES public.person(id);


--
-- Name: person person_role_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.person
    ADD CONSTRAINT person_role_fk FOREIGN KEY (role) REFERENCES public.person_role(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: piece piece_type_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.piece
    ADD CONSTRAINT piece_type_fk FOREIGN KEY (type) REFERENCES public.type(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: settings settings_parent_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_parent_fkey FOREIGN KEY (parent) REFERENCES public.settings(id);


--
-- Name: treasure_item treasure_item_epoch_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.treasure_item
    ADD CONSTRAINT treasure_item_epoch_fkey FOREIGN KEY (epoch) REFERENCES public.epoch(id);


--
-- Name: treasure_item treasure_item_material_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.treasure_item
    ADD CONSTRAINT treasure_item_material_fkey FOREIGN KEY (material) REFERENCES public.material(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: treasure_item treasure_item_mint_region_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.treasure_item
    ADD CONSTRAINT treasure_item_mint_region_fkey FOREIGN KEY (mint_region) REFERENCES public.mint_region(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: treasure_item treasure_item_mint_region_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.treasure_item
    ADD CONSTRAINT treasure_item_mint_region_fkey1 FOREIGN KEY (mint_region) REFERENCES public.mint_region(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: treasure_item treasure_item_nominal_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.treasure_item
    ADD CONSTRAINT treasure_item_nominal_fkey FOREIGN KEY (nominal) REFERENCES public.nominal(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: treasure_item treasure_item_treasure_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.treasure_item
    ADD CONSTRAINT treasure_item_treasure_fkey FOREIGN KEY (treasure) REFERENCES public.treasure(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: type_coin_verse type_coin_verse_coin_verse_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.type_coin_verse
    ADD CONSTRAINT type_coin_verse_coin_verse_fkey FOREIGN KEY (coin_verse) REFERENCES public.coin_verse(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: type_coin_verse type_coin_verse_type_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.type_coin_verse
    ADD CONSTRAINT type_coin_verse_type_fkey FOREIGN KEY (type) REFERENCES public.type(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: type_completed type_completed_type_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.type_completed
    ADD CONSTRAINT type_completed_type_id_fk FOREIGN KEY (type) REFERENCES public.type(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: type type_material_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.type
    ADD CONSTRAINT type_material_fk FOREIGN KEY (material) REFERENCES public.material(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: type type_mint_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.type
    ADD CONSTRAINT type_mint_fk FOREIGN KEY (mint) REFERENCES public.mint(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: type type_nominal_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.type
    ADD CONSTRAINT type_nominal_fk FOREIGN KEY (nominal) REFERENCES public.nominal(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: type type_person_caliph_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.type
    ADD CONSTRAINT type_person_caliph_fk FOREIGN KEY (caliph) REFERENCES public.person(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: type_reviewed type_reviewed_type_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.type_reviewed
    ADD CONSTRAINT type_reviewed_type_id_fk FOREIGN KEY (type) REFERENCES public.type(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: web_page web_page_author_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_page
    ADD CONSTRAINT web_page_author_fkey FOREIGN KEY (author) REFERENCES public.app_user(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: web_page_block web_page_block_image_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_page_block
    ADD CONSTRAINT web_page_block_image_fkey FOREIGN KEY (image) REFERENCES public.web_page_image(id);


--
-- Name: web_page_block web_page_block_page_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_page_block
    ADD CONSTRAINT web_page_block_page_fkey FOREIGN KEY (page) REFERENCES public.web_page(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: web_page_block web_page_block_parent_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_page_block
    ADD CONSTRAINT web_page_block_parent_fkey FOREIGN KEY (parent) REFERENCES public.web_page_block(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: web_page web_page_image_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_page
    ADD CONSTRAINT web_page_image_fkey FOREIGN KEY (image) REFERENCES public.web_page_image(id);


--
-- Name: web_page web_page_page_group_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_page
    ADD CONSTRAINT web_page_page_group_fkey FOREIGN KEY (page_group) REFERENCES public.web_page_group(id);


--
-- PostgreSQL database dump complete
--

