/**
 * @jest-environment @tramvai/test-unit-jest/lib/jsdom-environment
 */
import React from 'react';
import { DIContext } from '@tramvai/react';
import { testComponent } from '@tramvai/test-react';
import { createMockDi } from '@tramvai/test-mocks';
import { CHILD_APP_ERROR_BOUNDARY_TOKEN } from '@tramvai/tokens-child-app';
import { createLoggerMocks } from '@tramvai/internal-test-utils/mocks/tramvai/logger';
import { ChildAppErrorBoundaryWrapper } from './childAppErrorBoundaryWrapper';
import { ChildAppStore } from '../store';

const ErrorComponent = ({ throwError }: { throwError: boolean }) => {
  if (throwError) {
    throw new Error(`error during render}`);
  }

  return <div>example-child-app</div>;
};

describe('react/childAppErrorBoundary', () => {
  it('should pass error to custom error handler', () => {
    const handlerMock = jest.fn();

    const di = createMockDi({
      providers: [
        {
          provide: CHILD_APP_ERROR_BOUNDARY_TOKEN,
          useFactory: () => handlerMock,
        },
      ],
    });

    testComponent(
      <DIContext.Provider value={di}>
        <ChildAppErrorBoundaryWrapper
          config={{ name: 'example-child-app', tag: 'example-tag', version: '0.0.0' }}
        >
          <ErrorComponent throwError />
        </ChildAppErrorBoundaryWrapper>
      </DIContext.Provider>,
      { stores: [ChildAppStore] }
    );

    expect(handlerMock).toHaveBeenCalledTimes(1);
    expect(handlerMock).toHaveBeenCalledWith(expect.any(Error), expect.any(Object), {
      name: 'example-child-app',
      tag: 'example-tag',
      version: '0.0.0',
    });
  });
});
