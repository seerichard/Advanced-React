import React from 'react';
import PropTypes from 'prop-types';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import styled from 'styled-components';

const AnimationStyles = styled.span`
  position: relative;
  .count {
    display: block;
    position: relative;
    transition: all 0.4s;
    backface-visibility: hidden; /* Overlay old component with new component */
  }

  /* Initial state of the Dot */
  .count-enter {
    transform: scale(4) rotateX(0.5turn); /* 1 turn = 360 degrees */
  }

  .count-enter-active {
    transform: rotateX(0);
  }

  .count-exit {
    top: 0;
    position: absolute;
    transform: rotateX(0);
  }

  .count-exit-active {
    transform: scale(4) rotateX(0.5turn);
  }
`;

const Dot = styled.div`
  background: ${props  => props.theme.red};
  color: white;
  border-radius: 0.5rem;
  line-height: 2rem;
  min-width: 3rem;
  margin-left: 1rem;
  font-weight: 100;
  font-feature-settings: 'tnum'; /* To make the number monospaced (tabular) */
  font-variant-numeric: tabular-nums;
`;

const CartCount = ({ count }) => (
  <AnimationStyles>
    <TransitionGroup>
      <CSSTransition
        key={count}
        className="count"
        classNames="count"
        timeout={{
          enter: 400,
          exit: 400
        }}
        unmountOnExit
      >
        <Dot>{count}</Dot>
      </CSSTransition>
    </TransitionGroup>
  </AnimationStyles>
);

CartCount.propTypes = {
  count: PropTypes.number.isRequired
}

export default CartCount;