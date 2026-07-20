import { redirect } from "next/navigation";

/** When false, public election ballot, results, and nav links are hidden. */
export const ELECTIONS_ENABLED = false;

/** Redirect disabled election routes to the home page. */
export function redirectIfElectionsDisabled(): void {
  if (!ELECTIONS_ENABLED) {
    redirect("/");
  }
}
