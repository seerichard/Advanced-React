import React, { Component } from 'react'
import Head from 'next/head';
import styled from 'styled-components';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Error from './ErrorMessage';

const SingleItemStyles = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  box-shadow: ${props  => props.theme.bs};
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  min-height: 800px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .details {
    margin: 3rem;
    font-size: 2rem;
  }
`;

export const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      description
      largeImage
    }
  }
`;

class SingleItem extends Component {
  render() {
    return (
      <Query
        query={SINGLE_ITEM_QUERY}
        variables={{
          id: this.props.id
        }}
      >
        {({ error, loading, data }) => {
          if (error) return <Error error={error} />
          if (loading) return <p>Loading...</p>
          if (!data.item) return <p>No Item Found For {this.props.id} </p>

          const item = data.item;

          return (
            <SingleItemStyles>
              {/* Next.js Head tag */}
              {/* Allows us to create a side effect by altering the head at any point in the application */}
              {/* Next.js will collect all the Heads and combine into one at render */}
              {/* At this point in the app, can change the title and customise it */}
              <Head>
                <title>Sick Fits | {item.title} </title>
              </Head>
              <img src={item.largeImage} alt={item.title} />
              <div className="details">
                <h2>Viewing {item.title}</h2>
                <p>{item.description}</p>
              </div>
            </SingleItemStyles>
          )
        }}
      </Query>
    )
  }
}

export default SingleItem;