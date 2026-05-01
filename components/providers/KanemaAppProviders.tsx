"use client";

import { ApolloProvider } from "@apollo/client/react";
import { useMemo, useState } from "react";
import { Provider } from "react-redux";

import {
  configureKanemaApolloLink,
  createKanemaApolloClient,
} from "@/lib/kanema-apollo-client";
import type { AppStore } from "@/lib/store";
import { makeKanemaStore } from "@/lib/store";
import { bindKanemaReduxStore } from "@/lib/store/store-ref";
import { useAppSelector } from "@/lib/store/hooks";

/**
 * Lela-style (`MyApolloProvider`): one Apollo Client instance + synchronous
 * {@link ApolloClient#setLink} on every render so `graphqlHttpUrl()` / auth headers
 * stay aligned with Redux.
 */
function KanemaApolloBinder({ children }: { children: React.ReactNode }) {
  const token = useAppSelector((s) => s.auth.token ?? null);
  const client = useMemo(() => createKanemaApolloClient(), []);

  configureKanemaApolloLink(client, token);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

/** Redux root + Apollo (Lela-style `StoreProvider` + `MyApolloProvider`). */
export function KanemaAppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store] = useState<AppStore>(() => {
    const s = makeKanemaStore();
    bindKanemaReduxStore(s);
    return s;
  });

  return (
    <Provider store={store}>
      <KanemaApolloBinder>{children}</KanemaApolloBinder>
    </Provider>
  );
}
