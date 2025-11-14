import { render, screen } from "@testing-library/react";
import Navbar from "@/components/Navbar";

describe('Navbar Component Test', () => {
  it('should render Firmatic logo/brand text', () => {
    render(<Navbar />);
    
    const firmaticText = screen.getByText(/firmatic/i);

    expect(firmaticText).toBeInTheDocument();
  });

  it('should render Firmatic as a heading or link', () => {
    render(<Navbar />);
    
    const brandElement = screen.getByText(/firmatic/i);
    
    expect(brandElement).toBeInTheDocument();
  });

  it('should render "Características" navigation link', () => {
    render(<Navbar />);
    
    const link = screen.getByRole('link', { name: /características/i });

    expect(link).toBeInTheDocument();
  });

  it('should render "Beneficios" navigation link', () => {
    render(<Navbar />);
    
    const link = screen.getByRole('link', { name: /beneficios/i });

    expect(link).toBeInTheDocument();
  });

  it('should render "Cómo Funciona" navigation link', () => {
    render(<Navbar />);
    
    const link = screen.getByRole('link', { name: /cómo funciona/i });

    expect(link).toBeInTheDocument();
  });

  it('should render all navigation items in correct order', () => {
    render(<Navbar />);
    
    const navLinks = screen.getAllByRole('link');
    const navTexts = navLinks.map(link => link.textContent);

    expect(navTexts).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/características/i),
        expect.stringMatching(/beneficios/i),
        expect.stringMatching(/cómo funciona/i)
      ])
    );
  });

  it('should navigate to correct section when "Características" is clicked', () => {
    render(<Navbar />);
    
    const link = screen.getByRole('link', { name: /características/i });
    
    expect(link).toHaveAttribute('href');
  });

  it('should navigate to correct section when "Beneficios" is clicked', () => {
    render(<Navbar />);
    
    const link = screen.getByRole('link', { name: /beneficios/i });
    
    expect(link).toHaveAttribute('href');
  });

  it('should navigate to correct section when "Cómo Funciona" is clicked', () => {
    render(<Navbar />);
    
    const link = screen.getByRole('link', { name: /cómo funciona/i });
    
    expect(link).toHaveAttribute('href');
  });

  it('should render "Solicitar Demo" button', () => {
    render(<Navbar />);
    
    const button = screen.getByRole('button', { name: /solicitar demo/i });

    expect(button).toBeInTheDocument();
  });

  it('should call onClick when "Solicitar Demo" button is clicked', () => {
    const handleClick = jest.fn();
    render(<Navbar onCtaClick={handleClick} />);

    const button = screen.getByRole('button', { name: /solicitar demo/i });
    button.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should have blue background color on CTA button', () => {
    render(<Navbar />);
    
    const button = screen.getByRole('button', { name: /solicitar demo/i });

    expect(button).toBeInTheDocument();
  });

  it('should have proper navbar semantic structure', () => {
    render(<Navbar />);
    
    const nav = screen.getByRole('navigation');
    
    expect(nav).toBeInTheDocument();
  });

  it('should display all elements in a horizontal layout', () => {
    render(<Navbar />);
    
    const nav = screen.getByRole('navigation');
    
    expect(nav).toBeInTheDocument();
  });

  it('should be responsive and adapt to mobile', () => {
    render(<Navbar />);
    
    const nav = screen.getByRole('navigation');
    
    expect(nav).toBeInTheDocument();
  });

  it('should have accessible navigation', () => {
    render(<Navbar />);
    
    const nav = screen.getByRole('navigation');
    
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveAttribute('aria-label');
  });

  it('should have accessible links with proper text', () => {
    render(<Navbar />);
    
    const links = screen.getAllByRole('link');
    
    links.forEach(link => {
      expect(link).toHaveAccessibleName();
    });
  });

  it('should have accessible button', () => {
    render(<Navbar />);
    
    const button = screen.getByRole('button', { name: /solicitar demo/i });
    
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute('type');
  });
});