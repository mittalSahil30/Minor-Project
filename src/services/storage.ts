import type { User, ChatMessage, JournalEntry, MentalHealthResult } from '../types';

// Keys
const USERS_KEY = 'mindbase_users';
const CURRENT_USER_KEY = 'mindbase_current_user';
const CHATS_KEY = 'mindbase_chats';
const JOURNAL_KEY = 'mindbase_journals';
const RESULTS_KEY = 'mindbase_results';

// Helper to get data
const get = <T>(key: string): T | null => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};

// Helper to set data
const set = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const StorageService = {
  // --- Auth ---
  register: (user: Omit<User, 'id' | 'joinedAt'>): User | null => {
    const users = get<User[]>(USERS_KEY) || [];
    if (users.find(u => u.email === user.email)) return null; // Email exists

    const newUser: User = {
      ...user,
      id: crypto.randomUUID(),
      joinedAt: new Date().toISOString(),
    };
    users.push(newUser);
    set(USERS_KEY, users);
    return newUser;
  },

  login: (email: string, password: string): User | null => {
    const users = get<User[]>(USERS_KEY) || [];
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      set(CURRENT_USER_KEY, user.id);
      
      // Update last login
      const updatedUser = { ...user, lastLogin: new Date().toISOString() };
      const index = users.findIndex(u => u.id === user.id);
      users[index] = updatedUser;
      set(USERS_KEY, users);
      
      return updatedUser;
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const userId = get<string>(CURRENT_USER_KEY);
    if (!userId) return null;
    const users = get<User[]>(USERS_KEY) || [];
    return users.find(u => u.id === userId) || null;
  },

  updateUser: (updatedUser: User) => {
    const users = get<User[]>(USERS_KEY) || [];
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      set(USERS_KEY, users);
    }
  },

  // --- Chat ---
  getChats: (userId: string): ChatMessage[] => {
    const allChats = get<Record<string, ChatMessage[]>>(CHATS_KEY) || {};
    return allChats[userId] || [];
  },

  saveChat: (userId: string, message: ChatMessage) => {
    const allChats = get<Record<string, ChatMessage[]>>(CHATS_KEY) || {};
    const userChats = allChats[userId] || [];
    userChats.push(message);
    allChats[userId] = userChats;
    set(CHATS_KEY, allChats);
  },

  // --- Journal ---
  getJournals: (userId: string): JournalEntry[] => {
    const allJournals = get<Record<string, JournalEntry[]>>(JOURNAL_KEY) || {};
    return allJournals[userId] || [];
  },

  saveJournal: (userId: string, entry: JournalEntry) => {
    const allJournals = get<Record<string, JournalEntry[]>>(JOURNAL_KEY) || {};
    const userJournals = allJournals[userId] || [];
    
    // Check if updating
    const existingIndex = userJournals.findIndex(j => j.id === entry.id);
    if (existingIndex !== -1) {
      userJournals[existingIndex] = entry;
    } else {
      userJournals.unshift(entry); // Newest first
    }
    
    allJournals[userId] = userJournals;
    set(JOURNAL_KEY, allJournals);
  },

  // --- Tests ---
  saveTestResult: (userId: string, result: MentalHealthResult) => {
    const allResults = get<Record<string, MentalHealthResult[]>>(RESULTS_KEY) || {};
    const userResults = allResults[userId] || [];
    userResults.push(result);
    allResults[userId] = userResults;
    set(RESULTS_KEY, allResults);
  },

  getTestResults: (userId: string): MentalHealthResult[] => {
    const allResults = get<Record<string, MentalHealthResult[]>>(RESULTS_KEY) || {};
    return allResults[userId] || [];
  },

  // --- Persistence / Backup ---
  createBackup: (): string => {
    const data = {
      users: get(USERS_KEY),
      currentUser: get(CURRENT_USER_KEY),
      chats: get(CHATS_KEY),
      journals: get(JOURNAL_KEY),
      results: get(RESULTS_KEY),
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  },

  restoreBackup: (json: string): boolean => {
    try {
      const data = JSON.parse(json);
      // Basic validation
      if (!data.timestamp) throw new Error("Invalid backup file");

      if (data.users) set(USERS_KEY, data.users);
      if (data.currentUser) set(CURRENT_USER_KEY, data.currentUser);
      if (data.chats) set(CHATS_KEY, data.chats);
      if (data.journals) set(JOURNAL_KEY, data.journals);
      if (data.results) set(RESULTS_KEY, data.results);
      return true;
    } catch (e) {
      console.error("Restore failed", e);
      return false;
    }
  }
};