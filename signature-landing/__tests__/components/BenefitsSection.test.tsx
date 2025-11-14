import BenefitsSection from "@/components/BenefitsSection";
import { render, screen } from "@testing-library/react";

describe("BenefitsSection Component", () => {
  it("should render the main title", () => {
    render(<BenefitsSection />);

    const title = screen.getByRole('heading', { 
      name: /resultados que hablan por sí solos/i 
    });
    
    expect(title).toBeInTheDocument();
  });

  it("should render the subtitle/description", () => {
    render(<BenefitsSection />);

    const description = screen.getByText(
      /empresas que confían en signflow han transformado su gestión documental/i
    );
    
    expect(description).toBeInTheDocument();
  });

  it("should render 90% statistic", () => {
    render(<BenefitsSection />);

    const statistic = screen.getByText(/90%/i);
    
    expect(statistic).toBeInTheDocument();
  });

  it("should render 90% card title", () => {
    render(<BenefitsSection />);

    const cardTitle = screen.getByText(/reducción en tiempo de procesamiento/i);
    
    expect(cardTitle).toBeInTheDocument();
  });

  it("should render 90% card description", () => {
    render(<BenefitsSection />);

    const description = screen.getByText(/menos tiempo en gestión manual/i);
    
    expect(description).toBeInTheDocument();
  });

  it("should render 100% statistic", () => {
    render(<BenefitsSection />);

    const statistic = screen.getByText(/100%/i);
    
    expect(statistic).toBeInTheDocument();
  });

  it("should render 100% card title", () => {
    render(<BenefitsSection />);

    const cardTitle = screen.getByText(/trazabilidad de documentos/i);
    
    expect(cardTitle).toBeInTheDocument();
  });

  it("should render 100% card description", () => {
    render(<BenefitsSection />);

    const description = screen.getByText(/historial completo de acciones/i);
    
    expect(description).toBeInTheDocument();
  });

  it("should render 0 statistic", () => {
    render(<BenefitsSection />);

    const statistic = screen.getByText(/^0$/);
    
    expect(statistic).toBeInTheDocument();
  });

  it("should render 0 card title", () => {
    render(<BenefitsSection />);

    const cardTitle = screen.getByText(/documentos perdidos/i);
    
    expect(cardTitle).toBeInTheDocument();
  });

  it("should render 0 card description", () => {
    render(<BenefitsSection />);

    const description = screen.getByText(/todo almacenado de forma segura/i);
    
    expect(description).toBeInTheDocument();
  });

  it("should render 24/7 statistic", () => {
    render(<BenefitsSection />);

    const statistic = screen.getByText(/24\/7/i);
    
    expect(statistic).toBeInTheDocument();
  });

  it("should render 24/7 card title", () => {
    render(<BenefitsSection />);

    const cardTitle = screen.getByText(/acceso disponible/i);
    
    expect(cardTitle).toBeInTheDocument();
  });

  it("should render 24/7 card description", () => {
    render(<BenefitsSection />);

    const description = screen.getByText(/desde cualquier dispositivo/i);
    
    expect(description).toBeInTheDocument();
  });

  it("should render all 4 statistic cards", () => {
    render(<BenefitsSection />);

    const stat90 = screen.getByText(/90%/i);
    const stat100 = screen.getByText(/100%/i);
    const stat0 = screen.getByText(/^0$/);
    const stat247 = screen.getByText(/24\/7/i);

    expect(stat90).toBeInTheDocument();
    expect(stat100).toBeInTheDocument();
    expect(stat0).toBeInTheDocument();
    expect(stat247).toBeInTheDocument();
  });

  it("should render cards in a grid layout", () => {
    render(<BenefitsSection />);

    const section = screen.getByRole('heading', { 
      name: /resultados que hablan por sí solos/i 
    }).closest('section');

    expect(section).toBeInTheDocument();
  });

  it("should have cards with rounded borders", () => {
    render(<BenefitsSection />);

    const card = screen.getByText(/reducción en tiempo de procesamiento/i).closest('div');
    
    expect(card).toBeInTheDocument();
  });

  it("should have cards with light background", () => {
    render(<BenefitsSection />);

    const card = screen.getByText(/trazabilidad de documentos/i).closest('div');
    
    expect(card).toBeInTheDocument();
  });

  it("should display statistics in large bold font", () => {
    render(<BenefitsSection />);

    const statistic = screen.getByText(/90%/i);
    
    expect(statistic).toBeInTheDocument();
  });

  it("should display blue color for statistics", () => {
    render(<BenefitsSection />);

    const statistic = screen.getByText(/24\/7/i);
    
    expect(statistic).toBeInTheDocument();
  });

  it("should have proper semantic structure", () => {
    render(<BenefitsSection />);

    const mainHeading = screen.getByRole('heading', { 
      name: /resultados que hablan por sí solos/i 
    });

    expect(mainHeading).toBeInTheDocument();
  });

  it("should have descriptive text for screen readers", () => {
    render(<BenefitsSection />);

    const cards = [
      screen.getByText(/reducción en tiempo de procesamiento/i),
      screen.getByText(/trazabilidad de documentos/i),
      screen.getByText(/documentos perdidos/i),
      screen.getByText(/acceso disponible/i)
    ];

    cards.forEach(card => {
      expect(card).toBeInTheDocument();
    });
  });

  it("should render cards in correct order", () => {
    render(<BenefitsSection />);

    const statistics = [
      screen.getByText(/90%/i),
      screen.getByText(/100%/i),
      screen.getByText(/^0$/),
      screen.getByText(/24\/7/i)
    ];

    statistics.forEach(stat => {
      expect(stat).toBeInTheDocument();
    });
  });
});
