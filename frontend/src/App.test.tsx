import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders home page heading', () => {
  render(<App />);
  const heading = screen.getByText(/Find the Best Fuel Prices Near You/i);
  expect(heading).toBeInTheDocument();
});
