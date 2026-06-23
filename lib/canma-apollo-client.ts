import {
  ApolloClient,
  createHttpLink,
  HttpLink,
  InMemoryCache,
  split,
} from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";
import { graphqlHttpUrl, graphqlWsUrl } from "@/lib/graphql-env";

/** Apollo Client 4 requires an initial link; overwritten on first binder pass via {@link configureCanmaApolloLink}. */
export function createCanmaApolloClient(): ApolloClient {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: graphqlHttpUrl(),
      credentials: "include",
    }),
    defaultOptions: {
      watchQuery: { fetchPolicy: "no-cache" },
      query: { fetchPolicy: "no-cache" },
      mutate: { fetchPolicy: "no-cache" },
    },
  });
}

/**
 * Lela-platform-internet-facing style: rebuild the link on each binder render so
 * `graphqlHttpUrl()` / auth headers stay current (no stale HttpLink closure).
 */
export function configureCanmaApolloLink(
  client: ApolloClient,
  authToken: string | null,
): void {
  const bearer = authToken?.trim();

  const httpLink = createHttpLink({
    uri: graphqlHttpUrl(),
    credentials: "include",
    headers: bearer ? { authorization: `Bearer ${bearer}` } : {},
  });

  const wsLink =
    typeof window !== "undefined"
      ? new GraphQLWsLink(
          createClient({
            url: graphqlWsUrl(),
            connectionParams: () =>
              bearer ? { Authorization: `Bearer ${bearer}` } : {},
            retryAttempts: 5,
          }),
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
          httpLink,
        )
      : httpLink;

  client.setLink(link);
}
