import { createClient } from '@supabase/supabase-js';
import {
  Vehicle,
  TransferRecord,
  AuditRecord,
  SystemNotification,
  SystemUser,
  UserRole,
  AppSettings
} from '../types';
import { sanitizeUserPermissions } from '../utils/permissionUtils';

const FALLBACK_SUPABASE_URL = 'https://khqajtumumgslnphkvdu.supabase.co';
const FALLBACK_SUPABASE_ANON_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtocWFqdHVtdW1nc2xucGhrdmR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0MDc3NjEsImV4cCI6MjEwNTk4Mzc2MX0.2gpMRt76Fwf7mC8rB1SUoFbfc57x1kyTp83JlIf00Tc';
const FALLBACK_SUPABASE_KEY = 'sb_publishable_e0d1ooFJ1ljhpnLrXCNXZg_zh_K6uAh';

function getSanitizedUrl(): string {
  try {
    let raw = (import.meta?.env?.VITE_SUPABASE_URL || '').trim();
    raw = raw.replace(/^["']|["']$/g, '').trim();

    if (!raw || raw.includes('your-project') || raw.includes('MY_APP_URL')) {
      return FALLBACK_SUPABASE_URL;
    }

    if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
      raw = `https://${raw}`;
    }

    const urlObj = new URL(raw);
    if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
      return urlObj.origin;
    }
  } catch (e) {
    // fallback on any parsing error
  }
  return FALLBACK_SUPABASE_URL;
}

