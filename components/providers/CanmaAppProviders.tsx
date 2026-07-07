"use client";

import { ApolloProvider } from "@apollo/client/react";
import { useMemo, useState } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import {
  configureCanmaApolloLink,
  createCanmaApolloClient,
} from "@/lib/canma-apollo-client";
import type { AppStore } from "@/lib/store";
import { makeCanmaPersistor, makeCanmaStore } from "@/lib/store";
import {
  bindCanmaReduxPersistor,
  bindCanmaReduxStore,
} from "@/lib/store/store-ref";
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
  const [{ store, persistor }] = useState(() => {
    const nextStore: AppStore = makeCanmaStore();
    const nextPersistor = makeCanmaPersistor(nextStore);
    bindCanmaReduxStore(nextStore);
    bindCanmaReduxPersistor(nextPersistor);
    return { store: nextStore, persistor: nextPersistor };
  });

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <CanmaApolloBinder>
          <PageViewTracker />
          {children}
        </CanmaApolloBinder>
      </PersistGate>
    </Provider>
  );
}
