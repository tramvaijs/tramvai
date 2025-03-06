import { comparePathWithPattern } from './comparePathWithPattern';

describe('comparePathWithPattern', () => {
  it('should match a simple path without parameters', () => {
    expect(comparePathWithPattern('/users/profile', '/users/profile')).toBeTruthy();
  });

  it('should match a path with a single parameter', () => {
    expect(comparePathWithPattern('/users/123/profile', '/users/:userId/profile')).toBeTruthy();
  });

  it('should match a path with multiple parameters', () => {
    expect(
      comparePathWithPattern('/users/123/posts/456', '/users/:userId/posts/:postId')
    ).toBeTruthy();
  });

  it('should handle special characters in the parameter value', () => {
    expect(comparePathWithPattern('/users/abc-def/profile', '/users/:userId/profile')).toBeTruthy();
  });

  it('should not match if the real path has extra segments', () => {
    expect(
      comparePathWithPattern('/users/123/profile/additional', '/users/:userId/profile')
    ).toBeFalsy();
  });

  it('should not match if the path is different from the pattern', () => {
    expect(comparePathWithPattern('/users/123/profile', '/users/:userId/settings')).toBeFalsy();
  });
});
