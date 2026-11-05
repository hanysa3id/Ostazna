# Phase 1 — Manual Smoke Checklist

End-to-end in the **Arabic** locale unless noted.

## Auth + Onboarding
- [ ] Visit `/`, click "ابدأ مجاناً" → `/register` loads in RTL.
- [ ] Register with email/password → email arrives → click verify link → lands on `/onboarding`.
- [ ] Complete 4 steps → lands on `/dashboard`.
- [ ] Log out → `/login` reachable → log back in via Google OAuth → lands on `/dashboard`.
- [ ] Visit a `*.ostazna.com` subdomain that doesn't exist → 404.
- [ ] Visit your own subdomain → "Coming soon" page with your name.

## Students + Groups
- [ ] Create 30 students (mix of has-parent / no-parent).
- [ ] Add each to one of 3 groups.
- [ ] Move one student between groups (verify `left_at` set on old row).
- [ ] Archive one student → vanishes from active list.
- [ ] Try to add the 21st student on Free tier → blocked with quota message.

## Schedule + Attendance
- [ ] Create a recurring slot for Group A (Tue/Thu 4pm).
- [ ] Verify sessions exist for the next 12 weeks.
- [ ] Mark attendance for today's 4 sessions (mix of present/absent/late).
- [ ] Re-save same attendance — no duplicate rows (idempotent).

## Payments
- [ ] Record 20 payments across students (cash + bank_transfer).
- [ ] Dashboard "month revenue" matches sum.
- [ ] Late-payer list shows 3 known overdue students.
- [ ] Click WA reminder → opens `wa.me` deep link with Arabic message.
- [ ] As Free-tier teacher, after 50 WA sends in current month → 51st blocked with quota error.

## Dashboard
- [ ] Page renders in <500ms with seed of 500 students / 5k sessions / 3k payments.
- [ ] All 5 cards show non-placeholder values.

## Subdomain placeholder + Super Admin
- [ ] Super admin sees teacher in `/admin/teachers`.
- [ ] Confirm a Pro subscription → teacher's plan + status update.
- [ ] Quotas (student cap) reflect new tier on next request.
- [ ] Audit log shows the confirmation row with `actor_id` = admin.

## Cross-cutting
- [ ] Switch locale to English → all UI flips LTR, fonts swap.
- [ ] RLS test: log in as Teacher A, query for Teacher B's student id directly via the DAL → returns nothing.
- [ ] `/api/exports/teacher-data` downloads a non-empty file.
