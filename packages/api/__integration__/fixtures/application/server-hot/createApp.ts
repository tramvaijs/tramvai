export default function createApp(server) {
  const di = {
    get() {
      return {
        run() {
          server.close();
        },
      };
    },
  };

  return { di };
}
