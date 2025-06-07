CREATE DATABASE signature_project;

\c signature_project;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE role_type AS ENUM (
  'admin',
  'user',
  'supervisor'
);

-- Account 
CREATE TABLE account (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(150) NOT NULL,
  last_name VARCHAR(150) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role role_type NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Document status type table
CREATE TABLE document_status_type (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Document
CREATE TABLE document (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_name VARCHAR(255) NOT NULL,
  description TEXT,
  current_status_id UUID NOT NULL, 
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (current_status_id) REFERENCES document_status_type(id) 
);

-- For tracking document status changes
CREATE TABLE document_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL,
  status_id UUID NOT NULL,
  changed_by UUID, 
  comment TEXT, 
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (document_id) REFERENCES document(id) ON DELETE CASCADE,
  FOREIGN KEY (status_id) REFERENCES document_status_type(id),
  FOREIGN KEY (changed_by) REFERENCES account(id)
);

-- Account-Document relationship table
CREATE TABLE account_document (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL, 
  document_id UUID NOT NULL, 
  validated BOOLEAN DEFAULT FALSE,
  validated_at TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES account(id) ON DELETE CASCADE,
  FOREIGN KEY (document_id) REFERENCES document(id) ON DELETE CASCADE
);

-- Insert initial document status types
INSERT INTO document_status_type (status) VALUES
('pending_review'),
('approved'),
('rejected'),
('signed'),
('deleted'),
('archived');

-- Insert testing users
INSERT INTO account (email, first_name, last_name, password, role) VALUES
('admin@signature.com', 'Carlos', 'Administrador', '$2b$10$hashedpassword1', 'admin'),
('supervisor@signature.com', 'Maria', 'Supervisora', '$2b$10$hashedpassword2', 'supervisor'),
('juan.perez@signature.com', 'Juan', 'Pérez', '$2b$10$hashedpassword3', 'user'),
('ana.garcia@signature.com', 'Ana', 'García', '$2b$10$hashedpassword4', 'user'),
('pedro.lopez@signature.com', 'Pedro', 'López', '$2b$10$hashedpassword5', 'user'),
('sofia.martinez@signature.com', 'Sofía', 'Martínez', '$2b$10$hashedpassword6', 'user');

-- Indexes for better performance
CREATE INDEX idx_account_email ON account(email);
CREATE INDEX idx_account_document_account_id ON account_document(account_id);
CREATE INDEX idx_account_document_document_id ON account_document(document_id);
CREATE INDEX idx_document_history_document_id ON document_history(document_id);
CREATE INDEX idx_document_history_created_at ON document_history(created_at);
