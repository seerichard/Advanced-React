import React from 'react';
import Router from 'next/router';
import Downshift, { resetIdCounter } from 'downshift';
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

const routeToItem = (item) => {
  Router.push({
    pathname: '/item',
    query: {
      id: item.id
    }
  })
}

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
    const { loading, items } = this.state;

    resetIdCounter(); // For aria warning

    return (
      <SearchStyles>
        <Downshift
          onChange={routeToItem}
          itemToString={item => (item === null ? '' : item.title)}
        >
          {({ getInputProps, getItemProps, isOpen, inputValue, highlightedIndex }) => (
            <div>
              {/* Exposes the Apollo client */}
              <ApolloConsumer>
                {client => (
                  <input
                    {...getInputProps({
                      id: 'search',
                      type: "search",
                      placeholder: 'Search For An Item',
                      className: loading ? 'loading': undefined,
                      onChange: e => {
                        e.persist(); // Allows persistence across async events
                        this.onChange(e, client);
                      }
                    })}
                  />
                )}
              </ApolloConsumer>
              {/* isOpen adds functionality for when you click away from dropdown to auto close */}
              {isOpen && (
                <DropDown>
                  {items.map((item, index) => (
                    <DropDownItem
                      key={item.id}
                      {...getItemProps({ item })}
                      highlighted={index === highlightedIndex}
                    >
                      <img
                        width="50"
                        src={item.image}
                        alt={item.title}
                      />
                      {item.title}
                    </DropDownItem>
                  ))}
                  {!items.length && !loading && (
                    <DropDownItem>
                      Nothing found for {inputValue}
                    </DropDownItem>
                  )}
                </DropDown>
              )}
            </div>
          )}
        </Downshift>
      </SearchStyles>
    )
  }
};

export default AutoComplete;