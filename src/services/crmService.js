// CRM Service - Unified API and LocalStorage Mock database client
const USE_API = true; // Toggle to true to connect to Spring Boot API endpoints
const API_BASE_URL = '/api/crm';

// Mock Seed Data
const MOCK_USERS = [
  { id: 1, name: 'Sarah Connor', email: 'admin@company.com', role: 'ADMIN', password: 'password', phone: '+966 50 123 4567', department: 'Executive Office', position: 'Administrator', salary: 30000, dateJoined: '2024-01-01' },
  { id: 2, name: 'James Carter', email: 'manager@company.com', role: 'MANAGER', password: 'password', phone: '+966 50 234 5678', department: 'Sales Management', position: 'Sales Director', salary: 15000, dateJoined: '2025-01-15' },
  { id: 3, name: 'Alia Bhatt', email: 'hr@company.com', role: 'HR', password: 'password', phone: '+966 50 345 6789', department: 'Human Resources', position: 'HR Lead', salary: 10000, dateJoined: '2025-06-01' },
  { id: 4, name: 'John Doe', email: 'executive@company.com', role: 'EXECUTIVE', password: 'password', phone: '+966 50 456 7890', department: 'Sales Execution', managerId: 2, position: 'Account Manager', salary: 8000, dateJoined: '2026-02-15' },
  { id: 5, name: 'Jane Smith', email: 'jane@company.com', role: 'EXECUTIVE', password: 'password', phone: '+966 50 567 8901', department: 'Sales Execution', managerId: 2, position: 'Account Representative', salary: 7500, dateJoined: '2026-04-10' }
];

const MOCK_LEADS = [
  { id: 1, customerName: 'Saudi Aramco', source: 'Website', status: 'New', email: 'info@aramco.com.sa', phone: '+966 13 874 0000', notes: 'Interested in enterprise cloud migration.', userId: 4, value: 450000, dateAdded: '2026-05-15', college: 'King Saud University', passoutYear: 2026, department: 'Computer Science' },
  { id: 2, customerName: 'NEOM Tech Division', source: 'Referral', status: 'Interested to Buy', email: 'contact@neom.gov.sa', phone: '+966 11 549 1111', notes: 'Requested quotation for smart city integration.', userId: 4, value: 1200000, dateAdded: '2026-05-18', college: 'KAUST', passoutYear: 2025, department: 'Electrical Engineering' },
  { id: 3, customerName: 'Riyadh Bank', source: 'Cold Call', status: 'Contacted', email: 'procurement@riyadhbank.com', phone: '+966 11 401 3030', notes: 'Spoke with CFO. Follow up on Tuesday.', userId: 5, value: 350000, dateAdded: '2026-05-20', college: 'King Abdulaziz University', passoutYear: 2026, department: 'Finance' },
  { id: 4, customerName: 'SABIC Industrial', source: 'LinkedIn', status: 'Closed Won', email: 'sales@sabic.com', phone: '+966 11 225 1000', notes: 'Deal finalized and contract signed.', userId: 4, value: 650000, dateAdded: '2026-05-02', closedDate: '2026-05-25', college: 'King Fahd University', passoutYear: 2024, department: 'Chemical Engineering' },
  { id: 5, customerName: 'STC Telecom', source: 'Website', status: 'Closed Lost', email: 'partner@stc.com.sa', phone: '+966 11 452 7000', notes: 'Opted for internal solutions due to budget.', userId: 5, value: 500000, dateAdded: '2026-04-10', closedDate: '2026-05-12', college: 'King Saud University', passoutYear: 2025, department: 'Information Systems' }
];

const MOCK_TASKS = [
  { id: 1, title: 'Upload monthly sales pitch', description: 'Review the updated Q2 presentation decks and upload to storage.', dueDate: '2026-06-10', status: 'Pending', assignedTo: 4, assignedBy: 2 },
  { id: 2, title: 'Call NEOM Procurement', description: 'Confirm receipt of proposal #8892 and address open inquiries.', dueDate: '2026-06-08', status: 'Pending', assignedTo: 4, assignedBy: 2 },
  { id: 3, title: 'Conduct HR onboarding survey', description: 'Coordinate with new executive onboarding checklists.', dueDate: '2026-06-15', status: 'Pending', assignedTo: 3, assignedBy: 1 },
  { id: 4, title: 'Review Sales Pipeline report', description: 'Prepare performance analytics presentation for Sarah.', dueDate: '2026-06-05', status: 'Completed', assignedTo: 2, assignedBy: 1 }
];

