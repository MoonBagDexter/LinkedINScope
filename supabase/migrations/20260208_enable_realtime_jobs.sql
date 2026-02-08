-- Enable Supabase Realtime on the jobs table
-- Required for postgres_changes subscription (INSERT events for new job sync)
ALTER PUBLICATION supabase_realtime ADD TABLE jobs;
