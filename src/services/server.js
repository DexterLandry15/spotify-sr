import fastify from "fastify";


const app = fastify({})

app.get("/", (res, req) => {
    res.send('hello')
});

export async function start_server(port) {
    await app.listen({PORT:port});
    console.log('123');
}