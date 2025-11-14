import { render, screen } from "@testing-library/react";
import Hero from "@/components/Hero";

describe("Hero Component Test", () => {
  it("should render the badge with security text", () => {
    render(<Hero />);
    
    const badgeText = screen.getByText(/firma digital certificada y segura/i);
    
    expect(badgeText).toBeInTheDocument();
  });

  it("should render badge icon", () => {
    render(<Hero />);
    
    const badge = screen.getByText(/firma digital certificada y segura/i).closest('div');
    
    expect(badge).toBeInTheDocument();
  });

  it("should render the hero heading", () => {
    render(<Hero />);
    
    const heading = screen.getByRole("heading", { 
      name: /gestión de documentos sin papel/i 
    });

    expect(heading).toBeInTheDocument();
  });

  it("should highlight 'sin papel' text in the heading", () => {
    render(<Hero />);
    
    const highlightedText = screen.getByText(/sin papel/i);
    
    expect(highlightedText).toBeInTheDocument();
  });

  it("should render description text", () => {
    render(<Hero />);
    
    const descriptionText = screen.getByText(
      /reduce la gestión manual de documentos/i
    );

    expect(descriptionText).toBeInTheDocument();
  });

  it("should render complete description with all details", () => {
    render(<Hero />);
    
    const fullDescription = screen.getByText(
      /permite a tus empleados subir permisos, licencias y certificados/i
    );

    expect(fullDescription).toBeInTheDocument();
  });

  it("should render CTA button with correct text", () => {
    render(<Hero />);
    
    const button = screen.getByRole("button", { name: /solicitar demo/i });

    expect(button).toBeInTheDocument();
  });

  it("should render arrow icon in CTA button", () => {
    render(<Hero />);
    
    const button = screen.getByRole("button", { name: /solicitar demo/i });
    
    expect(button).toBeInTheDocument();
  });

  it("should call onClick when CTA button is clicked", () => {
    const handleClick = jest.fn();
    render(<Hero onCtaClick={handleClick} />);

    const button = screen.getByRole("button", { name: /solicitar demo/i });
    button.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should render 'Sin tarjeta de crédito' feature", () => {
    render(<Hero />);
    
    const feature = screen.getByText(/sin tarjeta de crédito/i);
    
    expect(feature).toBeInTheDocument();
  });

  it("should render 'Configuración en 5 minutos' feature", () => {
    render(<Hero />);
    
    const feature = screen.getByText(/configuración en 5 minutos/i);
    
    expect(feature).toBeInTheDocument();
  });

  it("should render 'Soporte 24/7' feature", () => {
    render(<Hero />);
    
    const feature = screen.getByText(/soporte 24\/7/i);
    
    expect(feature).toBeInTheDocument();
  });

  it("should render icons for all three features", () => {
    render(<Hero />);
    
    const features = screen.getAllByText(/sin tarjeta|configuración|soporte/i);
    
    expect(features).toHaveLength(3);
  });

  it("should have proper semantic structure", () => {
    render(<Hero />);
    
    // Verificar que hay un heading principal (h1)
    const mainHeading = screen.getByRole("heading", { level: 1 });
    
    expect(mainHeading).toBeInTheDocument();
  });

  it("should have accessible button", () => {
    render(<Hero />);
    
    const button = screen.getByRole("button", { name: /solicitar demo/i });
    
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute('type');
  });
});
