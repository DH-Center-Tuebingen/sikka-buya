ALTER TABLE ONLY public.treasure_item
    ADD COLUMN IF NOT EXISTS year_of_mint_from INT;

ALTER TABLE ONLY public.treasure_item
    ADD COLUMN IF NOT EXISTS year_of_mint_to INT;
