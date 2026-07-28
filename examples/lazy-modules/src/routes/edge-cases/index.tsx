import type { PageComponent } from '@tramvai/react';
import { useDi } from '@tramvai/react';
import { Link } from '@tramvai/module-router';
import { EdgeCaseModule, INIT_COMMAND_EXECUTED_TOKEN } from '../../modules/EdgeCaseModule';

const EdgeCasesPage: PageComponent = () => {
  const initMarker = useDi(INIT_COMMAND_EXECUTED_TOKEN);

  return (
    <div>
      <h1 id="edge-cases-title">Edge Cases</h1>
      <div id="init-command-status">
        <p>Init command executed: {String(initMarker.executed)}</p>
      </div>
      <Link url="/">Back to Store</Link>
    </div>
  );
};

EdgeCasesPage.modules = [EdgeCaseModule];

export default EdgeCasesPage;
