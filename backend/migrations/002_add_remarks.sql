-- Add foreign key constraint for material_color.material -> material.id with CASCADE DELETE
-- This ensures that when a material is deleted, its color entry is automatically deleted too

ALTER TABLE ONLY public.treasure_item 
    ADD COLUMN remarks TEXT,
    ADD COLUMN remarks_to_coin_type_reference TEXT;