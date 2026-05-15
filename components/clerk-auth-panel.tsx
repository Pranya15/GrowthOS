"use client";

import { SignIn } from "@clerk/nextjs";

export function ClerkAuthPanel() {
  return <SignIn routing="hash" forceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard" signUpForceRedirectUrl="/dashboard" signUpFallbackRedirectUrl="/dashboard" />;
}
