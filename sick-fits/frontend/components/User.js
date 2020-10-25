import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';

const CURRENT_USER_QUERY = gql`
  query {
    me {
      id
      email
      name
      permissions
      orders {
        id
      }
      cart {
        id
        quantity
        item {
          id
          title
          description
          image
          price
        }
      }
    }
  }
`;

// Allow the component that requires user data to simply be wrapped in this component
// No need to repeatedly wrap each component in the me query
const User = props => (
  // Pass down any props by spreading
  <Query {...props} query={CURRENT_USER_QUERY} >
    {payload => props.children(payload)}
  </Query>
);

User.propTypes = {
  children: PropTypes.func.isRequired
}

export default User;
export { CURRENT_USER_QUERY };