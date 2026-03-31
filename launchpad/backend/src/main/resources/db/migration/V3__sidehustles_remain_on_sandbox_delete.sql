-- Allows sidehustles to remain when a sandbox is deleted
-- Changes the foreign key constraint from CASCADE to SET NULL
-- Makes sandbox_id nullable so sidehustles can exist without a parent sandbox

ALTER TABLE side_hustles ALTER COLUMN sandbox_id DROP NOT NULL;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'side_hustles_sandbox_id_fkey'
    ) THEN
        ALTER TABLE side_hustles DROP CONSTRAINT side_hustles_sandbox_id_fkey;
    END IF;

    ALTER TABLE side_hustles
        ADD CONSTRAINT side_hustles_sandbox_id_fkey
        FOREIGN KEY (sandbox_id)
        REFERENCES sandboxes(id)
        ON DELETE SET NULL;
END $$;
