import { testRenderSlot } from './renderSlot';

describe('testRenderSlot', () => {
  const APPLICATION_JSON = 'application/ld+json';
  const expectJsonLd = {
    some: 'text',
  };
  it('should jsonLd when pageService jsonLd is not empty', async () => {
    const jsonLd = testRenderSlot(expectJsonLd);

    expect(jsonLd).toMatch(JSON.stringify(expectJsonLd));
    expect(jsonLd).toMatch(JSON.stringify(APPLICATION_JSON));
  });

  it('should no jsonLd when pageService jsonLd is empty object {}', async () => {
    const jsonLd = testRenderSlot({});

    expect(jsonLd).toEqual(expect.not.stringContaining(APPLICATION_JSON));
  });

  it('should no jsonLd when pageService jsonLd is empty', async () => {
    const jsonLd = testRenderSlot();

    expect(jsonLd).toEqual(expect.not.stringContaining(APPLICATION_JSON));
  });
});
