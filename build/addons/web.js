"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
/* include script
<script id="chatScript" src="localhost:8080/chat.js"></script>
*/
const init = function () {
    // Enable web server with socketio
    // Set up rate limiter
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
    });
    const app = (0, express_1.default)();
    const port = 5029;
    const server = (0, http_1.createServer)(app);
    app.use(limiter);
    server.listen(port, () => console.log(`Server started on port ${port}`));
};
exports.init = init;
//# sourceMappingURL=web.js.map