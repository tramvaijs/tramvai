/**
 * @fileoverview Tests for validateSwScopesOverlap
 * eslint-disable max-len -- Test strings are long by nature
 */
import { validateSwScopesOverlap } from '../validateSwScopesOverlap';

describe('validateSwScopesOverlap', () => {
  it('should not throw for empty or single scope', () => {
    expect(() => validateSwScopesOverlap([])).not.toThrow();
    expect(() => validateSwScopesOverlap(['/app/'])).not.toThrow();
  });

  it('should not throw for non-overlapping scopes', () => {
    expect(() => validateSwScopesOverlap(['/bank/', '/invest/', '/crypto/'])).not.toThrow();
    expect(() => validateSwScopesOverlap(['/app1/', '/app2/', '/app3/'])).not.toThrow();
  });

  it('should not throw when scope contains another', () => {
    expect(() => validateSwScopesOverlap(['/app/', '/app/bank/'])).not.toThrow();
    expect(() => validateSwScopesOverlap(['/', '/app/'])).not.toThrow();
  });

  it('should handle scopes without leading slash', () => {
    expect(() => validateSwScopesOverlap(['app/', 'app/bank/'])).not.toThrow();
  });

  it('should handle scopes without trailing slash', () => {
    expect(() => validateSwScopesOverlap(['/app', '/app/bank'])).not.toThrow();
  });

  it('should not throw for sibling scopes', () => {
    expect(() => validateSwScopesOverlap(['/bank/cards/', '/bank/invest/'])).not.toThrow();
  });

  it('should throw when scopes identical', () => {
    expect(() => validateSwScopesOverlap(['/app/', '/app/'])).toThrow(/overlap/);
  });

  it('should detect multiple scopes identical', () => {
    expect(() => validateSwScopesOverlap(['/app', '/app/', '/invest/', '/invest/'])).toThrow(
      '/app/, /invest/'
    );
  });
});
