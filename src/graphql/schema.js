import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLID,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
} from 'graphql';

const PersonSkillsType = new GraphQLObjectType({
  name: 'PersonSkills',
  fields: {
    personId: { type: GraphQLID },
    jump: { type: GraphQLInt },
  },
});

const PersonType = new GraphQLObjectType({
  name: 'Person',
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    skills: { type: PersonSkillsType },
  },
});

const database = [
  { id: 1, name: 'John Smith' },
  { id: 2, name: 'Sara Smith' },
  { id: 3, name: 'Budd Deey' },
];

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    people: {
      type: new GraphQLList(PersonType),
      resolve: () => database,
    },
    person: {
      type: PersonType,
      args: { 
        id: { type: GraphQLID }
      },
      resolve: (
        existing,
        args
      ) => {
        const index = Number(args.id) - 1;

        return database[index]
      },
    },
  },
});

const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addPerson: {
      type: PersonType,
      args: { 
        name: { type: GraphQLString },
        jump: { type: GraphQLInt },
      },
      resolve: function (_, { name, jump }) {
        const id = database[database.length - 1].id + 1

        const person = {
          __typename: 'Person',
          id,
          name,
          skills: {
            __typename: 'PersonSkills',
            id,
            jump
          }
        };

        database.push(person);
        return person;
      }
    },
  },
});

export const schema = new GraphQLSchema({ query: QueryType, mutation: MutationType });
