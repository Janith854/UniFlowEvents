require('dotenv').config({ path: __dirname + '/.env' });
const app = require('./app');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5001;

const startServer = async () => {
	try {
		await connectDB();
		const server = http.createServer(app);
		const io = new Server(server, {
			cors: {
				origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
				methods: ["GET", "POST", "PUT", "DELETE"],
				credentials: true
			}
		});

		app.set('io', io);

		io.on('connection', (socket) => {
			console.log('🔗 WebSocket Client connected:', socket.id);
			socket.on('disconnect', () => {
				console.log('❌ WebSocket Client disconnected:', socket.id);
			});
		});

		server.listen(PORT, () => console.log(`🚀 Server with WebSockets live on port ${PORT}`));
	} catch (error) {
		console.error('Server startup failed due to database connection error.', error);
		process.exit(1);
	}
};

startServer();