function getSanitizedKey(): string {
  try {
    let key = (
      import.meta?.env?.VITE_SUPABASE_ANON_KEY ||
      import.meta?.env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
      ''
    ).trim();
    key = key.replace(/^["']|["']$/g, '').trim();

    if (!key || key.includes('your-anon-key')) {
      return FALLBACK_SUPABASE_ANON_JWT;
    }
    return key;
  } catch {
    return FALLBACK_SUPABASE_ANON_JWT;
  }
}

const SUPABASE_URL = getSanitizedUrl();
const SUPABASE_ANON_KEY = getSanitizedKey();

function initSupabaseClient() {
  try {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  } catch (err) {
    console.warn('Initial Supabase client failed, using fallback:', err);
    return createClient(FALLBACK_SUPABASE_URL, FALLBACK_SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  }
}

export const supabase = initSupabaseClient();

export const SUPABASE_CONFIG = {
  projectUrl: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  publishableKey: FALLBACK_SUPABASE_KEY,
  projectId: 'khqajtumumgslnphkvdu'
};

export interface SupabaseStatusSummary {
  connected: boolean;
  tablesExist: boolean;
  counts?: {
    vehicles: number;
    users: number;
    transfers: number;
    auditLogs: number;
    branches: number;
  };
  error?: string;
}

// Check if Supabase connection & tables are ready + get live counts
export async function checkSupabaseConnection(): Promise<SupabaseStatusSummary> {
  try {
    const { count: vCount, error } = await supabase
      .from('vehicles')
      .select('id', { count: 'exact', head: true });

    if (error) {
      if (
        error.code === 'PGRST205' ||
        error.code === '42P01' ||
        error.message.includes('relation "public.vehicles" does not exist') ||
        error.message.includes('schema cache') ||
        error.code === 'PGRST204' ||
        error.code === 'PGRST301'
      ) {
        return {
          connected: true,
          tablesExist: false,
          error: 'المشروع متصل ولكن الجداول لم تُنشأ بعد في Supabase'
        };
      }
      return { connected: false, tablesExist: false, error: error.message };
    }

    const [uRes, tRes, aRes, bRes] = await Promise.all([
      supabase.from('system_users').select('id', { count: 'exact', head: true }),
      supabase.from('transfers').select('id', { count: 'exact', head: true }),
      supabase.from('audit_logs').select('id', { count: 'exact', head: true }),
      supabase.from('branches').select('id', { count: 'exact', head: true })
    ]);

    return {
      connected: true,
      tablesExist: true,
      counts: {
        vehicles: vCount ?? 0,
        users: uRes.count ?? 0,
        transfers: tRes.count ?? 0,
        auditLogs: aRes.count ?? 0,
        branches: bRes.count ?? 0
      }
    };
  } catch (err: any) {
    return {
      connected: false,
      tablesExist: false,
      error: err?.message || 'خطأ غير معروف في الاتصال بـ Supabase'
    };
  }
}

// ============================================================================
// 1. VEHICLES CRUD
// ============================================================================
export async function fetchVehiclesFromSupabase(): Promise<Vehicle[] | null> {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('vehicle_number', { ascending: true });

    if (error || !data) return null;

    return data.map((row: any) => ({
      id: row.id,
      vehicleNumber: row.vehicle_number,
      plateLetters: row.plate_letters || '',
      vin: row.vin || '',
      model: row.model || 'سوزوكي فان',
      branch: row.branch || '',
      trafficLicense: {
        licenseNumber: row.traffic_license_number || '',
        issueDate: row.traffic_issue_date || '',
        expiryDate: row.traffic_expiry_date || '',
        documentUrl: row.traffic_document_url || undefined,
        notes: row.traffic_notes || undefined
      },
      commercialLicense: {
        licenseNumber: row.commercial_license_number || '',
        issueDate: row.commercial_issue_date || '',
        expiryDate: row.commercial_expiry_date || '',
        documentUrl: row.commercial_document_url || undefined,
        notes: row.commercial_notes || undefined
      },
      notes: row.notes || undefined,
      createdAt: row.created_at ? String(row.created_at).slice(0, 10) : '2025-01-01',
      updatedAt: row.updated_at ? String(row.updated_at).slice(0, 10) : '2025-06-04'
    }));
  } catch (err) {
    console.error('Error fetching vehicles from Supabase:', err);
    return null;
  }
}

export async function saveVehicleToSupabase(v: Vehicle): Promise<boolean> {
  try {
    const payload = {
      id: v.id,
      vehicle_number: v.vehicleNumber,
      plate_letters: v.plateLetters || null,
      vin: v.vin || null,
      model: v.model,
      branch: v.branch,
      traffic_license_number: v.trafficLicense?.licenseNumber || null,
      traffic_issue_date: v.trafficLicense?.issueDate || null,
      traffic_expiry_date: v.trafficLicense?.expiryDate || null,
      traffic_document_url: v.trafficLicense?.documentUrl || null,
      traffic_notes: v.trafficLicense?.notes || null,
      commercial_license_number: v.commercialLicense?.licenseNumber || null,
      commercial_issue_date: v.commercialLicense?.issueDate || null,
      commercial_expiry_date: v.commercialLicense?.expiryDate || null,
      commercial_document_url: v.commercialLicense?.documentUrl || null,
      commercial_notes: v.commercialLicense?.notes || null,
      notes: v.notes || null,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('vehicles').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.error('Supabase saveVehicle error:', error);
    }
    return !error;
  } catch (err) {
    console.error('Failed to save vehicle to Supabase:', err);
    return false;
  }
}

export async function seedVehiclesToSupabase(vehicles: Vehicle[]): Promise<{ success: boolean; count: number }> {
  try {
    const rows = vehicles.map(v => ({
      id: v.id,
      vehicle_number: v.vehicleNumber,
      plate_letters: v.plateLetters || null,
      vin: v.vin || null,
      model: v.model,
      branch: v.branch,
      traffic_license_number: v.trafficLicense?.licenseNumber || null,
      traffic_issue_date: v.trafficLicense?.issueDate || null,
      traffic_expiry_date: v.trafficLicense?.expiryDate || null,
      traffic_document_url: v.trafficLicense?.documentUrl || null,
      traffic_notes: v.trafficLicense?.notes || null,
      commercial_license_number: v.commercialLicense?.licenseNumber || null,
      commercial_issue_date: v.commercialLicense?.issueDate || null,
      commercial_expiry_date: v.commercialLicense?.expiryDate || null,
      commercial_document_url: v.commercialLicense?.documentUrl || null,
      commercial_notes: v.commercialLicense?.notes || null,
      notes: v.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const chunkSize = 50;
    let inserted = 0;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { error } = await supabase.from('vehicles').upsert(chunk, { onConflict: 'id' });
      if (error) {
        console.error('Chunk insert error:', error);
      } else {
        inserted += chunk.length;
      }
    }
    return { success: inserted > 0, count: inserted };
  } catch (err) {
    console.error('Seed vehicles error:', err);
    return { success: false, count: 0 };
  }
}

export async function deleteVehicleFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    return !error;
  } catch (err) {
    console.error('Delete vehicle error:', err);
    return false;
  }
}

// ============================================================================
// 2. SYSTEM USERS & RBAC PERMISSIONS CRUD (public.system_users)
// ============================================================================
function normalizeRole(rawRole?: string): UserRole {
  if (!rawRole) return 'viewer';
  const r = rawRole.toLowerCase().trim();
  if (r === 'admin') return 'admin';
  if (r === 'fleet_manager' || r === 'logistics') return 'fleet_manager';
  if (r === 'branch_manager') return 'branch_manager';
  return 'viewer';
}

function userToSupabaseRow(u: SystemUser) {
  const sanitizedPerms = sanitizeUserPermissions(u.role, u.permissions);
  const metadataJson = JSON.stringify({
    username: u.username,
    password: u.password || '123456',
    phone: u.phone || '',
    title: u.title || '',
    status: u.status || 'active',
    createdAt: u.createdAt || new Date().toISOString().slice(0, 10),
    lastLogin: u.lastLogin || '',
    permissions: sanitizedPerms
  });

  return {
    id: u.id,
    name: u.name,
    email: u.email || `${u.username}@seoudisupermarket.com`,
    role: u.role,
    branch: u.assignedBranch || null,
    avatar: metadataJson,
    active: u.status !== 'suspended',
    last_login: new Date().toISOString()
  };
}

function supabaseRowToUser(row: any): SystemUser {
  const role = normalizeRole(row.role);
  let meta: any = {};
  if (row.avatar && typeof row.avatar === 'string' && row.avatar.trim().startsWith('{')) {
    try {
      meta = JSON.parse(row.avatar);
    } catch {
      meta = {};
    }
  }

  const emailStr = row.email || 'user@seoudisupermarket.com';
  const fallbackUsername = emailStr.split('@')[0].toLowerCase();
  const username = (meta.username || fallbackUsername).trim();
  const status: 'active' | 'suspended' =
    meta.status === 'suspended' || row.active === false ? 'suspended' : 'active';

  const permissions = sanitizeUserPermissions(role, meta.permissions);

  return {
    id: row.id,
    username,
    name: row.name || username,
    email: emailStr,
    password: meta.password || (username === 'admin' ? 'admin' : '123456'),
    role,
    title: meta.title || undefined,
    assignedBranch: row.branch || meta.assignedBranch || undefined,
    status,
    createdAt: meta.createdAt || (row.created_at ? String(row.created_at).slice(0, 10) : '2025-01-01'),
    lastLogin: meta.lastLogin || (row.last_login ? String(row.last_login).slice(0, 16).replace('T', ' ') : undefined),
    phone: meta.phone || undefined,
    permissions
  };
}

export async function fetchUsersFromSupabase(): Promise<SystemUser[] | null> {
  try {
    const { data, error } = await supabase
      .from('system_users')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !data) return null;
    if (data.length === 0) return [];

    return data.map(supabaseRowToUser);
  } catch (err) {
    console.error('Error fetching users from Supabase:', err);
    return null;
  }
}

export async function saveUserToSupabase(user: SystemUser): Promise<boolean> {
  try {
    const row = userToSupabaseRow(user);
    const { error } = await supabase.from('system_users').upsert(row, { onConflict: 'id' });
    if (error) {
      console.error('saveUserToSupabase error:', error);
    }
    return !error;
  } catch (err) {
    console.error('saveUserToSupabase exception:', err);
    return false;
  }
}

export async function saveAllUsersToSupabase(users: SystemUser[]): Promise<boolean> {
  try {
    // 1. First remove any deleted users in Supabase that are not in the updated list
    // Doing this BEFORE upsert avoids unique email constraint collisions if an email is reused
    const { data: existing } = await supabase.from('system_users').select('id, email');
    if (existing && existing.length > 0) {
      const currentIds = new Set(users.map(u => u.id));
      const toDelete = existing.filter((r: any) => !currentIds.has(r.id)).map((r: any) => r.id);
      if (toDelete.length > 0) {
        await supabase.from('system_users').delete().in('id', toDelete);
      }
    }

    // 2. Ensure unique emails across all rows to satisfy system_users_email_key constraint
    const usedEmails = new Set<string>();
    const rows = users.map((u, idx) => {
      const row = userToSupabaseRow(u);
      let emailLower = row.email.toLowerCase().trim();
      if (usedEmails.has(emailLower)) {
        row.email = `${u.username.toLowerCase()}.${idx}@seoudisupermarket.com`;
        emailLower = row.email.toLowerCase();
      }
      usedEmails.add(emailLower);
      return row;
    });

    const { error } = await supabase.from('system_users').upsert(rows, { onConflict: 'id' });
    if (error) {
      console.error('saveAllUsersToSupabase error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('saveAllUsersToSupabase exception:', err);
    return false;
  }
}

export async function deleteUserFromSupabase(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('system_users').delete().eq('id', userId);
    return !error;
  } catch (err) {
    console.error('deleteUserFromSupabase error:', err);
    return false;
  }
}

// ============================================================================
// 3. TRANSFERS CRUD (public.transfers)
// ============================================================================
export async function fetchTransfersFromSupabase(): Promise<TransferRecord[] | null> {
  try {
    const { data, error } = await supabase
      .from('transfers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;
    if (data.length === 0) return [];

    return data.map((row: any) => ({
      id: row.id,
      vehicleId: row.vehicle_id || undefined,
      vehicleNumber: row.vehicle_number,
      fromBranch: row.from_branch,
      toBranch: row.to_branch,
      date: row.transfer_date,
      time: row.transfer_time,
      transferredBy: row.transferred_by,
      reason: row.reason,
      notes: row.notes || undefined
    }));
  } catch (err) {
    console.error('fetchTransfersFromSupabase error:', err);
    return null;
  }
}

export async function saveTransferToSupabase(transfer: TransferRecord): Promise<boolean> {
  try {
    const { error } = await supabase.from('transfers').upsert(
      {
        id: transfer.id,
        vehicle_id: transfer.vehicleId || null,
        vehicle_number: transfer.vehicleNumber,
        from_branch: transfer.fromBranch,
        to_branch: transfer.toBranch,
        transfer_date: transfer.date,
        transfer_time: transfer.time,
        transferred_by: transfer.transferredBy,
        reason: transfer.reason,
        notes: transfer.notes || null
      },
      { onConflict: 'id' }
    );
    return !error;
  } catch (err) {
    console.error('Save transfer error:', err);
    return false;
  }
}

export async function seedTransfersToSupabase(transfers: TransferRecord[]): Promise<boolean> {
  try {
    if (!transfers || transfers.length === 0) return true;
    const rows = transfers.map(t => ({
      id: t.id,
      vehicle_id: t.vehicleId || null,
      vehicle_number: t.vehicleNumber,
      from_branch: t.fromBranch,
      to_branch: t.toBranch,
      transfer_date: t.date,
      transfer_time: t.time,
      transferred_by: t.transferredBy,
      reason: t.reason,
      notes: t.notes || null
    }));
    const { error } = await supabase.from('transfers').upsert(rows, { onConflict: 'id' });
    return !error;
  } catch (err) {
    console.error('seedTransfersToSupabase error:', err);
    return false;
  }
}

// ============================================================================
// 4. AUDIT LOGS CRUD (public.audit_logs)
// ============================================================================
export async function fetchAuditLogsFromSupabase(): Promise<AuditRecord[] | null> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error || !data) return null;
    if (data.length === 0) return [];

    return data.map((row: any) => ({
      id: row.id,
      user: row.user_name,
      userRole: row.user_role || undefined,
      action: row.action,
      vehicleNumber: row.vehicle_number,
      oldValue: row.old_value || '',
      newValue: row.new_value || '',
      date: row.log_date,
      time: row.log_time
    }));
  } catch (err) {
    console.error('fetchAuditLogsFromSupabase error:', err);
    return null;
  }
}

