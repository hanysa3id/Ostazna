import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;

(async () => {
  const admin = createClient(url, service, { auth: { persistSession: false } });

  // Find a student to test
  const { data: students } = await admin.from('students').select('id, name_ar, teacher_id').limit(5);
  if (!students || students.length === 0) {
    console.log('No students in DB.');
    return;
  }

  for (const s of students) {
    console.log(`\n=== Student: ${s.name_ar} (${s.id}) ===`);
    console.log(`   teacher_id: ${s.teacher_id}`);

    // Get the teacher's email
    const { data: teacher } = await admin.from('teachers').select('email, user_id').eq('id', s.teacher_id).single();
    if (!teacher) { console.log('  teacher row missing'); continue; }
    console.log(`   teacher: ${teacher.email}`);

    // Generate magic link for this teacher
    const { data: link } = await admin.auth.admin.generateLink({ type: 'magiclink', email: teacher.email });
    if (!link.properties?.hashed_token) { console.log('   no link'); continue; }

    const userClient = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error: otpErr } = await userClient.auth.verifyOtp({
      type: 'magiclink', token_hash: link.properties.hashed_token,
    });
    if (otpErr) { console.log('   verify failed:', otpErr.message); continue; }

    // Run the same queries that the student detail page runs
    const tests = [
      { name: 'getStudent', q: () => userClient.from('students').select('*').eq('id', s.id).single() },
      { name: 'listPayments', q: () => userClient.from('payments')
          .select('*, student:students(name_ar)')
          .eq('student_id', s.id)
          .order('payment_date', { ascending: false }).limit(20) },
      { name: 'student_groups+join', q: () => userClient.from('student_groups')
          .select('group:groups(id, name)').eq('student_id', s.id).is('left_at', null) },
      { name: 'attendance', q: () => userClient.from('attendance')
          .select('status, recorded_at').eq('student_id', s.id)
          .order('recorded_at', { ascending: false }).limit(30) },
    ];

    for (const t of tests) {
      const { data, error } = await t.q();
      if (error) {
        console.log(`   ❌ ${t.name.padEnd(22)} ${error.code} ${error.message}`);
        if ((error as any).hint) console.log(`      hint: ${(error as any).hint}`);
      } else {
        const c = Array.isArray(data) ? data.length : data ? 1 : 0;
        console.log(`   ✅ ${t.name.padEnd(22)} (${c} rows)`);
      }
    }
  }
})();
