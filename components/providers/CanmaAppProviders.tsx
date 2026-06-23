"use client";

import { ApolloProvider } from "@apollo/client/react";
import { useMemo, useState } from "react";
import { Provider } from "react-redux";

import {
  configureCanmaApolloLink,
  createCanmaApolloClient,
} from "@/lib/canma-apollo-client";
import type { AppStore } from "@/lib/store";
import { makeCanmaStore } from "@/lib/store";
import { bindCanmaReduxStore } from "@/lib/store/store-ref";
import { useAppSelector } from "@/lib/store/hooks";

/**
 * Lela-style (`MyApolloProvider`): one Apollo Client instance + synchronous
 * {@link ApolloClient#setLink} on every render so `graphqlHttpUrl()` / auth headers
 * stay aligned with Redux.
 */
function CanmaApolloBinder({ children }: { children: React.ReactNode }) {
  const token = useAppSelector((s) => s.auth.token ?? null);
  const client = useMemo(() => createCanmaApolloClient(), []);

  configureCanmaApolloLink(client, token);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

/** Redux root + Apollo (Lela-style `StoreProvider` + `MyApolloProvider`). */
export function CanmaAppProviders({ children }: { children: React.ReactNode }) {
  const [store] = useState<AppStore>(() => {
    const s = makeCanmaStore();
    bindCanmaReduxStore(s);
    return s;
  });

  return (
    <Provider store={store}>
      <CanmaApolloBinder>{children}</CanmaApolloBinder>
    </Provider>
  );
}
