import React, { useDi } from '@tramvai/react';
import { PAGE_SERVICE_TOKEN } from '@tramvai/tokens-router';

export function Value() {
  const { pageService } = useDi({
    pageService: PAGE_SERVICE_TOKEN,
  });
  const { value } = pageService.getConfig();
  return <code>{JSON.stringify(value, null, 2)}</code>;
}
