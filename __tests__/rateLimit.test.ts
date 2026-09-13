import { checkRateLimit, _resetRateLimitState } from '../lib/rateLimit';

describe('checkRateLimit', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    _resetRateLimitState();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('allows requests under the limit', () => {
    const key = 'user-1';
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit(key, 5, 60_000);
      expect(result.allowed).toBe(true);
    }
  });

  test('blocks requests over the limit', () => {
    const key = 'user-2';
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(key, 5, 60_000).allowed).toBe(true);
    }

    const blocked = checkRateLimit(key, 5, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  test('tracks remaining requests correctly', () => {
    const key = 'user-3';
    expect(checkRateLimit(key, 3, 60_000).remaining).toBe(2);
    expect(checkRateLimit(key, 3, 60_000).remaining).toBe(1);
    expect(checkRateLimit(key, 3, 60_000).remaining).toBe(0);
  });

  test('resets after the window passes', () => {
    const key = 'user-4';
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(key, 5, 60_000).allowed).toBe(true);
    }
    expect(checkRateLimit(key, 5, 60_000).allowed).toBe(false);

    // Advance time past the window
    jest.advanceTimersByTime(60_001);

    const afterReset = checkRateLimit(key, 5, 60_000);
    expect(afterReset.allowed).toBe(true);
    expect(afterReset.remaining).toBe(4);
  });

  test('does not reset before the window has fully elapsed', () => {
    const key = 'user-5';
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(key, 5, 60_000).allowed).toBe(true);
    }

    jest.advanceTimersByTime(59_000);

    const stillBlocked = checkRateLimit(key, 5, 60_000);
    expect(stillBlocked.allowed).toBe(false);
  });

  test('tracks separate keys independently', () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit('user-a', 5, 60_000).allowed).toBe(true);
    }

    // user-a is now at its limit, but a different key should be unaffected
    expect(checkRateLimit('user-a', 5, 60_000).allowed).toBe(false);
    expect(checkRateLimit('user-b', 5, 60_000).allowed).toBe(true);
  });
});
