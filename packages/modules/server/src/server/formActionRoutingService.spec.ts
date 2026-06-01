import { RedirectFoundError } from '@tinkoff/errors';
import { FormActionRoutingService } from './formActionRoutingService';
import { setFormActionResult } from '../formActionStore';

describe('FormActionRoutingService', () => {
  let service: FormActionRoutingService;
  let mockDispatch: jest.Mock;
  let mockHasRoute: jest.Mock;
  let mockInject: jest.Mock;
  let mockRequest: any;
  let mockDi: any;

  beforeEach(() => {
    service = new FormActionRoutingService();
    mockDispatch = jest.fn();
    mockHasRoute = jest.fn();
    mockInject = jest.fn();

    mockRequest = {
      url: '/',
      method: 'POST',
      headers: {},
      body: { field: 'value' },
      server: {
        hasRoute: mockHasRoute,
        inject: mockInject,
      },
    };

    mockDi = {
      get: jest.fn().mockReturnValue({ dispatch: mockDispatch }),
    };
  });

  it('does nothing when no matching form action route exists', async () => {
    mockHasRoute.mockReturnValue(false);

    await service.routeRequestToFormAction(mockRequest, mockDi);

    expect(mockInject).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('dispatches success result when PAPI returns OK', async () => {
    mockHasRoute.mockReturnValue(true);
    mockInject.mockResolvedValue({
      body: JSON.stringify({ resultCode: 'OK', payload: { foo: 'bar' } }),
      statusCode: 200,
    });

    await service.routeRequestToFormAction(mockRequest, mockDi);

    expect(mockDispatch).toHaveBeenCalledWith(setFormActionResult({ data: { foo: 'bar' } }));
  });

  it('throws RedirectFoundError when PAPI returns REDIRECT', async () => {
    mockHasRoute.mockReturnValue(true);
    mockInject.mockResolvedValue({
      body: JSON.stringify({ resultCode: 'REDIRECT', nextUrl: '/success' }),
      statusCode: 303,
    });

    await expect(service.routeRequestToFormAction(mockRequest, mockDi)).rejects.toThrow(
      RedirectFoundError
    );
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('dispatches error result when PAPI returns ERROR', async () => {
    mockHasRoute.mockReturnValue(true);
    mockInject.mockResolvedValue({
      body: JSON.stringify({ resultCode: 'ERROR', error: { message: 'Bad input' } }),
      statusCode: 400,
    });

    await service.routeRequestToFormAction(mockRequest, mockDi);

    expect(mockDispatch).toHaveBeenCalledWith(
      setFormActionResult({ error: { message: 'Bad input' } })
    );
  });
});
