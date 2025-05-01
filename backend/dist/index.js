"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
// Importar novas rotas
const oltRoutes_1 = __importDefault(require("./routes/oltRoutes"));
const fiberRoutes_1 = __importDefault(require("./routes/fiberRoutes"));
const splitterRoutes_1 = __importDefault(require("./routes/splitterRoutes"));
const coeRoutes_1 = __importDefault(require("./routes/coeRoutes"));
// Carrega variáveis de ambiente
dotenv_1.default.config();
// Configurações do servidor
const app = (0, express_1.default)();
const PORT = 3000; // Porta padrão 3000
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Rotas
app.use('/', routes_1.default);
// Registrar novas rotas
app.use('/api/olts', oltRoutes_1.default);
app.use('/api/fibers', fiberRoutes_1.default);
app.use('/api/splitters', splitterRoutes_1.default);
app.use('/api/coes', coeRoutes_1.default);
// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
