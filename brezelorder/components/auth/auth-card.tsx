import Link from "next/link";

import { signInAction, signUpAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthCard({
  error,
  labels
}: {
  error?: string;
  labels: {
    ownerLogin: string;
    signInTitle: string;
    signInBody: string;
    signIn: string;
    getStarted: string;
    signUpTitle: string;
    signUpBody: string;
    createAccount: string;
    agree: string;
    back: string;
  };
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="surface p-6 md:p-8">
        <span className="eyebrow">{labels.ownerLogin}</span>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight">{labels.signInTitle}</h2>
        <p className="mt-2 text-sm text-stone-600">
          {labels.signInBody}
        </p>
        {error ? (
          <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        ) : null}
        <form action={signInAction} className="mt-6 space-y-4">
          <Input name="email" type="email" placeholder="owner@restaurant.de" required />
          <Input name="password" type="password" placeholder="Password" required />
          <Button type="submit" fullWidth>
            {labels.signIn}
          </Button>
        </form>
      </section>

      <section className="surface p-6 md:p-8">
        <span className="eyebrow">{labels.getStarted}</span>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight">{labels.signUpTitle}</h2>
        <p className="mt-2 text-sm text-stone-600">
          {labels.signUpBody}
        </p>
        <form action={signUpAction} className="mt-6 space-y-4">
          <Input name="fullName" placeholder="Full name" required />
          <Input name="email" type="email" placeholder="owner@restaurant.de" required />
          <Input name="password" type="password" placeholder="Choose a password" required />
          <Button type="submit" fullWidth>
            {labels.createAccount}
          </Button>
        </form>
        <p className="mt-6 text-xs text-stone-500">
          {labels.agree}
        </p>
        <Link href="/" className="mt-4 inline-flex text-sm font-medium text-warm-500 hover:text-warm-400">
          {labels.back}
        </Link>
      </section>
    </div>
  );
}
