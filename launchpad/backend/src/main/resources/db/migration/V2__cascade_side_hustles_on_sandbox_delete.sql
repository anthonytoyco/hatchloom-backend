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
        ON DELETE CASCADE;
END $$;
