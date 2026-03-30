export const jsonLdMock = {
  '@graph': [
    {
      name: 'Т‑Бизнес',
      '@type': 'Product',
    },
  ],
  '@context': 'http://schema.org',
};

export const updatedJsonLdMock = {
  '@graph': [
    {
      name: 'Т‑Банк',
      '@type': 'Product',
    },
  ],
  '@context': 'http://schema.org',
};

export const stringifiedJsonLdMock = JSON.stringify(jsonLdMock);
export const stringifiedUpdatedJsonLdMock = JSON.stringify(updatedJsonLdMock);
