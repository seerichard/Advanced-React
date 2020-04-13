import React, { Component } from 'react'
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import Item from './Item';

// Recommended by Apollo devs - keep query in the same file unless used by multiple components
const ALL_ITEMS_QUERY = gql`
  # Named query with the same name as the constant
  query ALL_ITEMS_QUERY {
    items {
      id
      title
      price
      description
      image
      largeImage
    }
  }
`;

const Center = styled.div`
  text-align: center;
`;

const ItemsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 60px;
  max-width: ${props => props.theme.maxWidth}; /* From global theme provider in Page.js */
  margin: 0 auto;
`;

class Items extends Component {
  render() {
    return (
      <Center>
        <p>Items!</p>
        {/* Query render prop. The preferred way over HOC */}
        {/* The ONLY child of a Query component is a function */}
        <Query query={ALL_ITEMS_QUERY}>
          {({ data, error, loading }) => {
            console.log(data)
            console.log(error)
            console.log(loading)

            if (loading) return <p>Loading...</p>
            if (error) return <p>Error: {error.message}</p>
            return (
              <ItemsList>
                {data.items.map(item => <Item key={item.id} item={item} />)}
              </ItemsList>
            )
          }}
        </Query>
      </Center>
    )
  }
}

export default Items;
export { ALL_ITEMS_QUERY };