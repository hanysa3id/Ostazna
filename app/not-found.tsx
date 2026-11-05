import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-dvh grid place-items-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-primary-700">404</h1>
        <p className="mt-4 text-lg text-neutral-700">الصفحة غير موجودة</p>
        <p className="mt-2 text-neutral-500">Page not found</p>
        <Link href="/" className="mt-6 inline-block px-5 py-2.5 rounded-card bg-primary-700 text-white">
          العودة للرئيسية
        </Link>
      </div>
    </main>
  );
}
