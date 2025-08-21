import { test as testBase } from './fixture';
import { test as testViewTransition } from './fixture-view-transition';

import { testcasesFactory } from './testcases.factory';

testcasesFactory(testBase, 'autoscroll');
testcasesFactory(testViewTransition, 'autoscroll with enabled view-transition');
