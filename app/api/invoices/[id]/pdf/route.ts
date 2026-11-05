import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { renderInvoicePdf } from '@/lib/pdf/invoice';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: invoice }, { data: { user } }] = await Promise.all([
    supabase
      .from('invoices')
      .select('*, student:students(name_ar, name_en, parent_name, parent_phone)')
      .eq('id', id)
      .maybeSingle(),
    supabase.auth.getUser(),
  ]);

  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!invoice) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const { data: teacher } = await supabase
    .from('teachers')
    .select('name_ar, name_en, phone, email, subdomain, settings')
    .eq('id', invoice.teacher_id)
    .single();

  const buffer = await renderInvoicePdf({ invoice, teacher });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${invoice.invoice_number}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
