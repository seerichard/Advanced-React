import React, { Component } from 'react'
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import Item from './Item';
import Pagination from './Pagination';
import { perPage } from '../config';

// Recommended by Apollo devs - keep query in the same file unless used by multiple components
const ALL_ITEMS_QUERY = gql`
  # Named query with the same name as the constant
  query ALL_ITEMS_QUERY($skip: Int = 0, $first: Int = ${perPage}) {
    items(first: $first, skip: $skip, orderBy: createdAt_DESC) {
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
        <Pagination page={this.props.page} />
          {/* Query render prop. The preferred way over HOC */}
          {/* The ONLY child of a Query component is a function */}
          <Query
            query={ALL_ITEMS_QUERY}
            variables={{
              skip: this.props.page * perPage - perPage
            }}
            // fetchPolicy="network-only" // Will fetch every time. One way of updating the cache. Not efficient
          >
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
        <Pagination page={this.props.page} />
      </Center>
    )
  }
}

export default Items;
export { ALL_ITEMS_QUERY };