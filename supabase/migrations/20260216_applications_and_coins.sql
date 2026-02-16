-- Applications table: tracks user job applications
CREATE TABLE IF NOT EXISTS applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id text NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
  wallet_address text NOT NULL,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'applied')),
  applicant_name text,
  applicant_age text,
  applicant_availability text,
  applicant_girth_size text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(job_id, wallet_address)
);

-- Coin launches table: pending coins generated on apply
CREATE TABLE IF NOT EXISTS coin_launches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  job_id text NOT NULL,
  wallet_address text NOT NULL,
  coin_name text NOT NULL,
  coin_phrase text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  contract_address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_launches ENABLE ROW LEVEL SECURITY;

-- Applications: anyone can insert/read (anon key)
CREATE POLICY "Anyone can insert applications" ON applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read applications" ON applications FOR SELECT USING (true);
CREATE POLICY "Anyone can update own applications" ON applications FOR UPDATE USING (true);

-- Coin launches: anyone can read, insert
CREATE POLICY "Anyone can read coin_launches" ON coin_launches FOR SELECT USING (true);
CREATE POLICY "Anyone can insert coin_launches" ON coin_launches FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update coin_launches" ON coin_launches FOR UPDATE USING (true);
