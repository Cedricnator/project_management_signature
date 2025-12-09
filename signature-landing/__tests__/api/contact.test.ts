import nodemailer from 'nodemailer';

// Mock de nodemailer
jest.mock('nodemailer');

// Mock de next/server antes de importar
jest.mock('next/server', () => {
  class MockNextRequest {
    private bodyContent: string;
    
    constructor(_url: string, init?: { method?: string; body?: string }) {
      this.bodyContent = init?.body || '{}';
    }
    
    async json() {
      return JSON.parse(this.bodyContent);
    }
  }

  return {
    NextResponse: {
      json: jest.fn((body, init) => ({
        json: async () => body,
        status: init?.status || 200,
        headers: new Headers(),
        ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
      })),
    },
    NextRequest: MockNextRequest,
  };
});

import { POST } from '@/app/api/contact/route';

// Para uso en los tests
const { NextRequest } = jest.requireMock('next/server');

describe('POST /api/contact', () => {
  let mockSendMail: jest.Mock;
  let mockCreateTransport: jest.Mock;

  beforeEach(() => {
    // Limpiar mocks antes de cada test
    jest.clearAllMocks();

    // Mock de sendMail
    mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });

    // Mock de createTransport
    mockCreateTransport = jest.fn().mockReturnValue({
      sendMail: mockSendMail,
    });

    (nodemailer.createTransport as jest.Mock) = mockCreateTransport;

    // Mock de variables de entorno
    process.env.SMTP_HOST = 'smtp.test.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'test@test.com';
    process.env.SMTP_PASS = 'testpass';
    process.env.ADMIN_EMAIL = 'admin@test.com';
  });

  describe('Validaciones', () => {
    it('debe retornar 400 si falta el nombre', async () => {
      const request = new NextRequest('http://localhost:3001/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          company: 'Test Company',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Nombre, email y empresa son requeridos');
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it('debe retornar 400 si falta el email', async () => {
      const request = new NextRequest('http://localhost:3001/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          company: 'Test Company',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Nombre, email y empresa son requeridos');
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it('debe retornar 400 si falta la empresa', async () => {
      const request = new NextRequest('http://localhost:3001/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Nombre, email y empresa son requeridos');
      expect(mockSendMail).not.toHaveBeenCalled();
    });
  });

  describe('Envío exitoso de correos', () => {
    const validContactData = {
      name: 'Juan Pérez',
      email: 'juan@empresa.com',
      company: 'Empresa Test',
      phone: '+56912345678',
      message: 'Quiero más información sobre el producto',
    };

    it('debe enviar correos exitosamente con todos los campos', async () => {
      const request = new NextRequest('http://localhost:3001/api/contact', {
        method: 'POST',
        body: JSON.stringify(validContactData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Correos enviados exitosamente');
      expect(mockSendMail).toHaveBeenCalledTimes(2);
    });

    it('debe configurar el transporter correctamente', async () => {
      const request = new NextRequest('http://localhost:3001/api/contact', {
        method: 'POST',
        body: JSON.stringify(validContactData),
      });

      await POST(request);

      expect(mockCreateTransport).toHaveBeenCalledWith({
        host: 'smtp.test.com',
        port: 587,
        secure: false,
        auth: {
          user: 'test@test.com',
          pass: 'testpass',
        },
      });
    });

    it('debe enviar correo de confirmación al cliente con el formato correcto', async () => {
      const request = new NextRequest('http://localhost:3001/api/contact', {
        method: 'POST',
        body: JSON.stringify(validContactData),
      });

      await POST(request);

      const clientEmailCall = mockSendMail.mock.calls[0][0];
      expect(clientEmailCall.to).toBe(validContactData.email);
      expect(clientEmailCall.subject).toBe('Gracias por tu interés en Firmatic');
      expect(clientEmailCall.html).toContain(validContactData.name);
      expect(clientEmailCall.html).toContain('Firmatic');
      expect(clientEmailCall.from).toContain('test@test.com');
    });

    it('debe enviar correo de notificación al admin con los datos del contacto', async () => {
      const request = new NextRequest('http://localhost:3001/api/contact', {
        method: 'POST',
        body: JSON.stringify(validContactData),
      });

      await POST(request);

      const adminEmailCall = mockSendMail.mock.calls[1][0];
      expect(adminEmailCall.to).toBe('admin@test.com');
      expect(adminEmailCall.subject).toBe(
        `Nueva solicitud de contacto - ${validContactData.company}`
      );
      expect(adminEmailCall.html).toContain(validContactData.name);
      expect(adminEmailCall.html).toContain(validContactData.email);
      expect(adminEmailCall.html).toContain(validContactData.company);
      expect(adminEmailCall.html).toContain(validContactData.phone);
      expect(adminEmailCall.html).toContain(validContactData.message);
    });

    it('debe funcionar sin campos opcionales (phone y message)', async () => {
      const minimalData = {
        name: 'Juan Pérez',
        email: 'juan@empresa.com',
        company: 'Empresa Test',
      };

      const request = new NextRequest('http://localhost:3001/api/contact', {
        method: 'POST',
        body: JSON.stringify(minimalData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Correos enviados exitosamente');
      expect(mockSendMail).toHaveBeenCalledTimes(2);
    });

    it('debe usar valores por defecto para SMTP si no hay variables de entorno', async () => {
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_PORT;

      const request = new NextRequest('http://localhost:3001/api/contact', {
        method: 'POST',
        body: JSON.stringify(validContactData),
      });

      await POST(request);

      expect(mockCreateTransport).toHaveBeenCalledWith({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'test@test.com',
          pass: 'testpass',
        },
      });
    });

    it('debe usar SMTP_USER como fallback si no hay ADMIN_EMAIL', async () => {
      delete process.env.ADMIN_EMAIL;

      const request = new NextRequest('http://localhost:3001/api/contact', {
        method: 'POST',
        body: JSON.stringify(validContactData),
      });

      await POST(request);

      const adminEmailCall = mockSendMail.mock.calls[1][0];
      expect(adminEmailCall.to).toBe('test@test.com');
    });
  });

  describe('Manejo de errores', () => {
    it('debe retornar 500 si falla el envío del primer correo', async () => {
      mockSendMail.mockRejectedValueOnce(new Error('SMTP Error'));

      const request = new NextRequest('http://localhost:3001/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          company: 'Test Company',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Error al procesar la solicitud');
    });

    it('debe retornar 500 si falla el envío del segundo correo', async () => {
      mockSendMail
        .mockResolvedValueOnce({ messageId: 'test-id-1' })
        .mockRejectedValueOnce(new Error('SMTP Error'));

      const request = new NextRequest('http://localhost:3001/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          company: 'Test Company',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Error al procesar la solicitud');
    });

    it('debe retornar 500 si hay error en la creación del transporter', async () => {
      mockCreateTransport.mockImplementation(() => {
        throw new Error('Transport creation failed');
      });

      const request = new NextRequest('http://localhost:3001/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          company: 'Test Company',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Error al procesar la solicitud');
    });

    it('debe retornar 500 si el body JSON es inválido', async () => {
      // Crear un request con body inválido simulando el error de JSON.parse
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Error al procesar la solicitud');
    });
  });

  describe('Contenido de los correos', () => {
    const testData = {
      name: 'María González',
      email: 'maria@techcorp.cl',
      company: 'TechCorp Chile',
      phone: '+56987654321',
      message: 'Necesito cotización para 50 usuarios',
    };

    it('el correo al cliente debe incluir información sobre la plataforma', async () => {
      const request = new NextRequest('http://localhost:3001/api/contact', {
        method: 'POST',
        body: JSON.stringify(testData),
      });

      await POST(request);

      const clientEmail = mockSendMail.mock.calls[0][0];
      expect(clientEmail.html).toContain('Características de la plataforma');
      expect(clientEmail.html).toContain('Opciones de licenciamiento');
      expect(clientEmail.html).toContain('Requisitos técnicos');
      expect(clientEmail.html).toContain('Soporte y capacitación');
    });

    it('el correo al admin debe incluir la fecha de la solicitud', async () => {
      const request = new NextRequest('http://localhost:3001/api/contact', {
        method: 'POST',
        body: JSON.stringify(testData),
      });

      await POST(request);

      const adminEmail = mockSendMail.mock.calls[1][0];
      expect(adminEmail.html).toContain('Fecha:');
    });

    it('el correo al admin no debe incluir campos opcionales si están vacíos', async () => {
      const minimalData = {
        name: 'Test User',
        email: 'test@test.com',
        company: 'Test Co',
      };

      const request = new NextRequest('http://localhost:3001/api/contact', {
        method: 'POST',
        body: JSON.stringify(minimalData),
      });

      await POST(request);

      const adminEmail = mockSendMail.mock.calls[1][0];
      // No debe incluir divs para teléfono o mensaje cuando no existen
      expect(adminEmail.html).not.toContain('Teléfono:');
      expect(adminEmail.html).not.toContain('Mensaje:');
    });
  });
});
