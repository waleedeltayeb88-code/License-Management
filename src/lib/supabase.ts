import { createClient } from '@supabase/supabase-js';
import { Vehicle, TransferRecord, AuditRecord, SystemNotification } from '../types';

const FALLBACK_SUPABASE_URL = 'https://khqajtumumgslnphkvdu.supabase.co';
const FALLBACK_SUPABASE_KEY = 'sb_publishable_e0d1ooFJ1ljhpnLrXCNXZg_zh_K6uAh';

function getSanitizedUrl(): string {
  try {
    let raw = (import.meta.env.VITE_SUPABASE_URL || '').trim();
    // Strip surrounding quotes if present
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
  let key = (
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    ''
  ).trim();
  key = key.replace(/^["']|["']$/g, '').trim();

  if (!key || key.includes('your-anon-key')) {
    return FALLBACK_SUPABASE_KEY;
  }
  return key;
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

// Check if Supabase connection & vehicles table are ready
export async function checkSupabaseConnection(): Promise<{ connected: boolean; tablesExist: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.from('vehicles').select('id').limit(1);
    if (error) {
      // If table does not exist (PGRST205, PGRST204, 42P01, etc.)
      if (
        error.code === 'PGRST205' ||
        error.code === '42P01' ||
        error.message.includes('relation "public.vehicles" does not exist') ||
        error.message.includes('schema cache') ||
        error.code === 'PGRST204' ||
        error.code === 'PGRST301'
      ) {
        return { connected: true, tablesExist: false, error: 'المشروع متصل ولكن الجداول لم تُنشأ بعد في Supabase' };
      }
      return { connected: false, tablesExist: false, error: error.message };
    }
    return { connected: true, tablesExist: true };
  } catch (err: any) {
    return { connected: false, tablesExist: false, error: err?.message || 'خطأ غير معروف في الاتصال بـ Supabase' };
  }
}

// Fetch all vehicles from Supabase
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
      plateLetters: row.plate_letters,
      vin: row.vin,
      model: row.model,
      branch: row.branch,
      trafficLicense: {
        licenseNumber: row.traffic_license_number || '',
        issueDate: row.traffic_issue_date || '',
        expiryDate: row.traffic_expiry_date || '',
        documentUrl: row.traffic_document_url,
        notes: row.traffic_notes
      },
      commercialLicense: {
        licenseNumber: row.commercial_license_number || '',
        issueDate: row.commercial_issue_date || '',
        expiryDate: row.commercial_expiry_date || '',
        documentUrl: row.commercial_document_url,
        notes: row.commercial_notes
      },
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } catch (err) {
    console.error('Error fetching vehicles from Supabase:', err);
    return null;
  }
}

// Insert or update vehicle in Supabase
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
    return !error;
  } catch (err) {
    console.error('Failed to save vehicle to Supabase:', err);
    return false;
  }
}

// Bulk seed vehicles to Supabase
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
      created_at: v.createdAt || new Date().toISOString(),
      updated_at: v.updatedAt || new Date().toISOString()
    }));

    // Chunk in batches of 50
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

// Delete vehicle from Supabase
export async function deleteVehicleFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    return !error;
  } catch (err) {
    console.error('Delete vehicle error:', err);
    return false;
  }
}

// Transfers logging
export async function saveTransferToSupabase(transfer: TransferRecord): Promise<boolean> {
  try {
    const { error } = await supabase.from('transfers').insert({
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
    });
    return !error;
  } catch (err) {
    console.error('Save transfer error:', err);
    return false;
  }
}

// Audit logging
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
    expense_type TEXT NOT NULL, -- traffic_renewal, commercial_renewal, inspection, fines, insurance, maintenance
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
    role TEXT NOT NULL DEFAULT 'viewer', -- admin, branch_manager, auditor, logistics, viewer
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
    priority TEXT DEFAULT 'medium', -- high, medium, low
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

-- إصلاح دالة rls_auto_enable لسد تحذيرات الأمان (Security Definer Warning Fix)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'rls_auto_enable') THEN
    ALTER FUNCTION public.rls_auto_enable() SECURITY INVOKER;
    REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated, public;
  END IF;
END $$;

-- =========================================================================
-- الفهارس لتسريع البحث والاستعلامات (Performance Indexes)
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_vehicles_branch ON public.vehicles(branch);
CREATE INDEX IF NOT EXISTS idx_vehicles_traffic_expiry ON public.vehicles(traffic_expiry_date);
CREATE INDEX IF NOT EXISTS idx_vehicles_comm_expiry ON public.vehicles(commercial_expiry_date);
CREATE INDEX IF NOT EXISTS idx_transfers_vehicle ON public.transfers(vehicle_number);
CREATE INDEX IF NOT EXISTS idx_expenses_vehicle ON public.expenses(vehicle_number);
CREATE INDEX IF NOT EXISTS idx_audit_vehicle ON public.audit_logs(vehicle_number);
`;
