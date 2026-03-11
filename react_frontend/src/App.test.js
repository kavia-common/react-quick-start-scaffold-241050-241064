import { render, screen } from '@testing-library/react';
import App from './App';

test('renders todo console heading', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /to‑do console/i });
  expect(heading).toBeInTheDocument();
});
