-- Add foreign key constraint for material_color.material -> material.id with CASCADE DELETE
-- This ensures that when a material is deleted, its color entry is automatically deleted too

ALTER TABLE ONLY public.material_color
    ADD CONSTRAINT material_color_material_fkey 
    FOREIGN KEY (material) 
    REFERENCES public.material(id) 
    ON UPDATE CASCADE 
    ON DELETE CASCADE;
