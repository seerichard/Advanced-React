import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import Router from 'next/router';
import { Mutation } from 'react-apollo';
import User, { CURRENT_USER_QUERY } from './User';
import StripeCheckout from 'react-stripe-checkout';
import NProgress from 'nprogress';
import calcTotalPrice from '../lib/calcTotalPrice';
import Error from './ErrorMessage';

// Example Card (https://stripe.com/docs/testing)
// NUMBER	          BRAND	CVC	          DATE
// 4242424242424242	Visa 	Any 3 digits  Any future date

const stripeKey = 'Fill me in';

function totalItems(cart) {
  return cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0);
}

class TakeMyMoney extends React.Component {
  onToken = (res) => {
    console.log('On Token');
    console.log(res);
  }

  render() {
    return (
      <User>
        {({ data: { me } }) => 
          <StripeCheckout
            amount={calcTotalPrice(me.cart)}
            name="Sick Fits"
            description={`Order of ${totalItems(me.cart)} items`}
            image={me.cart[0].item && me.cart[0].item.image}
            stripeKey={stripeKey}
            currency="USD"
            email={me.email}
            token={res => this.onToken(res)}
          >
            {this.props.children}
          </StripeCheckout>}
      </User>
    )
  }
}

export default TakeMyMoney;