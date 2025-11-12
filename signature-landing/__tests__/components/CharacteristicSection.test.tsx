import { render } from "@testing-library/react";

describe('CharacteristicSection Component Test', () => {
  it('should render the title of the section', () => {
    render(<CharacteristicSection />)

    const titleSection = 'Todo lo que necesitas para digitalizar'
  })

  it('should render the description of the section', () => {
    render(<CharacteristicSection />)

    const description = 'Una plataforma completa para gestionar documentos empresariales con seguridad y eficiencia'
  });
});