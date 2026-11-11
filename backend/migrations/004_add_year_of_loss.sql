ALTER TABLE ONLY public.treasure
    ADD COLUMN IF NOT EXISTS year_of_loss_from INT;

ALTER TABLE ONLY public.treasure
    ADD COLUMN IF NOT EXISTS year_of_loss_to INT;