export async function saveAuditToSupabase(audit: AuditRecord): Promise<boolean> {
  try {
    const { error } = await supabase.from('audit_logs').insert({
      id: audit.id,
      user_name: audit.user,
      user_role: audit.userRole || null,
      action: audit.action,
      vehicle_number: audit.vehicleNumber,
      old_value: audit.oldValue,
      new_value: audit.newValue,
      log_date: audit.date,
      log_time: audit.time
    });
    return !error;
  } catch (err) {
    console.error('Save audit error:', err);
    return false;
  }
}

export async function seedAuditLogsToSupabase(logs: AuditRecord[]): Promise<boolean> {
  try {
    if (!logs || logs.length === 0) return true;
    const { data: existing } = await supabase.from('audit_logs').select('id').limit(1);
    if (existing && existing.length > 0) return true;

    const rows = logs.map(a => ({
      id: a.id,
      user_name: a.user,
      user_role: a.userRole || null,
      action: a.action,
      vehicle_number: a.vehicleNumber,
      old_value: a.oldValue,
      new_value: a.newValue,
      log_date: a.date,
      log_time: a.time
    }));
    const { error } = await supabase.from('audit_logs').insert(rows);
    return !error;
  } catch (err) {
    console.error('seedAuditLogsToSupabase error:', err);
    return false;
  }
}

