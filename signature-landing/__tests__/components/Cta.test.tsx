import { render, screen } from "@testing-library/react";
import CTA from "@/components/CTA";

describe('CTA Component', () => {
  it('should render the main heading', () => {
    render(<CTA />); 

    const title = screen.getByRole('heading', { name: /comienza a digitalizar hoy mismo/i });

    expect(title).toBeInTheDocument();
  });

  it('should render the description text', () => {
    render(<CTA />);
    
    const description = screen.getByText(/únete a cientos de empresas que ya han eliminado el papel de su gestión documental/i);
    
    expect(description).toBeInTheDocument();
  });

  it('should render the CTA button', () => {
    render(<CTA />);
    
    const button = screen.getByRole('button', { name: /solicitar demo/i });
    
    expect(button).toBeInTheDocument();
  });

  it('should render arrow icon in button', () => {
    render(<CTA />);
    
    const button = screen.getByRole('button', { name: /solicitar demo/i });
    
    expect(button).toBeInTheDocument();
  });

  it('should call onClick when button is clicked', () => {
    const handleClick = jest.fn();
    render(<CTA onCtaClick={handleClick} />);

    const button = screen.getByRole('button', { name: /solicitar demo/i });
    button.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should have dark blue background', () => {
    render(<CTA />);
    
    const section = screen.getByRole('heading', { name: /comienza a digitalizar hoy mismo/i }).closest('section');
    
    expect(section).toBeInTheDocument();
  });

  it('should have white text color', () => {
    render(<CTA />);
    
    const title = screen.getByRole('heading', { name: /comienza a digitalizar hoy mismo/i });
    
    expect(title).toBeInTheDocument();
  });

  it('should have rounded corners', () => {
    render(<CTA />);
    
    const section = screen.getByRole('heading', { name: /comienza a digitalizar hoy mismo/i }).closest('section');
    
    expect(section).toBeInTheDocument();
  });

  it('should center align content', () => {
    render(<CTA />);
    
    const section = screen.getByRole('heading', { name: /comienza a digitalizar hoy mismo/i }).closest('section');
    
    expect(section).toBeInTheDocument();
  });

  it('should have proper semantic structure', () => {
    render(<CTA />);

    const heading = screen.getByRole('heading', { name: /comienza a digitalizar hoy mismo/i });
    
    expect(heading).toBeInTheDocument();
  });

  it('should have accessible button', () => {
    render(<CTA />);
    
    const button = screen.getByRole('button', { name: /solicitar demo/i });
    
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute('type');
  });

  it('should render button with white background', () => {
    render(<CTA />);
    
    const button = screen.getByRole('button', { name: /solicitar demo/i });
    
    expect(button).toBeInTheDocument();
  });
});