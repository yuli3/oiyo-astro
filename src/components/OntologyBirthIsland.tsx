"use client";

import { UserProvider } from "@/lib/user/context/UserContext";
import { OntologyBirthInput } from "@/components/ontology/OntologyBirthInput";

// Lightweight island for the Zone 1 quick birth-date input. Shares the same
// module-singleton Zustand user store as the deep OntologyIsland, so writes
// here live-sync the deep dashboard and (via a custom event) the SSR stats.
export default function OntologyBirthIsland({ locale }: { locale: string }) {
  return (
    <UserProvider>
      <OntologyBirthInput locale={locale} />
    </UserProvider>
  );
}
