import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { PasscodeForm } from "@/components/auth/PasscodeForm";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h1 className="card-title text-2xl">Sign in</h1>
            <p className="text-base-content/60 text-sm">Enter your passcode to continue.</p>
            <div className="mt-2">
              <PasscodeForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
