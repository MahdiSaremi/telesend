import {Server} from "socket.io";
import {createServer} from "node:http";
import next from "next";
import {parse} from "node:url";
import {NewConnectionController} from "@/api/controllers";

const dev = process.env.NODE_ENV !== 'production';
const app = next({dev, conf: {reactStrictMode: false}});
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer((req, res) => {
        if (req.url) {
            const parsedUrl = parse(req.url, true);
            handle(req, res, parsedUrl);
        }
    });

    const io = new Server(server);

    io.on('connection', socket => {
        console.log('Connected:', socket.id)
        NewConnectionController(socket)

        socket.on('disconnect', () => {
            console.log('Disconnected:', socket.id);
        });
    });

    server.listen(3000, '0.0.0.0', () => {
        console.log('> Ready on port 3000');
    });
});