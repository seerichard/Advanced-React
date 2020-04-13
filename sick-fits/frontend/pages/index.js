// No need to import React, Next.js handles it automatically
// Link bound to HTML5 push state
import Link from 'next/link';
import Items from '../components/Items'

const Home = () => (
  <div>
    <Items />
  </div>
);

export default Home;