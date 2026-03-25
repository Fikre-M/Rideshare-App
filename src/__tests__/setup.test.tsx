
import React from 'react';
import { render, screen } from '@testing-library/react';
import "@testing-library/jest-dom";

describe('Test Setup', () => {
  it('renders a simple component', () => {
    render(<div data-testid="test">Hello, Jest!</div>);
    expect(screen.getByTestId('test')).toHaveTextContent('Hello, Jest!');
  });

  it('mocks localStorage', () => {
    localStorage.setItem('test', 'value');
    expect(localStorage.getItem('test')).toBe('value');
  });

  // it('mocks matchMedia', () => {
  //   expect(window.matchMedia('(max-width: 600px)').matches).toBe(false);
  // });
});
