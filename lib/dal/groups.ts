import { createClient } from '@/lib/supabase/server';
import type { GroupInput } from '@/lib/validations/group';

export async function listGroups() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('groups')
    .select('*, grade:grades(name), subject:subjects(name_ar)')
    .is('archived_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getGroup(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('groups')
    .select('*, grade:grades(name), subject:subjects(name_ar), members:student_groups!inner(student:students(*))')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createGroup(teacherId: string, input: GroupInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('groups')
    .insert({
      teacher_id: teacherId,
      name: input.name,
      academic_year_id: input.academic_year_id,
      grade_id: input.grade_id || null,
      subject_id: input.subject_id || null,
      max_students: input.max_students ?? null,
      pricing: input.pricing,
      price_per_session: input.price_per_session ?? null,
      price_monthly: input.price_monthly ?? null,
      schedule: input.schedule ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function addStudentToGroup(teacherId: string, studentId: string, groupId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('student_groups')
    .insert({ teacher_id: teacherId, student_id: studentId, group_id: groupId });
  if (error) throw error;
}

export async function removeStudentFromGroup(studentId: string, groupId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('student_groups')
    .update({ left_at: new Date().toISOString() })
    .eq('student_id', studentId)
    .eq('group_id', groupId)
    .is('left_at', null);
  if (error) throw error;
}
