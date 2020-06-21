// No need to import React, Next.js handles it automatically
import Reset from '../components/Reset';

const ResetPage = props => (
  <div>
    <p>Reset You Password</p>
    <Reset resetToken={props.query.resetToken} />
  </div>
);

export default ResetPage;