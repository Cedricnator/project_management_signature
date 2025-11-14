import { render, screen, waitFor } from '@testing-library/react';
import MetricsSection from '../../components/MetricsSection';
import { getSystemMetrics } from '../../app/lib/metrics';

// Mock del servicio de métricas
jest.mock('../../app/lib/metrics');

const mockGetSystemMetrics = getSystemMetrics as jest.MockedFunction<
  typeof getSystemMetrics
>;

describe('MetricsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the metrics section', () => {
    mockGetSystemMetrics.mockResolvedValue({
      totalUsers: 0,
      totalDocuments: 0,
      pendingSignatures: 0,
    });

    render(<MetricsSection />);

    expect(screen.getByTestId('metrics-section')).toBeInTheDocument();
    expect(screen.getByText('Nuestros Números')).toBeInTheDocument();
  });

  it('should display loading state initially', () => {
    mockGetSystemMetrics.mockResolvedValue({
      totalUsers: 10,
      totalDocuments: 10,
      pendingSignatures: 5,
    });

    render(<MetricsSection />);

    expect(screen.getAllByText('...').length).toBeGreaterThan(0);
  });

  it('should display "Usuarios Totales: 10" when system has 10 users', async () => {
    mockGetSystemMetrics.mockResolvedValue({
      totalUsers: 10,
      totalDocuments: 5,
      pendingSignatures: 2,
    });

    render(<MetricsSection />);

    await waitFor(() => {
      const totalUsersValue = screen.getByTestId('total-users-value');
      expect(totalUsersValue).toHaveTextContent('10');
    });

    expect(screen.getByText('Usuarios Totales')).toBeInTheDocument();
  });

  it('should display "Documentos Gestionados: 10" when system has 10 documents', async () => {
    mockGetSystemMetrics.mockResolvedValue({
      totalUsers: 5,
      totalDocuments: 10,
      pendingSignatures: 3,
    });

    render(<MetricsSection />);

    await waitFor(() => {
      const totalDocsValue = screen.getByTestId('total-documents-value');
      expect(totalDocsValue).toHaveTextContent('10');
    });

    expect(screen.getByText('Documentos Gestionados')).toBeInTheDocument();
  });

  it('should display "Pendientes de Firma: 5" when system has 5 pending documents', async () => {
    mockGetSystemMetrics.mockResolvedValue({
      totalUsers: 8,
      totalDocuments: 20,
      pendingSignatures: 5,
    });

    render(<MetricsSection />);

    await waitFor(() => {
      const pendingValue = screen.getByTestId('pending-signatures-value');
      expect(pendingValue).toHaveTextContent('5');
    });

    expect(screen.getByText('Pendientes de Firma')).toBeInTheDocument();
  });

  it('should display all zeros when system is empty', async () => {
    mockGetSystemMetrics.mockResolvedValue({
      totalUsers: 0,
      totalDocuments: 0,
      pendingSignatures: 0,
    });

    render(<MetricsSection />);

    await waitFor(() => {
      const totalUsersValue = screen.getByTestId('total-users-value');
      const totalDocsValue = screen.getByTestId('total-documents-value');
      const pendingValue = screen.getByTestId('pending-signatures-value');

      expect(totalUsersValue).toHaveTextContent('0');
      expect(totalDocsValue).toHaveTextContent('0');
      expect(pendingValue).toHaveTextContent('0');
    });
  });

  it('should call getSystemMetrics on component mount', async () => {
    mockGetSystemMetrics.mockResolvedValue({
      totalUsers: 15,
      totalDocuments: 25,
      pendingSignatures: 8,
    });

    render(<MetricsSection />);

    await waitFor(() => {
      expect(mockGetSystemMetrics).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle API errors gracefully and show zeros', async () => {
    mockGetSystemMetrics.mockResolvedValue({
      totalUsers: 0,
      totalDocuments: 0,
      pendingSignatures: 0,
    });

    render(<MetricsSection />);

    await waitFor(() => {
      const totalUsersValue = screen.getByTestId('total-users-value');
      expect(totalUsersValue).toHaveTextContent('0');
    });
  });
});
