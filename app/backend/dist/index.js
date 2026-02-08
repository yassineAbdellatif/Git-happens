"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const mapRoutes_1 = __importDefault(require("./routes/mapRoutes")); // Adjust path if needed
dotenv_1.default.config();
const app = (0, express_1.default)();
// Change this to 3000 to match your frontend service
const PORT = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api', mapRoutes_1.default);
app.get('/health', (req, res) => {
    res.send('Campus Guide Backend is running ');
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map