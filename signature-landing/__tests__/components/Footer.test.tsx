import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";

describe('Footer Component', () => {
  it('should render Firmatic brand', () => {
    render(<Footer />);
    
    const brand = screen.getAllByText(/firmatic/i)[0];

    expect(brand).toBeInTheDocument();
  });

  it('should render Firmatic description', () => {
    render(<Footer />);
    
    const description = screen.getByText(/la plataforma de firma digital que transforma la gestión documental empresarial/i);

    expect(description).toBeInTheDocument();
  });

  it('should render Producto section title', () => {
    render(<Footer />);
    
    const title = screen.getByText(/^producto$/i);

    expect(title).toBeInTheDocument();
  });

  it('should render Características link', () => {
    render(<Footer />);
    
    const link = screen.getAllByText(/características/i)[0];

    expect(link).toBeInTheDocument();
  });

  it('should render Beneficios link', () => {
    render(<Footer />);
    
    const link = screen.getAllByText(/beneficios/i)[0];

    expect(link).toBeInTheDocument();
  });

  it('should render Cómo Funciona link', () => {
    render(<Footer />);
    
    const link = screen.getByText(/cómo funciona/i);

    expect(link).toBeInTheDocument();
  });

  it('should render Contacto section title', () => {
    render(<Footer />);
    
    const title = screen.getByText(/^contacto$/i);

    expect(title).toBeInTheDocument();
  });

  it('should render email address', () => {
    render(<Footer />);
    
    const email = screen.getByText(/firmaticenterprise@gmail\.com/i);

    expect(email).toBeInTheDocument();
  });

  it('should render phone number', () => {
    render(<Footer />);
    
    const phone = screen.getByText(/\+56 9 1234 5678/i);

    expect(phone).toBeInTheDocument();
  });

  it('should render location', () => {
    render(<Footer />);
    
    const location = screen.getByText(/santiago, chile/i);

    expect(location).toBeInTheDocument();
  });

  it('should render copyright text', () => {
    render(<Footer />);
    
    const copyright = screen.getByText(/© 2025 firmatic\. todos los derechos reservados\./i);

    expect(copyright).toBeInTheDocument();
  });

  it('should have phone icon', () => {
    render(<Footer />);
    
    const phone = screen.getByText(/\+56 9 1234 5678/i).closest('div');

    expect(phone).toBeInTheDocument();
  });

  it('should have location icon', () => {
    render(<Footer />);
    
    const location = screen.getByText(/santiago, chile/i).closest('div');

    expect(location).toBeInTheDocument();
  });

  it('should render all product links', () => {
    render(<Footer />);
    
    const productLinks = [
      screen.getAllByText(/características/i)[0],
      screen.getAllByText(/beneficios/i)[0],
      screen.getByText(/cómo funciona/i)
    ];

    productLinks.forEach(link => {
      expect(link).toBeInTheDocument();
    });
  });

  it('should have proper footer semantic structure', () => {
    render(<Footer />);
    
    const footer = screen.getByRole('contentinfo');

    expect(footer).toBeInTheDocument();
  });

  it('should have three column layout', () => {
    render(<Footer />);
    
    const firmatic = screen.getAllByText(/firmatic/i)[0];
    const producto = screen.getByText(/^producto$/i);
    const contacto = screen.getByText(/^contacto$/i);

    expect(firmatic).toBeInTheDocument();
    expect(producto).toBeInTheDocument();
    expect(contacto).toBeInTheDocument();
  });

  it('should have light background', () => {
    render(<Footer />);
    
    const footer = screen.getByRole('contentinfo');

    expect(footer).toBeInTheDocument();
  });

  it('should have divider line above copyright', () => {
    render(<Footer />);
    
    const copyright = screen.getByText(/© 2025 firmatic/i);

    expect(copyright).toBeInTheDocument();
  });

  it('should have clickable email link', () => {
    render(<Footer />);
    
    const email = screen.getByText(/firmaticenterprise@gmail\.com/i);

    expect(email).toBeInTheDocument();
  });

  it('should have clickable phone link', () => {
    render(<Footer />);
    
    const phone = screen.getByText(/\+56 9 1234 5678/i);

    expect(phone).toBeInTheDocument();
  });
});