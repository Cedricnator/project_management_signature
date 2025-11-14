import Home from '@/app/page';
import { render, screen } from '@testing-library/react';

jest.mock('@/components/Navbar', () => {
  return function Navbar() {
    return <nav data-testid="navbar">Navbar</nav>;
  };
});

jest.mock('@/components/Hero', () => {
  return function Hero() {
    return <section data-testid="hero">Hero</section>;
  };
});

jest.mock('@/components/MetricsSection', () => {
  return function MetricsSection() {
    return <section data-testid="metrics-section">MetricsSection</section>;
  };
});

jest.mock('@/components/BenefitsSection', () => {
  return function BenefitsSection() {
    return <section data-testid="benefits-section">BenefitsSection</section>;
  };
});

jest.mock('@/components/CharacteristicSection', () => {
  return function CharacteristicSection() {
    return <section data-testid="characteristic-section">CharacteristicSection</section>;
  };
});

jest.mock('@/components/HowItWorksSection', () => {
  return function HowItWorksSection() {
    return <section data-testid="how-it-works-section">HowItWorksSection</section>;
  };
});

jest.mock('@/components/Cta', () => {
  return function Cta() {
    return <section data-testid="cta">CTA</section>;
  };
});

jest.mock('@/components/Footer', () => {
  return function Footer() {
    return <footer data-testid="footer">Footer</footer>;
  };
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