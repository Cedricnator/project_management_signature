import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, phone, message } = body;

    // Validaciones básicas
    if (!name || !email || !company) {
      return NextResponse.json(
        { error: 'Nombre, email y empresa son requeridos' },
        { status: 400 }
      );
    }

    // Configurar transporter de nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email al prospecto
    const clientMailOptions = {
      from: `"Firmatic" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Gracias por tu interés en Firmatic',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background-color: #f9fafb; }
              .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>¡Gracias por contactarnos!</h1>
              </div>
              <div class="content">
                <p>Hola ${name},</p>
                <p>Hemos recibido tu solicitud de información sobre Firmatic, nuestra plataforma de firma digital y gestión documental empresarial.</p>
                <p>Nuestro equipo revisará tu consulta y se pondrá en contacto contigo a la brevedad para brindarte toda la información que necesites sobre:</p>
                <ul>
                  <li>Características de la plataforma</li>
                  <li>Opciones de licenciamiento</li>
                  <li>Requisitos técnicos</li>
                  <li>Soporte y capacitación</li>
                </ul>
                <p>Mientras tanto, si tienes alguna pregunta urgente, no dudes en responder este correo.</p>
                <p><strong>Equipo Firmatic</strong></p>
              </div>
              <div class="footer">
                <p>© 2025 Firmatic. Todos los derechos reservados.</p>
                <p>Santiago, Chile | firmaticenterprise@gmail.com></p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    // Email de notificación al equipo
    const adminMailOptions = {
      from: `"Firmatic Landing" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
      subject: `Nueva solicitud de contacto - ${company}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .info-row { padding: 10px; border-bottom: 1px solid #e5e7eb; }
              .label { font-weight: bold; color: #2563eb; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>📋 Nueva Solicitud de Contacto</h2>
              <div class="info-row">
                <span class="label">Nombre:</span> ${name}
              </div>
              <div class="info-row">
                <span class="label">Email:</span> ${email}
              </div>
              <div class="info-row">
                <span class="label">Empresa:</span> ${company}
              </div>
              ${phone ? `<div class="info-row"><span class="label">Teléfono:</span> ${phone}</div>` : ''}
              ${message ? `<div class="info-row"><span class="label">Mensaje:</span><br>${message}</div>` : ''}
              <div class="info-row">
                <span class="label">Fecha:</span> ${new Date().toLocaleString('es-CL')}
              </div>
            </div>
          </body>
        </html>
      `,
    };

    // Enviar ambos emails
    await transporter.sendMail(clientMailOptions);
    await transporter.sendMail(adminMailOptions);

    return NextResponse.json(
      { message: 'Correos enviados exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al enviar correos:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