const MOCK_LEAVES = [
  { id: 1, requesterId: 4, requesterName: 'John Doe', role: 'EXECUTIVE', startDate: '2026-06-18', endDate: '2026-06-22', reason: 'Family vacation', status: 'Pending' },
  { id: 2, requesterId: 3, requesterName: 'Alia Bhatt', role: 'HR', startDate: '2026-06-25', endDate: '2026-06-26', reason: 'Medical appointment', status: 'Approved' },
  { id: 3, requesterId: 5, requesterName: 'Jane Smith', role: 'EXECUTIVE', startDate: '2026-07-01', endDate: '2026-07-05', reason: 'Personal leave', status: 'Rejected' }
];

const MOCK_TRANSACTIONS = [
  { id: 1, transactionDate: '2026-06-01', description: 'Client Consulting Retainer', category: 'Consultancy', currency: 'INR', baseAmount: 250000.00, vatAmount: 37500.00, totalAmount: 287500.00, type: 'INCOME', exchangeRate: 1.0 },
  { id: 2, transactionDate: '2026-06-02', description: 'HQ Office Rental', category: 'Rent', currency: 'INR', baseAmount: 45000.00, vatAmount: 6750.00, totalAmount: 51750.00, type: 'EXPENSE', exchangeRate: 1.0 },
  { id: 3, transactionDate: '2026-06-03', description: 'Cloud Services (AWS)', category: 'Utilities', currency: 'AED', baseAmount: 12000.00, vatAmount: 600.00, totalAmount: 12600.00, type: 'EXPENSE', exchangeRate: 1.02 }
];

const MOCK_ATTENDANCE = [
  { id: 1, userId: 4, name: 'John Doe', role: 'EXECUTIVE', date: '2026-06-05', checkIn: '08:30 AM', checkOut: '05:30 PM', hours: 9.0 },
  { id: 2, userId: 3, name: 'Alia Bhatt', role: 'HR', date: '2026-06-05', checkIn: '09:00 AM', checkOut: '06:00 PM', hours: 9.0 },
  { id: 3, userId: 2, name: 'James Carter', role: 'MANAGER', date: '2026-06-05', checkIn: '08:45 AM', checkOut: '05:15 PM', hours: 8.5 }
];

