import React, { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import Person from './Person';

const ALL_PEOPLE = gql`
  query AllPeople {
    people {
      id
    }
  }
`;

const ADD_PERSON = gql`
  mutation AddPerson($name: String, $jump: Int) {
    addPerson(name: $name, jump: $jump) {
      id
      name
      skills @client {
        id
        jump
      }
    }
  }
`;

export default function App() {
  const [name, setName] = useState('');
  const [jump, setJump] = useState(1);
  const {
    loading,
    data,
  } = useQuery(ALL_PEOPLE);

  /**
   * Also doesn't add cache/normalization to any new skills entries
   */
  const [addPerson] = useMutation(ADD_PERSON, {
    optimisticResponse: {
      addPerson: {
        __typename: 'Person',
        id: Number(data?.people[data?.people.length - 1].id) + 1,
        name,
        skills: {
          __typename: 'PersonSkills',
          personId: Number(data?.people[data?.people.length - 1].id) + 1,
          jump
        }
      }
    },
    update: (
      cache,
      {
        data: {
          addPerson: addPersonData
        }
      }
    ) => {
      const peopleResult = cache.readQuery({ query: ALL_PEOPLE });

      /**
       * Doesn't add cache/normalization to any new skills entries
       * (Does trigger merge function in mutation field policy)
       */
      cache.writeQuery({
        query: ALL_PEOPLE,
        data: {
          ...peopleResult,
          people: [
            ...peopleResult.people,
            addPersonData,
          ],
        },
      });
    },
    variables: {
      id: Number(data?.people[data?.people.length - 1].id) + 1
    }
  });

  const onClick = () => {
    addPerson({
      variables: {
        name,
        jump: jump ? Number(jump) ?? 1 : 1
      }
    });

    setName('');
    setJump(1);
  }

  return (
    <main>
      <h1>Apollo Client Issue Reproduction</h1>
      <p>
        This application can be used to demonstrate an error in Apollo Client.
      </p>
      <div className="add-person">
        <label htmlFor="name">Name</label>
        <input 
          type="text" 
          name="name" 
          value={name}
          onChange={evt => setName(evt.target.value)}
        />
        <input 
          type="number" 
          name="jump" 
          value={jump}
          onChange={evt => setJump(evt.target.value)}
        />
        <button
          onClick={onClick}
        >
          Add person
        </button>
      </div>
      <h2>Names</h2>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <ul>
          {data?.people.map(person => (
            <li key={person.id}><Person id={Number(person.id)} /></li>
          ))}
        </ul>
      )}
    </main>
  );
}
