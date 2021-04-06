import React from "react";
import { gql, useQuery } from "@apollo/client";

const PERSON = gql`
  query Person($id: ID) {
    person(id: $id) {
      id
      name
      skills @client {
        personId
        jump
      }
    }
  }
`;

export default function Person({
  id
}) {
  const {
    loading,
    data,
  } = useQuery(
    PERSON,
    {
      variables: {
        id
      }
    }
  );

  if (loading) {
    return 'loading...'
  }

  if (!data?.person) {
    return 'no data'
  }

  return `${data.person.name} - Jump:${data.person.skills?.jump ?? ''}`
}