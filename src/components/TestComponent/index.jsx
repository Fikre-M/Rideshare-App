import React from 'react';
import PropTypes from 'prop-types';

const TestComponent = ({ text }) => {
  return (
    <div data-testid="test-component">
      <h1>{text}</h1>
    </div>
  );
};

TestComponent.propTypes = {
  text: PropTypes.string.isRequired,
};

export default TestComponent;
