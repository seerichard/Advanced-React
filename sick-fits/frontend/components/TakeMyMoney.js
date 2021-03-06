import React from 'react';
import gql from 'graphql-tag';
import Router from 'next/router';
import { Mutation } from 'react-apollo';
import User, { CURRENT_USER_QUERY } from './User';
import StripeCheckout from 'react-stripe-checkout';
import NProgress from 'nprogress';
import calcTotalPrice from '../lib/calcTotalPrice';

// Example Card (https://stripe.com/docs/testing)
// NUMBER	          BRAND	CVC	          DATE
// 4242424242424242	Visa 	Any 3 digits  Any future date

const stripeKey = 'pk_test_Pde0otdJElCW1fNXzrO24cXQ';

export const CREATE_ORDER_MUTATION = gql`
  mutation createOrder($token: String!) {
    createOrder(token: $token) {
      id
      charge
      total
      items {
        id
        title
      }
    }
  }
`;

function totalItems(cart) {
  return cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0);
}

class TakeMyMoney extends React.Component {
  onToken = async (res, createOrder) => {
    // Start the loader
    NProgress.start();

    // Manually call the mutation once we have the stripe token
    const order = await createOrder({
      variables: {
        token: res.id
      }
    }).catch(err => {
      alert(err.message)
    });

    // Send the user to the Order page
    Router.push({
      pathname: '/order',
      query: { id: order.data.createOrder.id } // Pass a query param
    });
  }

  render() {
    return (
      <User>
        {({ data: { me }, loading }) => {
          if (loading) return null;
          
          return (
            <Mutation
              mutation={CREATE_ORDER_MUTATION}
              refetchQueries={[
                { query: CURRENT_USER_QUERY } // When mutation is complete, will run all queries in the array
              ]}
            >
              {(createOrder) => (
                <StripeCheckout
                  amount={calcTotalPrice(me.cart)}
                  name="Sick Fits"
                  description={`Order of ${totalItems(me.cart)} items`}
                  image={me.cart.length && me.cart[0].item && me.cart[0].item.image}
                  stripeKey={stripeKey}
                  currency="USD"
                  email={me.email}
                  token={res => this.onToken(res, createOrder)}
                >
                  {this.props.children}
                </StripeCheckout>
              )}
            </Mutation>
          );
        }}
      </User>
    )
  }
}

export default TakeMyMoney;