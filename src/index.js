import React from "react";
import { render } from "react-dom";
import { ApolloClient, gql, InMemoryCache, ApolloProvider } from "@apollo/client";

import { link } from "./graphql/link";
import App from "./App";

import "./index.css";

const PersonSkillsFragment = gql`
	fragment PersonSkills on PersonSkills {
		id
    jump
	}
`;

const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Mutation: {
        fields: {
          addPerson: {
            merge (
              existingPerson,
              newPerson,
              {
                args,
                cache,
                variables
              }
            ) {
              /* Called by optimisticResponse and actual response */

              console.log('merge', existingPerson, newPerson, variables);

              const personId = Number(variables.id);

              const data = {
                __typename: 'PersonSkills',
                personId,
                jump: args?.jump
              };

              /**
               * The following does nothing in my application but works here
               */
              cache.writeFragment({
                data,
                fragment: PersonSkillsFragment,
                fragmentName: 'PersonSkills',
                id: cache.identify({
                  __typename: 'PersonSkills',
                  personId
                })
              });
            }
          }
        },
        mutationType: true
      },
      PersonSkills: {
        keyFields: ['personId']
      },
      Person: {
        fields: {
          skills: {
            read (
              existing,
              {
                args,
                cache,
                canRead,
                toReference,
                variables
              }
            ) {
              if (existing) {
                return existing;
              }

					    const personId = args?.id || variables?.id || null;

              let ref = toReference({
                __typename: 'PersonSkills',
                personId
              })

              if (canRead(ref)) {
                return ref;
              }

              const data = {
                __typename: 'PersonSkills',
                personId,
                jump: 1
              };

              /**
               * A way to force caching/normalization
               * 
               * For some reason in my project I have to wrap this in a try/catch
               * Otherwise it fails with error "already recomputing" but
               * works here if tried without...
               */
              /*
              ref = cache.writeFragment({
                data,
                fragment: PersonSkillsFragment,
                fragmentName: 'PersonSkills',
                id: cache.identify({
                  __typename: 'PersonSkills',
                  id
                })
              });

              if (canRead(ref)) {
                return ref;
              }
              */

              /**
               * I expected the following to be cached/normalized
               * or returning the ref
               */
              return data
            }
          }
        }
      }
    }
  }),
  link
});

render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);
