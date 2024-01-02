import rateLimit from 'express-rate-limit';
import express from 'express'
import { createServer } from 'http';

/* include script
<script id="chatScript" src="localhost:8080/chat.js"></script>
*/
const init = function() {
	// Enable web server with socketio

	// Set up rate limiter
	const limiter = rateLimit({
		windowMs: 15 * 60 * 1000,
		max: 100,
		standardHeaders: true,
		legacyHeaders: false,
	});


	const app = express();
	const port = 5029;
	const server = createServer(app);
	app.use(limiter);


	server.listen(port, () => console.log(`Server started on port ${port}`));
	
};

export {init};
