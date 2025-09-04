// modern es code here but no any signs for @tinkoff/is-modern-lib that it's modern
import { FakeModernLibrary } from 'fake-library';
// @tinkoff/is-modern-lib detect `@tramvai/*` scoped packages as modern
import { FakeTramvaiModernLibrary } from '@tramvai/fake-library';

console.log(FakeModernLibrary, FakeTramvaiModernLibrary);
