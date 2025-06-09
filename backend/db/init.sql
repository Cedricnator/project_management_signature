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
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
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
  path TEXT NOT NULL,
  size BIGINT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_hash VARCHAR(255) NOT NULL UNIQUE,
  original_name VARCHAR(255) NOT NULL,
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
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
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
  signature_hash VARCHAR(255) NOT NULL UNIQUE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  validated_at TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES account(id) ON DELETE CASCADE,
  FOREIGN KEY (document_id) REFERENCES document(id) ON DELETE CASCADE
);

-- Insert initial document status types
INSERT INTO document_status_type (id, status) VALUES
('01974b23-bc2f-7e5f-a9d0-73a5774d2778', 'pending_review'),
('01974b23-d84d-7319-95b3-02322c982216', 'approved'),
('01974b23-e943-7308-8185-1556429b9ff1', 'rejected'),
('01974b23-fecc-7863-b7ac-b64554d34cde', 'signed'),
('01974b24-093b-7014-aa21-9f964b822156', 'deleted');

-- Insert testing users
INSERT INTO account (id, email, first_name, last_name, password, role) VALUES
('01974b59-3024-74cd-9b7b-44dfa0088448', 'admin@signature.com', 'Carlos', 'Administrador', '$2a$10$yfzNcCgoDGUNDYbyr88kFuReiJsW3TtyUy1vLr5mcGtj1fVgKfI3m', 'admin'),
('01974b59-4700-71d3-8b5d-693483582b06', 'supervisor@signature.com', 'Maria', 'Supervisora', '$2a$10$yfzNcCgoDGUNDYbyr88kFuReiJsW3TtyUy1vLr5mcGtj1fVgKfI3m', 'supervisor'),
('01974b59-5913-713e-ae09-5a11333ab37e', 'juan.perez@signature.com', 'Juan', 'Pérez', '$2a$10$yfzNcCgoDGUNDYbyr88kFuReiJsW3TtyUy1vLr5mcGtj1fVgKfI3m', 'user'),
('01974b59-697d-7e4b-9abf-61d073db6628', 'ana.garcia@signature.com', 'Ana', 'García', '$2a$10$yfzNcCgoDGUNDYbyr88kFuReiJsW3TtyUy1vLr5mcGtj1fVgKfI3m', 'user'),
('01974b59-7d0e-7745-b45a-5a36316863e6', 'pedro.lopez@signature.com', 'Pedro', 'López', '$2a$10$yfzNcCgoDGUNDYbyr88kFuReiJsW3TtyUy1vLr5mcGtj1fVgKfI3m', 'user'),
('01974b59-933f-735d-ad03-4b3f9e61a97c', 'sofia.martinez@signature.com', 'Sofía', 'Martínez', '$2a$10$yfzNcCgoDGUNDYbyr88kFuReiJsW3TtyUy1vLr5mcGtj1fVgKfI3m', 'user');

-- Indexes for better performance
CREATE INDEX idx_account_email ON account(email);
CREATE INDEX idx_account_document_account_id ON account_document(account_id);
CREATE INDEX idx_account_document_document_id ON account_document(document_id);
CREATE INDEX idx_document_history_document_id ON document_history(document_id);
CREATE INDEX idx_document_history_created_at ON document_history(created_at);
