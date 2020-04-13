import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Router from 'next/router';
import Form from './styles/Form';
import formatMoney from '../lib/formatMoney';
import ErrorMessage from './ErrorMessage';

const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION(
    $title: String!
    $description: String!
    $image: String
    $largeImage: String
    $price: Int!
  ) {
    createItem(
      title: $title,
      description: $description,
      image: $image,
      largeImage: $largeImage,
      price: $price
    ) {
      id
    }
  }
`;

class CreateItem extends Component {
  state = {
    title: '',
    description: '',
    image: '',
    largeImage: '',
    price: 0
  }

  // Arrow function as an instance property
  // Mean we can access 'this'
  // ES6 functions do not auto bind Regular Functions - handleChange() {}
  // Would require a constructor
  handleChange = (event) => {
    const { name, type, value } = event.target;
    const val = (type === 'number') ? parseFloat(value) : value; // Coerce the value into a number if of type number
    this.setState({ [name]: val });
  }
 
  render() {
    return (
      // Only child of a Mutation can be a function
      <Mutation
        mutation={CREATE_ITEM_MUTATION}
        variables={this.state} // Pass all required variables during run time
      >
        {/* (mutationFunction, payload) */}
        {(createItem, { loading, error }) => (
          <Form onSubmit={async event => {
            event.preventDefault();

            // Call the mutation
            const res = await createItem();
            
            // Return to single item page
            Router.push({
              pathname: '/item',
              query: { id: res.data.createItem.id }
            })
          }}>
            <ErrorMessage error={error} />
            <fieldset disabled={loading} aria-busy={loading}>
              <label htmlFor="title">
                Title
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Title"
                  required
                  value={this.state.title}
                  onChange={this.handleChange}
                />
              </label>
              <label htmlFor="price">
                Price
                <input
                  type="number"
                  id="price"
                  name="price"
                  placeholder="Price"
                  required
                  value={this.state.price}
                  onChange={this.handleChange}
                />
              </label>
              <label htmlFor="description">
                Description
                <textarea
                  id="description"
                  name="description"
                  placeholder="Enter A Description"
                  required
                  value={this.state.description}
                  onChange={this.handleChange}
                />
              </label>
              <button type="submit">Submit</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

export default CreateItem;
export { CREATE_ITEM_MUTATION };