-- ============================================================
-- PURGE SIMULATED DATA
-- This script removes all seed data but keeps core configuration
-- ============================================================

TRUNCATE TABLE approval_requests CASCADE;
TRUNCATE TABLE tool_events CASCADE;
TRUNCATE TABLE agent_runs CASCADE;
TRUNCATE TABLE created_agents CASCADE;
TRUNCATE TABLE audit_log CASCADE;

-- Optional: If you want to keep your domain profiles and presets, do not truncate them.
-- They are necessary for the UI to function in "Builder" mode.

-- Reset sequences if necessary (PostgreSQL)
-- ALTER SEQUENCE agent_runs_id_seq RESTART WITH 1;
-- ... etc

-- Print confirmation
SELECT 'Database purged of all simulated data. Ready for fresh operations.' as status;
