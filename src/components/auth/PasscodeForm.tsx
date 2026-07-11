"use client";

import { signInWithPasscode } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export const PasscodeForm = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const passcode = String(formData.get("passcode") || "");

    const result = await signInWithPasscode(passcode);

    if (result.error) {
      setErrorMessage(result.error);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    router.replace("/");
    router.refresh();
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block text-sm font-medium text-base-content" htmlFor="passcode">
        Passcode
      </label>
      <input
        autoComplete="off"
        className="input input-bordered w-full"
        id="passcode"
        name="passcode"
        required
        type="password"
      />

      {errorMessage ? (
        <p className="text-sm text-error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <button className="btn btn-primary w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
};
