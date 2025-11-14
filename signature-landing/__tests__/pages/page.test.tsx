import Home from '@/app/page';
import { render, screen } from '@testing-library/react';

jest.mock('@/components/Navbar', () => {
  const MockNavbar = () => <nav data-testid="navbar">Navbar</nav>;
  return MockNavbar;
});

jest.mock('@/components/Hero', () => {
  const MockHero = () => <section data-testid="hero">Hero</section>;
  return MockHero;
});

jest.mock('@/components/MetricsSection', () => {
  const MockMetricsSection = () => <section data-testid="metrics-section">MetricsSection</section>;
  return MockMetricsSection;
});

jest.mock('@/components/BenefitsSection', () => {
  const MockBenefitsSection = () => <section data-testid="benefits-section">BenefitsSection</section>;
  return MockBenefitsSection;
});

jest.mock('@/components/CharacteristicSection', () => {
  const MockCharacteristicSection = () => <section data-testid="characteristic-section">CharacteristicSection</section>;
  return MockCharacteristicSection;
});

jest.mock('@/components/HowItWorksSection', () => {
  const MockHowItWorksSection = () => <section data-testid="how-it-works-section">HowItWorksSection</section>;
  return MockHowItWorksSection;
});

jest.mock('@/components/CTA', () => {
  const MockCta = () => <section data-testid="cta">CTA</section>;
  return MockCta;
});

jest.mock('@/components/Footer', () => {
  const MockFooter = () => <footer data-testid="footer">Footer</footer>;
  return MockFooter;
});

describe('Landing Page', () => {
  it('should render all main components', () => {
    render(<Home />);

    // Verificar que todos los componentes principales estén presentes
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('metrics-section')).toBeInTheDocument();
    expect(screen.getByTestId('benefits-section')).toBeInTheDocument();
    expect(screen.getByTestId('characteristic-section')).toBeInTheDocument();
    expect(screen.getByTestId('how-it-works-section')).toBeInTheDocument();
    expect(screen.getByTestId('cta')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should render components in the correct order', () => {
    const { container } = render(<Home />);
    
    const sections = container.querySelectorAll('[data-testid]');
    const sectionIds = Array.from(sections).map((section) => 
      section.getAttribute('data-testid')
    );

    // Verificar el orden de los componentes
    expect(sectionIds[0]).toBe('navbar');
    expect(sectionIds[1]).toBe('hero');
    expect(sectionIds[2]).toBe('metrics-section');
    expect(sectionIds[3]).toBe('benefits-section');
    expect(sectionIds[4]).toBe('characteristic-section');
    expect(sectionIds[5]).toBe('how-it-works-section');
    expect(sectionIds[6]).toBe('cta');
    expect(sectionIds[7]).toBe('footer');
  });
});