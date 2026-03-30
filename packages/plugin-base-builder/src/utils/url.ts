export const resolveUrl = ({
  protocol,
  host,
  port,
}: {
  protocol: 'https' | 'http';
  host: string;
  port: number;
}) => {
  return `${protocol}://${host}:${port}`;
};
