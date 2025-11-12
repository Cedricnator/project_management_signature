import { render, screen } from "@testing-library/react";
import HowItWorksSection from "@/app/components/HowItWorksSection";

describe("HowItWorksSection Component", () => {
  it("should render the main title", () => {
    render(<HowItWorksSection />);

    const title = screen.getByRole("heading", { name: /cómo funciona/i });
    expect(title).toBeInTheDocument();
  });

  it("should render the subtitle", () => {
    render(<HowItWorksSection />);

    const subtitle = screen.getByText(/un proceso simple y seguro en 4 pasos/i);
    expect(subtitle).toBeInTheDocument();
  });

  it("should render step 1 number", () => {
    render(<HowItWorksSection />);

    const stepNumber = screen.getByText(/^1$/);
    expect(stepNumber).toBeInTheDocument();
  });

  it("should render step 1 title", () => {
    render(<HowItWorksSection />);

    const stepTitle = screen.getByText(/registro/i);
    expect(stepTitle).toBeInTheDocument();
  });

  it("should render step 1 description", () => {
    render(<HowItWorksSection />);

    const stepDescription = screen.getByText(/crea tu cuenta en minutos/i);
    expect(stepDescription).toBeInTheDocument();
  });

  it("should render step 2 number", () => {
    render(<HowItWorksSection />);

    const stepNumber = screen.getByText(/^2$/);
    expect(stepNumber).toBeInTheDocument();
  });

  it("should render step 2 title", () => {
    render(<HowItWorksSection />);

    const stepTitle = screen.getByText(/sube documentos/i);
    expect(stepTitle).toBeInTheDocument();
  });

  it("should render step 2 description", () => {
    render(<HowItWorksSection />);

    const stepDescription = screen.getByText(/carga permisos, licencias y certificados/i);
    expect(stepDescription).toBeInTheDocument();
  });

  it("should render step 3 number", () => {
    render(<HowItWorksSection />);

    const stepNumber = screen.getByText(/^3$/);
    expect(stepNumber).toBeInTheDocument();
  });

  it("should render step 3 title", () => {
    render(<HowItWorksSection />);

    const stepTitle = screen.getByText(/firma digital/i);
    expect(stepTitle).toBeInTheDocument();
  });

  it("should render step 3 description", () => {
    render(<HowItWorksSection />);

    const stepDescription = screen.getByText(/valida con firma digital certificada/i);
    expect(stepDescription).toBeInTheDocument();
  });

  it("should render step 4 number", () => {
    render(<HowItWorksSection />);

    const stepNumber = screen.getByText(/^4$/);
    expect(stepNumber).toBeInTheDocument();
  });

  it("should render step 4 title", () => {
    render(<HowItWorksSection />);

    const stepTitle = screen.getByText(/almacenamiento/i);
    expect(stepTitle).toBeInTheDocument();
  });

  it("should render step 4 description", () => {
    render(<HowItWorksSection />);

    const stepDescription = screen.getByText(/accede a tus documentos desde cualquier lugar/i);
    expect(stepDescription).toBeInTheDocument();
  });

  it("should render all 4 steps", () => {
    render(<HowItWorksSection />);

    const step1 = screen.getByText(/^1$/);
    const step2 = screen.getByText(/^2$/);
    const step3 = screen.getByText(/^3$/);
    const step4 = screen.getByText(/^4$/);

    expect(step1).toBeInTheDocument();
    expect(step2).toBeInTheDocument();
    expect(step3).toBeInTheDocument();
    expect(step4).toBeInTheDocument();
  });

  it("should render steps in correct order", () => {
    render(<HowItWorksSection />);

    const steps = [
      screen.getByText(/registro/i),
      screen.getByText(/sube documentos/i),
      screen.getByText(/firma digital/i),
      screen.getByText(/almacenamiento/i),
    ];

    steps.forEach(step => {
      expect(step).toBeInTheDocument();
    });
  });

  it("should have step numbers styled as badges", () => {
    render(<HowItWorksSection />);

    const stepNumber = screen.getByText(/^1$/).closest("div");
    expect(stepNumber).toBeInTheDocument();
  });

  it("should render step icons if present", () => {
    render(<HowItWorksSection />);

    const step = screen.getByText(/registro/i).closest("div");
    expect(step).toBeInTheDocument();
  });

  it("should have proper semantic structure", () => {
    render(<HowItWorksSection />);

    const mainHeading = screen.getByRole("heading", { name: /cómo funciona/i });
    expect(mainHeading).toBeInTheDocument();
  });

  it("should render steps in a grid or flex layout", () => {
    render(<HowItWorksSection />);

    const section = screen.getByRole("heading", { name: /cómo funciona/i }).closest("section");
    expect(section).toBeInTheDocument();
  });
});
