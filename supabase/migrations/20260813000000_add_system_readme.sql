ALTER TABLE public.systems
    ADD COLUMN readme text;

UPDATE public.systems
SET description = ''
WHERE description IS NULL;

ALTER TABLE public.systems
    ALTER COLUMN description SET NOT NULL,
    ADD CONSTRAINT systems_description_length CHECK (char_length(description) <= 250),
    ADD CONSTRAINT systems_readme_length CHECK (readme IS NULL OR char_length(readme) <= 30000);

COMMENT ON COLUMN public.systems.description IS 'Required short description used on preview cards (maximum 250 characters).';
COMMENT ON COLUMN public.systems.readme IS 'Sanitized Markdown documentation (maximum 30,000 characters).';
