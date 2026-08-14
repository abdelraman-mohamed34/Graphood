ALTER TABLE public.systems
    ADD COLUMN pending_readme text,
    ADD COLUMN pending_readme_submitted_at timestamptz,
    ADD COLUMN pending_readme_submitted_by uuid REFERENCES public.profiles(id),
    ADD CONSTRAINT systems_pending_readme_length
        CHECK (pending_readme IS NULL OR char_length(pending_readme) <= 30000);

COMMENT ON COLUMN public.systems.pending_readme IS 'Sanitized README draft awaiting platform staff approval.';