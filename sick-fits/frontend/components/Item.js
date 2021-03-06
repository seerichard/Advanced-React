import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import DeleteItem from '../components/DeleteItem';
import AddToCart from '../components/AddToCart'
import Title from './styles/Title';
import ItemStyles from './styles/ItemStyles';
import PriceTag from './styles/PriceTag';
import formatMoney from '../lib/formatMoney';

export default class Item extends Component {
  static propTypes = {
    item: PropTypes.object.isRequired
  }

  render() {
    const { item } = this.props;

    return (
      <ItemStyles>
        {item.image && <img src={item.image} alt={item.title} />}
        <Title>
          {/* To pass an object literal (an actual object), use double curly braces */}
          <Link href={{
            pathname: 'item',
            query: { id: item.id }
          }}>
            <a>{item.title}</a>
          </Link>
        </Title>
        <PriceTag>{formatMoney(item.price)}</PriceTag>
        <p>{item.description}</p>
        <div className="buttonList">
          <Link
            href={{
              pathname: 'update',
              query: { id: item.id }
            }}
          >
            <a>Edit</a>
          </Link>
          <AddToCart id={item.id} />
          <DeleteItem id={item.id} >Delete This Item</DeleteItem>
        </div>
      </ItemStyles>
    )
  }
}
