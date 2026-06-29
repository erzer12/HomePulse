# Supabase Cloud Database Setup

To enable caregiver link sharing and real-time task coordination, you must configure the following tables in your Supabase project.

---

## 1. SQL Schema Setup Script

Run the following SQL script inside the **SQL Editor** of your Supabase Dashboard:

```sql
-- 1. Create case_summaries Table
CREATE TABLE IF NOT EXISTS public.case_summaries (
    token TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    triage_level INTEGER NOT NULL,
    patient_name TEXT NOT NULL DEFAULT 'Family Member',
    action_title TEXT,
    recheck_interval_minutes INTEGER,
    summary_text TEXT,
    tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at BIGINT NOT NULL,
    expires_at BIGINT NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT false
);

-- Index for expiring summaries
CREATE INDEX IF NOT EXISTS idx_case_summaries_expires_at ON public.case_summaries(expires_at);

-- 2. Create tasks Table (For real-time status updates)
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL CHECK (status IN ('pending', 'done')),
    completed_at BIGINT
);

-- 3. Configure Row Level Security (RLS)
-- For the demo and direct client inserts/reads, enable public anonymous access.
-- Adjust these policies if you integrate proper authentication.

ALTER TABLE public.case_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- case_summaries policies
CREATE POLICY "Allow public select of case_summaries"
ON public.case_summaries FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow public insert/upsert of case_summaries"
ON public.case_summaries FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- tasks policies
CREATE POLICY "Allow public select of tasks"
ON public.tasks FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow public update of tasks"
ON public.tasks FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- 4. Create RPC Function for Atomic Task Status Updates
-- This function runs inside Supabase to update the tasks table and case_summaries
-- snapshot atomically, preventing lost-update concurrency races between multiple caregivers.
CREATE OR REPLACE FUNCTION public.update_task_status_atomic(
    p_task_id TEXT,
    p_status TEXT,
    p_completed_at BIGINT
) RETURNS VOID AS $$
DECLARE
    r RECORD;
    v_tasks JSONB;
    v_updated_tasks JSONB;
BEGIN
    -- 1. Update the tasks table
    UPDATE public.tasks
    SET status = p_status,
        completed_at = p_completed_at
    WHERE id = p_task_id;

    -- 2. Update case_summaries JSONB snapshot atomically
    FOR r IN 
        SELECT token, tasks 
        FROM public.case_summaries 
        WHERE tasks @> jsonb_build_array(jsonb_build_object('id', p_task_id)) 
    LOOP
        SELECT jsonb_agg(
            CASE 
                WHEN (elem->>'id') = p_task_id THEN 
                    jsonb_set(
                        jsonb_set(elem, '{status}', to_jsonb(p_status)),
                        '{completed_at}', 
                        CASE WHEN p_completed_at IS NULL THEN 'null'::jsonb ELSE to_jsonb(p_completed_at) END
                    )
                ELSE elem 
            END
        ) INTO v_updated_tasks
        FROM jsonb_array_elements(r.tasks) AS elem;

        UPDATE public.case_summaries 
        SET tasks = COALESCE(v_updated_tasks, '[]'::jsonb)
        WHERE token = r.token;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 2. Environment Variables Verification

Ensure that the `.env.local` file contains the correct connection details for your Supabase project:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 3. Data Expiration & Clean-up

The `expires_at` timestamp is calculated as `created_at + 48 hours`. To keep the database clean, you can optionally configure a Supabase pg_cron job or background worker to delete expired rows:

```sql
DELETE FROM public.case_summaries WHERE expires_at < (EXTRACT(EPOCH FROM NOW()) * 1000);
```