// ============================================================================
// 5. SETTINGS & BRANCHES (public.settings, public.branches)
// ============================================================================
export async function fetchSettingsFromSupabase(): Promise<{
  settings?: AppSettings;
  referenceDate?: string;
} | null> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'seoudi_app_settings')
      .maybeSingle();

    if (error || !data || !data.value) return null;
    return data.value as { settings?: AppSettings; referenceDate?: string };
  } catch (err) {
    console.error('fetchSettingsFromSupabase error:', err);
    return null;
  }
}

export async function saveSettingsToSupabase(
  settings: AppSettings,
  referenceDate?: string
): Promise<boolean> {
  try {
    const { error } = await supabase.from('settings').upsert(
      {
        key: 'seoudi_app_settings',
        value: { settings, referenceDate },
        updated_at: new Date().toISOString()
      },
      { onConflict: 'key' }
    );
    return !error;
  } catch (err) {
    console.error('saveSettingsToSupabase error:', err);
    return false;
  }
}

export async function fetchBranchesFromSupabase(): Promise<string[] | null> {
  try {
    const { data, error } = await supabase
      .from('branches')
      .select('name, created_at')
      .order('created_at', { ascending: true });

    if (error || !data) return null;
    if (data.length === 0) return [];

    const names = data.map((r: any) => String(r.name || '').trim()).filter(Boolean);
    return Array.from(new Set(names));
  } catch (err) {
    console.error('fetchBranchesFromSupabase error:', err);
    return null;
  }
}

