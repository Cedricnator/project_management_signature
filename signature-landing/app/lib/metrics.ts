export interface SystemMetrics {
  totalUsers: number;
  totalDocuments: number;
  pendingSignatures: number;
}

export async function getSystemMetrics(): Promise<SystemMetrics> {
  try {
    const response = await fetch('http://localhost:3000/metrics');
    if (!response.ok) {
      throw new Error('Failed to fetch metrics');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return {
      totalUsers: 0,
      totalDocuments: 0,
      pendingSignatures: 0
    };
  }
}
