import { EdelLogo } from "@/components/edel-logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid min-h-screen place-items-center bg-bg px-4 py-12">
      <div className="hero-glow absolute inset-0 -z-10" />
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center">
          <EdelLogo />
        </div>
        {children}
      </div>
    </div>
  );
}
