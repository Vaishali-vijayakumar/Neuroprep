// NeuroPrep Local Database Emulator
// Persistent local relational-style database layer

const STORAGE_KEYS = {
  PROFILES: 'neuroprep_db_profiles',
  USERS: 'neuroprep_registered_users',
  MOOD_LOGS: 'neuroprep_db_mood_logs',
  THOUGHT_JOURNALS: 'neuroprep_db_thought_journals',
  CBT_REAPPRAISALS: 'neuroprep_db_cbt_reappraisals',
  MOCK_INTERVIEWS: 'neuroprep_db_mock_interviews',
  CODING_SUBMISSIONS: 'neuroprep_db_coding_submissions',
  READINESS_SCORES: 'neuroprep_db_readiness_scores',
  APTITUDE_ATTEMPTS: 'neuroprep_db_aptitude_mock_attempts'
};

function getLocalTable(key, initialDefault = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initialDefault));
      return initialDefault;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading local db key ${key}:`, e);
    return initialDefault;
  }
}

function setLocalTable(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing local db key ${key}:`, e);
  }
}

class SupabaseTableQuery {
  constructor(tableName) {
    this.tableName = tableName;
    this.storageKey = STORAGE_KEYS[tableName.toUpperCase()] || `neuroprep_db_${tableName}`;
    this.data = getLocalTable(this.storageKey, []);
  }

  async select(columns = '*') {
    return { data: this.data, error: null };
  }

  async insert(records) {
    const items = Array.isArray(records) ? records : [records];
    const created = items.map(item => ({
      id: item.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
      created_at: new Date().toISOString(),
      ...item
    }));

    const updatedTable = [...created, ...this.data];
    setLocalTable(this.storageKey, updatedTable);
    return { data: created, error: null };
  }

  async update(updates) {
    const updatedTable = this.data.map(row => {
      if (row.id === updates.id) {
        return { ...row, ...updates, updated_at: new Date().toISOString() };
      }
      return row;
    });
    setLocalTable(this.storageKey, updatedTable);
    return { data: updates, error: null };
  }

  async upsert(record) {
    const existingIdx = this.data.findIndex(r => r.id === record.id || r.email === record.email);
    let updatedTable = [...this.data];
    
    if (existingIdx >= 0) {
      updatedTable[existingIdx] = { ...updatedTable[existingIdx], ...record, updated_at: new Date().toISOString() };
    } else {
      updatedTable.unshift({
        id: record.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
        created_at: new Date().toISOString(),
        ...record
      });
    }

    setLocalTable(this.storageKey, updatedTable);
    return { data: record, error: null };
  }
}

export const localDb = {
  from(tableName) {
    return new SupabaseTableQuery(tableName);
  },
  
  exportDatabaseDump() {
    const dump = {};
    Object.keys(STORAGE_KEYS).forEach(k => {
      dump[k] = getLocalTable(STORAGE_KEYS[k], []);
    });
    return dump;
  }
};
