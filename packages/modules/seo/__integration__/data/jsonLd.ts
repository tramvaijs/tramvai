export const jsonLd = {
  '@graph': [
    {
      url: 'https://www.tinkoff.ru/',
      name: 'Тинькофф Банк',
      '@type': 'BankOrCreditUnion',
    },
  ],
  '@context': 'http://schema.org',
};

export const updatedJsonLd = {
  '@graph': [
    {
      url: 'https://www.tbank.ru/',
      name: 'Т-Банк',
      '@type': 'BankOrCreditUnion',
    },
  ],
  '@context': 'http://schema.org',
};

export const stringifiedJSonLd = JSON.stringify(jsonLd);
export const stringifiedUpdatedJSonLd = JSON.stringify(updatedJsonLd);
