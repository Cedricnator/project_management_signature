import Home from '@/app/page';
import { render, screen } from '@testing-library/react'

describe('Landing Page Test', () => {
  it('renders something', () => {
    expect(true).toBe(true);
  });

  it('should render the header text', () => {
    render(<Home />);

    const headerText = 'Gestión de documentos sin papel'

    const heading = screen.getByRole('heading', { name: headerText });

    expect(heading).toBeInTheDocument();
  })
})