// No need to import React, Next.js handles it automatically
import PleaseSignIn from '../components/PleaseSignIn';
import Permissions from '../components/Permissions';

const PermissionsPage = () => (
  <div>
    <PleaseSignIn>
      <Permissions />
    </PleaseSignIn>
  </div>
);

export default PermissionsPage;