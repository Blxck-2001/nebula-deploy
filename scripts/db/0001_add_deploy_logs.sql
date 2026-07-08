-- Migration: add id and created_at to deploy_logs
BEGIN;
CREATE SEQUENCE IF NOT EXISTS deploy_logs_id_seq;
ALTER TABLE IF EXISTS deploy_logs ADD COLUMN IF NOT EXISTS id bigint;
UPDATE deploy_logs SET id = nextval('deploy_logs_id_seq') WHERE id IS NULL;
ALTER SEQUENCE deploy_logs_id_seq OWNED BY deploy_logs.id;
ALTER TABLE deploy_logs ALTER COLUMN id SET DEFAULT nextval('deploy_logs_id_seq');
ALTER TABLE deploy_logs ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE deploy_logs ADD PRIMARY KEY (id);
COMMIT;
