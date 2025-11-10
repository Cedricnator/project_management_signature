import { formatFriendlyDate } from './format-date.helper';

describe('formatFriendlyDate', () => {
  it('should format friendly date correctly', () => {
    const date = new Date('2023-01-01');
    const formatted = formatFriendlyDate(date);
    expect(formatted).toBe('31 de diciembre de 2022, 21:00');
  });
});
