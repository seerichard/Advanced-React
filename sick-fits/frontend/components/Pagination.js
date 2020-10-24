import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Query } from 'react-apollo'
import gql from 'graphql-tag';
import PaginationStyles from './styles/PaginationStyles';
import { perPage } from '../config';

export const PAGINATION_QUERY = gql`
  query PAGINATION_QUERY {
    itemsConnection {
      aggregate {
        count
      }
    }
  }
`;

const Pagination = ({ page }) => (
  <Query query={PAGINATION_QUERY}>
    {({ data, loading, error }) => {
      if (loading) return <p>Loading...</p>;

      const count = data.itemsConnection.aggregate.count;
      const pages = Math.ceil(count / perPage);

      return (
        <PaginationStyles data-test="pagination">
          <Head>
            <title>
              Sick Fits! - Page {page} of {pages}
            </title>
          </Head>
          <Link
            prefetch // In production, will prefetch previous and next page. Does not work in dev mode
            href={{
              pathname: 'items',
              query: { page: page - 1}
            }}
          >
            <a
              className="prev"
              aria-disabled={page <= 1}
            >← Prev</a>
          </Link>
          <p>
            Page {page} of
            <span className="totalPages">{pages}</span>!
          </p>
          <p>{count} Items Total</p>
          <Link
            prefetch // In production, will prefetch previous and next page. Does not work in dev mode
            href={{
              pathname: 'items',
              query: { page: page + 1}
            }}
          >
            <a
              className="next"
              aria-disabled={page >= pages}
            >Next →</a>
          </Link>
        </PaginationStyles>
      )
    }}
  </Query>
);

export default Pagination;