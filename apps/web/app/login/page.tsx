import { AuthTabs } from "@/components/common/login-signup/auth-tabs";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <AuthTabs />
      </div>
    </div>
  );
}
