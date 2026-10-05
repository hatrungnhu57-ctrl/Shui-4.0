/**
 * VERCEL SERVERLESS CLOUD SYNC API
 * Đồng bộ hai chiều (Push/Pull) dữ liệu Sổ hụi giữa các thiết bị qua Supabase Cloud
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kmpxbwtshhpbrkbhcmfv.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttcHhid3RzaGhwYnJrYmhjbWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNjk0NTQsImV4cCI6MjEwNjc0NTQ1NH0.LPtPas5M5DQXv3PEUFWlLBNOoIW70rdGwWd0TZMGpl8';

const globalAccounts = global.__SO_HUI_CLOUD_ACCOUNTS || new Map();
global.__SO_HUI_CLOUD_ACCOUNTS = globalAccounts;

function setCors(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

function normalizePhone(phone) {
  if (!phone) return '';
  return phone.toString().replace(/[\s.-]/g, '').trim();
}

async function getSupabaseKey(key) {
  try {
    if (typeof fetch === 'function') {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/sohui_store?key=eq.${encodeURIComponent(key)}&select=*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0 && rows[0].data) {
          return rows[0].data;
        }
      }
    }
  } catch (e) {
    console.warn('[Supabase Read Warning]:', e.message);
  }
  return null;
}

async function saveSupabaseKey(key, data) {
  try {
    if (typeof fetch === 'function') {
      await fetch(`${SUPABASE_URL}/rest/v1/sohui_store`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          key: key,
          data: data,
          updated_at: new Date().toISOString()
        })
      });
    }
  } catch (e) {
    console.warn('[Supabase Write Warning]:', e.message);
  }
}

async function getCloudUser(phone) {
  const clean = normalizePhone(phone);
  if (!clean) return null;

  if (globalAccounts.has(clean)) {
    return globalAccounts.get(clean);
  }

  const data = await getSupabaseKey(`usr_${clean}`);
  if (data) {
    globalAccounts.set(clean, data);
    return data;
  }

  return null;
}

async function saveCloudUser(phone, userData) {
  const clean = normalizePhone(phone);
  if (!clean) return;

  globalAccounts.set(clean, userData);
  await saveSupabaseKey(`usr_${clean}`, userData);
}

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Chỉ hỗ trợ POST' });
  }

  try {
    const { action, phone, password, ledgerData } = req.body || {};
    const cleanPhone = normalizePhone(phone);

    if (!cleanPhone) {
      return res.status(400).json({ success: false, message: 'Thiếu số điện thoại' });
    }

    let userData = await getCloudUser(cleanPhone);

    if (!userData) {
      userData = {
        account: {
          id: 'acc-' + Date.now(),
          phone: cleanPhone,
          password: password || '123',
          fullName: (ledgerData && ledgerData.currentUser && ledgerData.currentUser.fullName) || 'Chủ Hụi',
          role: 'owner',
          createdAt: new Date().toISOString().split('T')[0]
        },
        ledger: ledgerData || null
      };
    }

    // 1. PUSH (Đồng bộ từ thiết bị lên Cloud)
    if (action === 'push') {
      if (!ledgerData) {
        return res.status(400).json({ success: false, message: 'Dữ liệu sổ hụi trống' });
      }

      userData.ledger = ledgerData;
      userData.lastSyncedAt = new Date().toISOString();
      await saveCloudUser(cleanPhone, userData);

      return res.status(200).json({
        success: true,
        message: 'Đã sao lưu lên Đám mây thành công!',
        syncedAt: userData.lastSyncedAt
      });
    }

    // 2. PULL (Tải dữ liệu mới nhất từ Cloud về thiết bị)
    if (action === 'pull') {
      return res.status(200).json({
        success: true,
        ledger: userData.ledger || null,
        account: userData.account,
        syncedAt: userData.lastSyncedAt || new Date().toISOString()
      });
    }

    return res.status(400).json({ success: false, message: 'Hành động không hợp lệ (push hoặc pull)' });
  } catch (error) {
    console.error('Sync Error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi đồng bộ: ' + error.message });
  }
};
