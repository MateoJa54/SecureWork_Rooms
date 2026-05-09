import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest';

const mockCreateClient = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}));

describe('supabase client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create supabase client correctly', async () => {
    const fakeClient = {
      auth: {},
    };

    mockCreateClient.mockReturnValue(
      fakeClient
    );

    const module = await import(
      '../../services/supabase.client.js'
    );

    expect(mockCreateClient).toHaveBeenCalled();

    expect(module.supabase).toBe(fakeClient);
  });
});