const MOCK_CALLS = [
  { id: 1, customerName: 'Saudi Aramco', customerPhone: '+966 13 874 0000', direction: 'INBOUND', startTime: '2026-06-05T10:30:00', durationSeconds: 120, status: 'ANSWERED', recordingUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', transcription: 'Spoke with engineer about cloud database deployment scheduling. Follow up set.', agentId: 4, agentName: 'John Doe', simUsed: 'Mobile Imported SIM' },
  { id: 2, customerName: 'NEOM Tech Division', customerPhone: '+966 11 549 1111', direction: 'OUTBOUND', startTime: '2026-06-05T11:15:00', durationSeconds: 45, status: 'MISSED', recordingUrl: '', transcription: 'Call rang out. Customer did not pick up.', agentId: 4, agentName: 'John Doe', simUsed: 'Corporate VoIP' },
  { id: 3, customerName: 'Riyadh Bank', customerPhone: '+966 11 401 3030', direction: 'OUTBOUND', startTime: '2026-06-05T14:20:00', durationSeconds: 3200, status: 'ANSWERED', recordingUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', transcription: 'Detailed walkthrough of the premium CRM dashboards and custom reports logic with CFO.', agentId: 5, agentName: 'Jane Smith', simUsed: 'Mobile Imported SIM' }
];

// LocalStorage Helper functions
const getStorageItem = (key, defaultValue) => {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(item);
};

const setStorageItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const crmService = {
  // Initialize Database
  async init() {
    // Check if the crm_users stored in localStorage contains the correct seed users and passwords
    const storedUsers = localStorage.getItem('crm_users');
    let needsReset = false;
    if (storedUsers) {
      try {
        const parsed = JSON.parse(storedUsers);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          needsReset = true;
        } else {
          // Verify key mock users exist and have correct passwords
          MOCK_USERS.forEach(mockUser => {
            const match = parsed.find(u => u.email.trim().toLowerCase() === mockUser.email.toLowerCase());
            if (!match || match.password !== mockUser.password) {
              needsReset = true;
            }
          });
        }
      } catch (e) {
        needsReset = true;
      }
    } else {
      needsReset = true;
    }

    if (needsReset) {
      localStorage.setItem('crm_users', JSON.stringify(MOCK_USERS));
      localStorage.setItem('crm_leads', JSON.stringify(MOCK_LEADS));
      localStorage.setItem('crm_tasks', JSON.stringify(MOCK_TASKS));
      localStorage.setItem('crm_leaves', JSON.stringify(MOCK_LEAVES));
      localStorage.setItem('crm_transactions', JSON.stringify(MOCK_TRANSACTIONS));
      localStorage.setItem('crm_attendance', JSON.stringify(MOCK_ATTENDANCE));
      localStorage.setItem('crm_calls', JSON.stringify(MOCK_CALLS));
    } else {
      getStorageItem('crm_users', MOCK_USERS);
      getStorageItem('crm_leads', MOCK_LEADS);
      getStorageItem('crm_tasks', MOCK_TASKS);
      getStorageItem('crm_leaves', MOCK_LEAVES);
      getStorageItem('crm_transactions', MOCK_TRANSACTIONS);
      getStorageItem('crm_attendance', MOCK_ATTENDANCE);
      getStorageItem('crm_calls', MOCK_CALLS);
    }

    if (USE_API) {
      try {
        const [dbUsers, dbLeads, dbTasks, dbLeaves, dbTxs, dbAtt, dbCalls] = await Promise.all([
          fetch('/api/admin/users').then(res => {
            if (res.ok) return res.json();
            throw new Error('Failed to fetch users');
          }),
          fetch('/api/crm/leads').then(res => {
            if (res.ok) return res.json();
            throw new Error('Failed to fetch leads');
          }),
          fetch('/api/crm/tasks').then(res => {
            if (res.ok) return res.json();
            throw new Error('Failed to fetch tasks');
          }),
          fetch('/api/crm/leaves').then(res => {
            if (res.ok) return res.json();
            throw new Error('Failed to fetch leaves');
          }),
          fetch('/api/crm/transactions').then(res => {
            if (res.ok) return res.json();
            throw new Error('Failed to fetch transactions');
          }),
          fetch('/api/crm/attendance').then(res => {
            if (res.ok) return res.json();
            throw new Error('Failed to fetch attendance');
          }),
          fetch('/api/crm/calls').then(res => {
            if (res.ok) return res.json();
            throw new Error('Failed to fetch calls');
          })
        ]);

        const mappedUsers = dbUsers.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          password: u.password,
          role: u.role,
          position: u.position,
          salary: u.salary,
          dateJoined: u.dateOfJoining,
          phone: u.phone || '+966 50 000 0000',
          department: u.role === 'HR' ? 'Human Resources' : u.role === 'MANAGER' ? 'Sales Management' : 'Sales Execution',
          managerId: u.manager ? u.manager.id : null
        }));

        localStorage.setItem('crm_users', JSON.stringify(mappedUsers));
        localStorage.setItem('crm_leads', JSON.stringify(dbLeads));
        localStorage.setItem('crm_tasks', JSON.stringify(dbTasks));
        localStorage.setItem('crm_leaves', JSON.stringify(dbLeaves));
        localStorage.setItem('crm_transactions', JSON.stringify(dbTxs));
        localStorage.setItem('crm_attendance', JSON.stringify(dbAtt));
        localStorage.setItem('crm_calls', JSON.stringify(dbCalls));
      } catch (err) {
        console.error("Error loading CRM data from DB:", err);
      }
    }
  },

  // Auth Operations
  async login(email, password) {
    if (USE_API) {
      // Direct REST Endpoint Integration
      const response = await fetch(`${API_BASE_URL.replace('/api/crm', '')}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, password })
      });
      if (!response.ok) throw new Error('Invalid credentials');
      return await response.json();
    } else {
      const cleanEmail = email.trim().toLowerCase();
      const users = getStorageItem('crm_users', MOCK_USERS);
      const user = users.find(u => u.email.trim().toLowerCase() === cleanEmail && u.password === password);
      if (!user) throw new Error('Invalid email or password');

      // Auto-record login logs
      this.recordAttendance(user.id, 'checkin');
      return user;
    }
  },

  async logout(user) {
    if (user) {
      this.recordAttendance(user.id, 'checkout');
    }
    return true;
  },

  // User Operations
  getUsers() {
    return getStorageItem('crm_users', MOCK_USERS);
  },

  async addUser(user) {
    if (USE_API) {
      const response = await fetch('/api/admin/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to add user');
      }
      const savedUser = await response.json();
      const mappedUser = {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        password: savedUser.password,
        role: savedUser.role,
        position: savedUser.position,
        salary: savedUser.salary,
        dateJoined: savedUser.dateOfJoining,
        phone: user.phone || '+966 50 000 0000',
        department: savedUser.role === 'HR' ? 'Human Resources' : savedUser.role === 'MANAGER' ? 'Sales Management' : 'Sales Execution',
        managerId: savedUser.manager ? savedUser.manager.id : user.managerId
      };

      const users = this.getUsers();
      users.push(mappedUser);
      localStorage.setItem('crm_users', JSON.stringify(users));
      return mappedUser;
    } else {
      const users = this.getUsers();
      const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
      const newUser = { id: newId, ...user };
      users.push(newUser);
      localStorage.setItem('crm_users', JSON.stringify(users));
      return newUser;
    }
  },

  async updateUserProfile(userId, updatedProfile) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === parseInt(userId));
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedProfile };
      setStorageItem('crm_users', users);

      if (USE_API) {
        try {
          const payload = { id: userId, ...updatedProfile };
          await fetch('/api/crm/users/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } catch (err) {
          console.error("Error updating user profile in DB:", err);
        }
      }
      return users[index];
    }
    return null;
  },

  async deleteUser(userId) {
    let users = this.getUsers();
    users = users.filter(u => u.id !== parseInt(userId));
    setStorageItem('crm_users', users);

    if (USE_API) {
      try {
        await fetch(`/api/crm/admin/users/${userId}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.error("Error deleting user in DB:", err);
      }
    }

    return true;
  },

  // Lead Operations
  getLeads() {
    return getStorageItem('crm_leads', MOCK_LEADS);
  },

  async addLead(lead) {
    const currentUser = JSON.parse(localStorage.getItem('crm_current_user') || '{}');
    const updateTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const updaterInfo = currentUser.name ? `${currentUser.name} (${currentUser.role})` : 'System';

    lead.lastUpdatedBy = updaterInfo;
    lead.lastUpdatedAt = updateTime;

    const leads = this.getLeads();
    const newId = leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 1;
    const newLead = {
      id: newId,
      dateAdded: new Date().toISOString().split('T')[0],
      status: 'New',
      ...lead
    };
    leads.push(newLead);
    setStorageItem('crm_leads', leads);

    if (USE_API) {
      try {
        const res = await fetch('/api/crm/leads/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lead)
        });
        const saved = await res.json();

        // Update local cache with exact database ID
        const currentLeads = this.getLeads();
        const index = currentLeads.findIndex(l => l.customerName === saved.customerName && l.email === saved.email);
        if (index !== -1) {
          currentLeads[index].id = saved.id;
          localStorage.setItem('crm_leads', JSON.stringify(currentLeads));
          newLead.id = saved.id;
        }
      } catch (err) {
        console.error("Error adding lead to DB:", err);
      }
    }

    return newLead;
  },

  async updateLead(leadId, updatedFields) {
    const currentUser = JSON.parse(localStorage.getItem('crm_current_user') || '{}');
    const updateTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const updaterInfo = currentUser.name ? `${currentUser.name} (${currentUser.role})` : 'System';

    updatedFields.lastUpdatedBy = updaterInfo;
    updatedFields.lastUpdatedAt = updateTime;

    const leads = this.getLeads();
    const index = leads.findIndex(l => l.id === parseInt(leadId));
    if (index !== -1) {
      leads[index] = { ...leads[index], ...updatedFields };
      setStorageItem('crm_leads', leads);

      if (USE_API) {
        try {
          const payload = { id: leadId, ...updatedFields };
          await fetch('/api/crm/leads/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } catch (err) {
          console.error("Error updating lead in DB:", err);
        }
      }

      return leads[index];
    }
    return null;
  },

  async deleteLead(leadId) {
    let leads = this.getLeads();
    leads = leads.filter(l => l.id !== parseInt(leadId));
    setStorageItem('crm_leads', leads);

    if (USE_API) {
      try {
        await fetch(`/api/crm/leads/${leadId}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.error("Error deleting lead in DB:", err);
      }
    }

    return true;
  },

  // Task Operations
  getTasks() {
    return getStorageItem('crm_tasks', MOCK_TASKS);
  },

  async addTask(task) {
    const tasks = this.getTasks();
    const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    const newTask = { id: newId, status: 'Pending', ...task };
    tasks.push(newTask);
    setStorageItem('crm_tasks', tasks);

    if (USE_API) {
      try {
        const res = await fetch('/api/crm/tasks/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task)
        });
        const saved = await res.json();

        const currentTasks = this.getTasks();
        const index = currentTasks.findIndex(t => t.title === saved.title && t.description === saved.description);
        if (index !== -1) {
          currentTasks[index].id = saved.id;
          localStorage.setItem('crm_tasks', JSON.stringify(currentTasks));
          newTask.id = saved.id;
        }
      } catch (err) {
        console.error("Error adding task to DB:", err);
      }
    }

    return newTask;
  },

  async completeTask(taskId) {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === parseInt(taskId));
    if (index !== -1) {
      tasks[index].status = 'Completed';
      setStorageItem('crm_tasks', tasks);

      if (USE_API) {
        try {
          await fetch(`/api/crm/tasks/${taskId}/complete`, {
            method: 'POST'
          });
        } catch (err) {
          console.error("Error completing task in DB:", err);
        }
      }

      return tasks[index];
    }
    return null;
  },

  async deleteTask(taskId) {
    let tasks = this.getTasks();
    tasks = tasks.filter(t => t.id !== parseInt(taskId));
    setStorageItem('crm_tasks', tasks);

    if (USE_API) {
      try {
        await fetch(`/api/crm/tasks/${taskId}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.error("Error deleting task in DB:", err);
      }
    }

    return true;
  },

  // Leave Operations
  getLeaves() {
    return getStorageItem('crm_leaves', MOCK_LEAVES);
  },

  async applyLeave(leave) {
    const leaves = this.getLeaves();
    const newId = leaves.length > 0 ? Math.max(...leaves.map(l => l.id)) + 1 : 1;
    const newLeave = { id: newId, status: 'Pending', ...leave };
    leaves.push(newLeave);
    setStorageItem('crm_leaves', leaves);

    if (USE_API) {
      try {
        const res = await fetch('/api/crm/leaves/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leave)
        });
        const saved = await res.json();

        const currentLeaves = this.getLeaves();
        const index = currentLeaves.findIndex(l => l.reason === saved.reason && l.startDate === saved.startDate);
        if (index !== -1) {
          currentLeaves[index].id = saved.id;
          localStorage.setItem('crm_leaves', JSON.stringify(currentLeaves));
          newLeave.id = saved.id;
        }
      } catch (err) {
        console.error("Error applying leave in DB:", err);
      }
    }

    return newLeave;
  },

  async updateLeaveStatus(leaveId, newStatus) {
    const leaves = this.getLeaves();
    const index = leaves.findIndex(l => l.id === parseInt(leaveId));
    if (index !== -1) {
      leaves[index].status = newStatus;
      setStorageItem('crm_leaves', leaves);

      if (USE_API) {
        try {
          await fetch(`/api/crm/leaves/${leaveId}/status?status=${newStatus}`, {
            method: 'POST'
          });
        } catch (err) {
          console.error("Error updating leave status in DB:", err);
        }
      }

      return leaves[index];
    }
    return null;
  },

  // Finance Operations
  getTransactions() {
    return getStorageItem('crm_transactions', MOCK_TRANSACTIONS);
  },

  async addTransaction(tx) {
    const transactions = this.getTransactions();
    const newId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;

    const base = parseFloat(tx.baseAmount);
    const vatRate = parseFloat(tx.vatRate || 15.0);
    const vat = base * (vatRate / 100);
    const total = base + vat;

    const newTx = {
      id: newId,
      transactionDate: new Date().toISOString().split('T')[0],
      vatAmount: vat,
      totalAmount: total,
      exchangeRate: 1.0,
      ...tx
    };
    transactions.push(newTx);
    setStorageItem('crm_transactions', transactions);

    if (USE_API) {
      try {
        const res = await fetch('/api/crm/transactions/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tx)
        });
        const saved = await res.json();

        const currentTxs = this.getTransactions();
        const index = currentTxs.findIndex(t => t.description === saved.description && t.baseAmount === saved.baseAmount);
        if (index !== -1) {
          currentTxs[index].id = saved.id;
          localStorage.setItem('crm_transactions', JSON.stringify(currentTxs));
          newTx.id = saved.id;
        }
      } catch (err) {
        console.error("Error adding transaction to DB:", err);
      }
    }

    return newTx;
  },

  async deleteTransaction(txId) {
    let transactions = this.getTransactions();
    transactions = transactions.filter(t => t.id !== parseInt(txId));
    setStorageItem('crm_transactions', transactions);

    if (USE_API) {
      try {
        await fetch(`/api/crm/transactions/${txId}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.error("Error deleting transaction in DB:", err);
      }
    }

    return true;
  },

  getFinancialReports() {
    const txs = this.getTransactions();
    let totalIncome = 0;
    let totalExpense = 0;
    let vatPayable = 0;

    txs.forEach(t => {
      const amount = parseFloat(t.totalAmount) * (t.exchangeRate || 1.0);
      const vat = parseFloat(t.vatAmount) * (t.exchangeRate || 1.0);
      if (t.type === 'INCOME') {
        totalIncome += parseFloat(t.baseAmount);
        vatPayable += vat; // vat collected on sales
      } else {
        totalExpense += parseFloat(t.baseAmount);
        vatPayable -= vat; // offset vat paid
      }
    });

    const netProfit = totalIncome - totalExpense;
    // Zakat Calculation KSA Standard
    const zakatBase = Math.max(0, netProfit + totalIncome * 0.1);
    const zakatDue = zakatBase * 0.025;

    return {
      plReport: { TotalIncome: totalIncome, NetProfit: netProfit, TotalExpense: totalExpense },
      vatReport: { VatPayable: Math.max(0, vatPayable) },
      zakatReport: { ZakatBase: zakatBase, ZakatDue: zakatDue }
    };
  },

  // Attendance Operations
  getAttendance() {
    return getStorageItem('crm_attendance', MOCK_ATTENDANCE);
  },

  async recordAttendance(userId, action) {
    const records = this.getAttendance();
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return null;

    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let record = null;
    if (action === 'checkin') {
      // Check if already checked in today
      const existing = records.find(r => r.userId === userId && r.date === todayStr);
      if (existing) return existing;

      record = {
        id: records.length > 0 ? Math.max(...records.map(r => r.id)) + 1 : 1,
        userId: user.id,
        name: user.name,
        role: user.role,
        date: todayStr,
        checkIn: timeStr,
        checkOut: null,
        hours: 0
      };
      records.push(record);
      setStorageItem('crm_attendance', records);
    } else if (action === 'checkout') {
      const existing = records.find(r => r.userId === userId && r.date === todayStr && !r.checkOut);
      if (existing) {
        existing.checkOut = timeStr;
        existing.hours = 8.5; // Simulate hours
        setStorageItem('crm_attendance', records);
        record = existing;
      }
    }

    if (USE_API) {
      try {
        const res = await fetch('/api/crm/attendance/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, action })
        });
        const saved = await res.json();

        if (action === 'checkin' && record) {
          const currentRecords = this.getAttendance();
          const idx = currentRecords.findIndex(r => r.userId === userId && r.date === todayStr);
          if (idx !== -1) {
            currentRecords[idx].id = saved.id;
            localStorage.setItem('crm_attendance', JSON.stringify(currentRecords));
            record.id = saved.id;
          }
        }
      } catch (err) {
        console.error("Error syncing attendance in DB:", err);
      }
    }

    return record;
  },

  // IVR Operations
  getCallLogs() {
    return getStorageItem('crm_calls', MOCK_CALLS);
  },

  async addCallLog(log) {
    const calls = this.getCallLogs();
    const newId = calls.length > 0 ? Math.max(...calls.map(c => c.id)) + 1 : 1;
    const newCall = {
      id: newId,
      startTime: new Date().toISOString(),
      ...log
    };
    calls.push(newCall);
    setStorageItem('crm_calls', calls);

    if (USE_API) {
      try {
        const res = await fetch('/api/crm/calls/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(log)
        });
        const saved = await res.json();

        const currentCalls = this.getCallLogs();
        const index = currentCalls.findIndex(c => c.customerName === saved.customerName && c.startTime.split('T')[0] === saved.startTime.split('T')[0]);
        if (index !== -1) {
          currentCalls[index].id = saved.id;
          localStorage.setItem('crm_calls', JSON.stringify(currentCalls));
          newCall.id = saved.id;
        }
      } catch (err) {
        console.error("Error adding call log to DB:", err);
      }
    }

    return newCall;
  },

  async deleteCallLog(callId) {
    let calls = this.getCallLogs();
    calls = calls.filter(c => c.id !== parseInt(callId));
    setStorageItem('crm_calls', calls);

    if (USE_API) {
      try {
        await fetch(`/api/crm/calls/${callId}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.error("Error deleting call log in DB:", err);
      }
    }

    return true;
  }
};
