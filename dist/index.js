"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const port = process.env.PORT;
app.use(express_1.default.json());
const TOKEN_SECRET = process.env.TOKEN_SECRET || "claveSecreta";
app.get('/', (req, res) => {
    res.send('Express + TypeScript Server');
});
app.listen(port, () => {
    console.log(`El servidor se ejecuta en http://localhost:${port}`);
});
// Create user
app.post("/api/v1/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, date_born } = req.body;
    const last_session = new Date();
    const update_at = new Date();
    const saltRounds = 10;
    const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
    const user_email = yield prisma.user.findUnique({
        where: { email }
    });
    try {
        const user = yield prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                last_session,
                update_at,
                date_born: new Date(date_born)
            },
        });
        res.json({ message: 'Usuario credo correctamente', user });
    }
    catch (e) {
        res.status(500).json({ message: 'Error al crear el usuario' });
    }
}));
// Login
app.post("/api/v1/users/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        return res.status(401).json({ message: 'Correo o contrase??a incorrecta' });
    }
    console.log(user);
    const isMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Correo o contrase??a incorrecta' });
    }
    const token = jsonwebtoken_1.default.sign(user, process.env.TOKEN_SECRET, {
        expiresIn: "1h",
    });
    return res.json({ message: 'Inicio de sesion correctamente', user, token });
}));
// List songs
app.get("/api/v1/songs/all", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const songs = yield prisma.song.findMany();
    return res.send({ message: 'Cancion agregada correctamente', songs });
}));
//LISTAR CANCIONES POR ID
app.get("/api/v1/songs/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const result = yield prisma.song.findUnique({
            where: {
                id
            },
        });
        return res.json({ message: 'Todas las canciones', result });
    }
    catch (err) {
        return res.status(404).json({ message: "No se encontro la cancion" });
    }
}));
// Create song
app.post("/api/v1/songs", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    try {
        const song = yield prisma.song.create({
            data
        });
        return res.json({ message: 'Cancion creada correctamente', song });
    }
    catch (e) {
        return res.status(500).json({ message: 'Error al crear la cancion', e });
    }
}));
// Create playlist
app.post("/api/v1/create-playlist", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body || !req.body.name || !req.body.user_id)
        return res.status(400).json({ error: "Solicitud invalida" });
    const { name, user_id } = req.body;
    try {
        const user = yield prisma.user.findUnique({ where: { id: user_id } });
        if (!user)
            throw new Error("Usuario no existe");
        const playlist = yield prisma.playlist.create({
            data: {
                name,
                user: { connect: { id: user_id } }
            }
        });
        return res.json({ message: "Playlist creado correctamente", playlist });
    }
    catch (error) {
        return res.status(404).json({ error: error.message });
    }
}));
// Add song a playlist
app.post("/api/v1/playlist", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_playlist, id_song } = req.body;
        if (!id_playlist || !id_song) {
            return res.status(400).json({ message: "Ambos id_playlist y id_song son requeridos en el cuerpo de la solicitud" });
        }
        const playlist = yield prisma.playlist.update({
            where: { id: id_playlist },
            include: { songs: true },
            data: { songs: { connect: { id: id_song } } }
        });
        return res.json({ message: "Canci??n agregada a la lista de reproducci??n exitosamente", playlist });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Ocurri?? un error al agregar la canci??n a la lista de reproducci??n" });
    }
}));
