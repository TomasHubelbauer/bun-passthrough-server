const textDecoder = new TextDecoder();

const server = Bun.serve({
  async fetch(request) {
    const url = new URL(request.url);
    switch (url.pathname) {
      case "/produce": {
        // @ts-expect-error Bun types?
        return new Response(async function* () {
          while (true) {
            const line = new Date().toISOString();
            yield line + "\n";
            console.log("Produced:", line);
            await Bun.sleep(1000);
          }
        });
      }
      case "/consume": {
        // @ts-expect-error Bun types?
        for await (const chunk of request.body) {
          console.log("Consumed:", textDecoder.decode(chunk));
        }

        return new Response();
      }
    }

    throw new Error("Not Found");
  },
});

const response = await fetch(`http://localhost:${server.port}/produce`);
await fetch(`http://localhost:${server.port}/consume`, {
  method: "POST",

  // Note this doesn't work even with `duplex` set to `half` or `full`
  body: response.body,
});
