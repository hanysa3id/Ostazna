import { MarketingHeader } from '@/components/shared/marketing-header';
import { MarketingFooter } from '@/components/shared/marketing-footer';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-bg overflow-x-clip">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
