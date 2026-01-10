import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TestComponent from '../index';

describe('TestComponent', () => {
  it('renders the provided text', () => {
    const testText = 'Hello, Testing!';
    render(<TestComponent text={testText} />);
    
    const element = screen.getByTestId('test-component');
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent(testText);
  });

  it('renders with default props', () => {
    const testText = 'Default Text';
    render(<TestComponent text={testText} />);
    
    const element = screen.getByTestId('test-component');
    expect(element).toHaveTextContent(testText);
  });
});
