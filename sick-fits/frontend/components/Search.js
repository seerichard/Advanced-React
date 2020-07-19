import React from 'react';
import Router from 'downshift';
import Downshift from 'downshift';
import { ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import debounce from 'lodash.debounce';
import { DropDown, DropDownItem, SearchStyles } from './styles/DropDown';

const SEARCH_ITEMS_QUERY = gql`
  query SEARCH_ITEMS_QUERY($searchTerm: String!) {
    items(where: {
      OR:  [
        { title_contains:  $searchTerm },
        { description_contains: $searchTerm }
      ]
    }) {
      id
      image
      title
    }
  }
`;

class AutoComplete extends React.Component {
  state = {
    items: [],
    loading: false 
  }

  onChange = debounce(
    async (e, client) => {
      // Turn loading on
      this.setState({ loading: true });

      // Manually query the Apollo client
      const res = await client.query({
        query: SEARCH_ITEMS_QUERY,
        variables: { searchTerm: e.target.value }
      });

      this.setState({
        loading: false,
        items: res.data.items
      })
    }, 350
  );

  render() {
    return (
      <SearchStyles>
        <div>
          {/* Exposes the Apollo client */}
          <ApolloConsumer>
            {client => (
              <input
                type="search"
                onChange={e => {
                  e.persist(); // Allows persistence across async events
                  this.onChange(e, client);
                }}
              />
            )}
          </ApolloConsumer>
          <DropDown>
            {this.state.items.map(({ id, image, title }) => (
              <DropDownItem key={id} >
                <img
                  width="50"
                  src={image}
                  alt={title}
                />
                {title}
              </DropDownItem>
            ))}
          </DropDown>
        </div>
      </SearchStyles>
    )
  }
};

export default AutoComplete;