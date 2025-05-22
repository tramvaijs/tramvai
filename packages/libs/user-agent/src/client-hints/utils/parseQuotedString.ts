/*
  The parseQuotedString function attempts to parse a string using JSON.parse 
  and returns the trimmed result if successful; 
  otherwise, it returns the original string or undefined
*/
export const parseQuotedString = (str: string | undefined): string | undefined => {
  if (!str) {
    return str;
  }

  try {
    return JSON.parse(str)?.trim();
  } catch (err) {
    return str;
  }
};