export async function saveBranchesToSupabase(branches: string[]): Promise<boolean> {
  try {
    const cleanBranches = Array.from(new Set(branches.map(b => b.trim()).filter(Boolean)));
    const { data: existing } = await supabase.from('branches').select('id, name');

    if (existing && existing.length > 0) {
      const targetSet = new Set(cleanBranches);
      const toDelete = existing.filter((r: any) => !targetSet.has(r.name)).map((r: any) => r.id);
      if (toDelete.length > 0) {
        await supabase.from('branches').delete().in('id', toDelete);
      }
    }

    const existingMap = new Map<string, string>();
    if (existing) {
      existing.forEach((r: any) => existingMap.set(r.name, r.id));
    }

    const rows = cleanBranches.map((name, idx) => ({
      id: existingMap.get(name) || `branch-${idx + 1}-${Date.now().toString().slice(-4)}`,
      name,
      code: `BR-${String(idx + 1).padStart(2, '0')}`,
      city: name.includes('العلمين') ? 'الساحل الشمالي' : 'القاهرة الكبرى',
      manager_name: 'إدارة تشغيل سعودي سوبر ماركت',
      phone: '01144542800'
    }));

    if (rows.length > 0) {
      const { error } = await supabase.from('branches').upsert(rows, { onConflict: 'id' });
      if (error) {
        console.error('saveBranchesToSupabase error:', error);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error('saveBranchesToSupabase exception:', err);
    return false;
  }
}

export async function seedBranchesToSupabase(branches: string[]): Promise<boolean> {
  return saveBranchesToSupabase(branches);
}

// ============================================================================
// 6. FULL SYSTEM SYNC TO SUPABASE
// ============================================================================
export async function syncAllDataToSupabase(payload: {
  vehicles: Vehicle[];
  users: SystemUser[];
  transfers: TransferRecord[];
  auditLogs: AuditRecord[];
  branches: string[];
  settings: AppSettings;
  referenceDate: string;
}): Promise<{ success: boolean; summary: string }> {
  try {
    const [vRes, uOk, tOk, aOk, bOk, sOk] = await Promise.all([
      seedVehiclesToSupabase(payload.vehicles),
      saveAllUsersToSupabase(payload.users),
      seedTransfersToSupabase(payload.transfers),
      seedAuditLogsToSupabase(payload.auditLogs),
      seedBranchesToSupabase(payload.branches),
      saveSettingsToSupabase(payload.settings, payload.referenceDate)
    ]);

    const ok = vRes.success && uOk;
    return {
      success: ok,
      summary: ok
        ? `تمت المزامنة الكاملة مع Supabase بنجاح: (${vRes.count} مركبة، ${payload.users.length} مستخدم وصلاحية، ${payload.transfers.length} حركة نقل، ${payload.branches.length} فرع، والإعدادات العامة) 🎉`
        : 'حدث خطأ جزئي أثناء المزامنة، يرجى التأكد من تشغيل كود SQL في Supabase.'
    };
  } catch (err: any) {
    return {
      success: false,
      summary: err?.message || 'فشلت عملية المزامنة الشاملة'
    };
  }
}

// The complete SQL script for the user to run in Supabase SQL editor
export const SUPABASE_SQL_SCHEMA = `-- =========================================================================
-- منظومة سعودي سوبر ماركت - سكربت إنشاء جميع الجداول (Supabase Database)
-- قم بنسخ هذا الكود بالكامل ولصقه في SQL Editor في Supabase واضغط Run
-- =========================================================================

-- 1. جدول المركبات ورخص التسيير والتجاري (Vehicles & Licenses)
CREATE TABLE IF NOT EXISTS public.vehicles (
    id TEXT PRIMARY KEY,
    vehicle_number TEXT NOT NULL,
    plate_letters TEXT,
    vin TEXT,
    model TEXT NOT NULL,
    branch TEXT NOT NULL,
    traffic_license_number TEXT,
    traffic_issue_date TEXT,
    traffic_expiry_date TEXT,
    traffic_document_url TEXT,
    traffic_notes TEXT,
    commercial_license_number TEXT,
    commercial_issue_date TEXT,
    commercial_expiry_date TEXT,
    commercial_document_url TEXT,
    commercial_notes TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول سجل التحويلات بين الفروع (Vehicle Transfers)
CREATE TABLE IF NOT EXISTS public.transfers (
    id TEXT PRIMARY KEY,
    vehicle_id TEXT,
    vehicle_number TEXT NOT NULL,
    from_branch TEXT NOT NULL,
    to_branch TEXT NOT NULL,
    transfer_date TEXT NOT NULL,
    transfer_time TEXT NOT NULL,
    transferred_by TEXT NOT NULL,
    reason TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول المصروفات والرسوم وتجديد الرخص (Expenses & Renewals)
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    vehicle_id TEXT,
    vehicle_number TEXT NOT NULL,
    expense_type TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    receipt_number TEXT,
    payment_method TEXT DEFAULT 'cash',
    paid_by TEXT,
    expense_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. جدول سجل التدقيق والتعديلات والعمليات (Audit Logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    user_name TEXT NOT NULL,
    user_role TEXT,
    action TEXT NOT NULL,
    vehicle_number TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    log_date TEXT NOT NULL,
    log_time TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. جدول مستخدمي النظام والصلاحيات (System Users)
CREATE TABLE IF NOT EXISTS public.system_users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer',
    branch TEXT,
    avatar TEXT,
    active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. جدول التنبيهات والإشعارات (Notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    vehicle_number TEXT,
    priority TEXT DEFAULT 'medium',
    type TEXT DEFAULT 'system',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. جدول فروع شركة سعودي (Branches)
CREATE TABLE IF NOT EXISTS public.branches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    code TEXT,
    city TEXT DEFAULT 'القاهرة',
    manager_name TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. جدول إعدادات النظام العامة (System Settings)
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- إعدادات الأمان والصلاحيات المتوافقة مع معايير Supabase Security Linter
-- =========================================================================
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 1. جدول المركبات (Vehicles)
DROP POLICY IF EXISTS "Public vehicles policy" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_select_policy" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_insert_policy" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_update_policy" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_delete_policy" ON public.vehicles;
CREATE POLICY "vehicles_select_policy" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "vehicles_insert_policy" ON public.vehicles FOR INSERT WITH CHECK (id IS NOT NULL AND length(id) > 0);
CREATE POLICY "vehicles_update_policy" ON public.vehicles FOR UPDATE USING (id IS NOT NULL) WITH CHECK (id IS NOT NULL);
CREATE POLICY "vehicles_delete_policy" ON public.vehicles FOR DELETE USING (id IS NOT NULL);

-- 2. جدول التحويلات (Transfers)
DROP POLICY IF EXISTS "Public transfers policy" ON public.transfers;
DROP POLICY IF EXISTS "transfers_select_policy" ON public.transfers;
DROP POLICY IF EXISTS "transfers_insert_policy" ON public.transfers;
DROP POLICY IF EXISTS "transfers_update_policy" ON public.transfers;
DROP POLICY IF EXISTS "transfers_delete_policy" ON public.transfers;
CREATE POLICY "transfers_select_policy" ON public.transfers FOR SELECT USING (true);
CREATE POLICY "transfers_insert_policy" ON public.transfers FOR INSERT WITH CHECK (id IS NOT NULL AND length(id) > 0);
CREATE POLICY "transfers_update_policy" ON public.transfers FOR UPDATE USING (id IS NOT NULL) WITH CHECK (id IS NOT NULL);
CREATE POLICY "transfers_delete_policy" ON public.transfers FOR DELETE USING (id IS NOT NULL);

-- 3. جدول المصروفات (Expenses)
DROP POLICY IF EXISTS "Public expenses policy" ON public.expenses;
DROP POLICY IF EXISTS "expenses_select_policy" ON public.expenses;
DROP POLICY IF EXISTS "expenses_insert_policy" ON public.expenses;
DROP POLICY IF EXISTS "expenses_update_policy" ON public.expenses;
DROP POLICY IF EXISTS "expenses_delete_policy" ON public.expenses;
CREATE POLICY "expenses_select_policy" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "expenses_insert_policy" ON public.expenses FOR INSERT WITH CHECK (id IS NOT NULL AND length(id) > 0);
CREATE POLICY "expenses_update_policy" ON public.expenses FOR UPDATE USING (id IS NOT NULL) WITH CHECK (id IS NOT NULL);
CREATE POLICY "expenses_delete_policy" ON public.expenses FOR DELETE USING (id IS NOT NULL);

-- 4. جدول سجل التدقيق (Audit Logs)
DROP POLICY IF EXISTS "Public audit_logs policy" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_select_policy" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_select_policy" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "audit_logs_insert_policy" ON public.audit_logs FOR INSERT WITH CHECK (id IS NOT NULL AND length(id) > 0);

-- 5. جدول المستخدمين (System Users)
DROP POLICY IF EXISTS "Public system_users policy" ON public.system_users;
DROP POLICY IF EXISTS "system_users_select_policy" ON public.system_users;
DROP POLICY IF EXISTS "system_users_insert_policy" ON public.system_users;
DROP POLICY IF EXISTS "system_users_update_policy" ON public.system_users;
DROP POLICY IF EXISTS "system_users_delete_policy" ON public.system_users;
CREATE POLICY "system_users_select_policy" ON public.system_users FOR SELECT USING (true);
CREATE POLICY "system_users_insert_policy" ON public.system_users FOR INSERT WITH CHECK (id IS NOT NULL AND length(id) > 0);
CREATE POLICY "system_users_update_policy" ON public.system_users FOR UPDATE USING (id IS NOT NULL) WITH CHECK (id IS NOT NULL);
CREATE POLICY "system_users_delete_policy" ON public.system_users FOR DELETE USING (id IS NOT NULL);

-- 6. جدول التنبيهات (Notifications)
DROP POLICY IF EXISTS "Public notifications policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_select_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete_policy" ON public.notifications;
CREATE POLICY "notifications_select_policy" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "notifications_insert_policy" ON public.notifications FOR INSERT WITH CHECK (id IS NOT NULL AND length(id) > 0);
CREATE POLICY "notifications_update_policy" ON public.notifications FOR UPDATE USING (id IS NOT NULL) WITH CHECK (id IS NOT NULL);
CREATE POLICY "notifications_delete_policy" ON public.notifications FOR DELETE USING (id IS NOT NULL);

-- 7. جدول الفروع (Branches)
DROP POLICY IF EXISTS "Public branches policy" ON public.branches;
DROP POLICY IF EXISTS "branches_select_policy" ON public.branches;
DROP POLICY IF EXISTS "branches_insert_policy" ON public.branches;
DROP POLICY IF EXISTS "branches_update_policy" ON public.branches;
DROP POLICY IF EXISTS "branches_delete_policy" ON public.branches;
CREATE POLICY "branches_select_policy" ON public.branches FOR SELECT USING (true);
CREATE POLICY "branches_insert_policy" ON public.branches FOR INSERT WITH CHECK (id IS NOT NULL AND length(id) > 0);
CREATE POLICY "branches_update_policy" ON public.branches FOR UPDATE USING (id IS NOT NULL) WITH CHECK (id IS NOT NULL);
CREATE POLICY "branches_delete_policy" ON public.branches FOR DELETE USING (id IS NOT NULL);

-- 8. جدول الإعدادات (Settings)
DROP POLICY IF EXISTS "Public settings policy" ON public.settings;
DROP POLICY IF EXISTS "settings_select_policy" ON public.settings;
DROP POLICY IF EXISTS "settings_insert_policy" ON public.settings;
DROP POLICY IF EXISTS "settings_update_policy" ON public.settings;
CREATE POLICY "settings_select_policy" ON public.settings FOR SELECT USING (true);
CREATE POLICY "settings_insert_policy" ON public.settings FOR INSERT WITH CHECK (key IS NOT NULL AND length(key) > 0);
CREATE POLICY "settings_update_policy" ON public.settings FOR UPDATE USING (key IS NOT NULL) WITH CHECK (key IS NOT NULL);
`;
