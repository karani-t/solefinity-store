import { Suspense } from "react";
import ResetPasswordClient from "./client";

function ResetPasswordFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-400"></div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordClient />
    </Suspense>
  );
}
