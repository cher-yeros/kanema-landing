"use client";

import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  split,
} from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";
import { useMemo } from "react";
import { graphqlHttpUrl, graphqlWsUrl } from "@/lib/graphql-env";

const AUTH_HEADER_KEY = "kanema_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_HEADER_KEY);
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(AUTH_HEADER_KEY, token);
  else localStorage.removeItem(AUTH_HEADER_KEY);
}

function makeClient() {
  const authLink = new ApolloLink((operation, forward) => {
    const token = getStoredToken();
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    }));
    return forward(operation);
  });

  const httpLink = authLink.concat(
    new HttpLink({
      uri: graphqlHttpUrl(),
      credentials: "include",
    })
  );

  const wsLink =
    typeof window !== "undefined"
      ? new GraphQLWsLink(
          createClient({
            url: graphqlWsUrl(),
            connectionParams: () => {
              const token = getStoredToken();
              return token ? { Authorization: `Bearer ${token}` } : {};
            },
            retryAttempts: 5,
          })
        )
      : null;

  const link =
    wsLink != null
      ? split(
          ({ query }) => {
            const def = getMainDefinition(query);
            return (
              def.kind === "OperationDefinition" &&
              def.operation === "subscription"
            );
          },
          wsLink,
          httpLink
        )
      : httpLink;

  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });
}

export function ElectionApolloProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = useMemo(() => makeClient(), []);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
