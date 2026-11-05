import { createClient } from '@/lib/supabase/server';
import type { StudentInput } from '@/lib/validations/student';

export async function listStudents(opts: { search?: string; archived?: boolean } = {}) {
  const supabase = await createClient();
  let q = supabase.from('students').select('*').order('created_at', { ascending: false });
  q = opts.archived ? q.not('archived_at', 'is', null) : q.is('archived_at', null);
  if (opts.search) q = q.ilike('name_ar', `%${opts.search}%`);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getStudent(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('students').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createStudent(teacherId: string, input: StudentInput) {
  const supabase = await createClient();
  const payload = {
    teacher_id: teacherId,
    ...input,
    name_en: input.name_en || null,
    date_of_birth: input.date_of_birth || null,
    phone: input.phone || null,
    parent_name: input.parent_name || null,
    parent_phone: input.parent_phone || null,
    notes: input.notes || null,
  };
  const { data, error } = await supabase.from('students').insert(payload).select().single();
  if (error) throw new Error(`${error.code ?? 'db_error'}: ${error.message}`);
  return data;
}

export async function updateStudent(id: string, input: Partial<StudentInput>) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('students').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function archiveStudent(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('students')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}
