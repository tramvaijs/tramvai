import { getPathParams } from './getPathParams';

describe('getPathParams', () => {
  it('should extract params from a simple path with one parameter', () => {
    const path = '/users/123/profile';
    const pattern = '/users/:userId/profile';
    expect(getPathParams(path, pattern)).toEqual({ userId: '123' });
  });

  it('should extract params from a path with multiple parameters', () => {
    const path = '/users/123/posts/456';
    const pattern = '/users/:userId/posts/:postId';
    expect(getPathParams(path, pattern)).toEqual({ userId: '123', postId: '456' });
  });

  it('should return an empty object if the path does not match the pattern', () => {
    const path = '/users/123/settings';
    const pattern = '/users/:userId/profile';
    expect(getPathParams(path, pattern)).toEqual({});
  });

  it('should handle paths with special characters in parameter values', () => {
    const path = '/users/abc-def/profile';
    const pattern = '/users/:userId/profile';
    expect(getPathParams(path, pattern)).toEqual({ userId: 'abc-def' });
  });

  it('should handle paths with no parameters', () => {
    const path = '/users/profile';
    const pattern = '/users/profile';
    expect(getPathParams(path, pattern)).toEqual({});
  });
});
