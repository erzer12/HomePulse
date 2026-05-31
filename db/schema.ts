import type * as SQLite from "expo-sqlite";

export async function initDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
	await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age_group TEXT NOT NULL,
      age_months INTEGER,
      chronic_conditions TEXT NOT NULL DEFAULT '[]',
      allergies TEXT NOT NULL DEFAULT '[]',
      medications TEXT NOT NULL DEFAULT '[]',
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL REFERENCES patients(id),
      status TEXT NOT NULL DEFAULT 'active',
      current_action_state INTEGER,
      started_at INTEGER NOT NULL,
      last_evaluated_at INTEGER,
      share_token TEXT UNIQUE,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    );

    CREATE TABLE IF NOT EXISTS symptom_entries (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL REFERENCES cases(id),
      timestamp INTEGER NOT NULL,
      category TEXT NOT NULL,
      duration_hours REAL NOT NULL,
      temperature_celsius REAL,
      spo2_percent REAL,
      hydration_status TEXT NOT NULL DEFAULT 'normal',
      consciousness TEXT NOT NULL DEFAULT 'alert',
      breathing_difficulty INTEGER NOT NULL DEFAULT 0,
      raw_inputs TEXT NOT NULL DEFAULT '{}',
      triage_output TEXT
    );

    CREATE TABLE IF NOT EXISTS household_snapshots (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL REFERENCES cases(id),
      timestamp INTEGER NOT NULL,
      has_thermometer INTEGER NOT NULL DEFAULT 0,
      has_oximeter INTEGER NOT NULL DEFAULT 0,
      transport_available INTEGER NOT NULL DEFAULT 1,
      pharmacy_distance_km REAL NOT NULL DEFAULT 0,
      overnight_caregiver INTEGER NOT NULL DEFAULT 1,
      medicine_stock INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS caregiver_tasks (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL REFERENCES cases(id),
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      assigned_to TEXT,
      due_at INTEGER,
      completed_at INTEGER,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      synced_at INTEGER
    );
  `);
}
