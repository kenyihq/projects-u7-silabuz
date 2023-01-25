import express, { Express, Request, Response } from 'express';
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

dotenv.config();

const prisma = new PrismaClient()
const app: Express = express();
const port = process.env.PORT;
app.use(express.json());
const TOKEN_SECRET = process.env.TOKEN_SECRET || "claveSecreta";

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`El servidor se ejecuta en http://localhost:${port}`);
});

// Create user
app.post("/api/v1/users", async (req: Request, res: Response) => {
    const { name, email, password, date_born} = req.body;
    const last_session= new Date()
    const update_at= new Date()
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user_email = await prisma.user.findUnique(
      {
        where : {email}
      }
    );

    try {
      const user = await prisma.user.create({
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
    } catch (e) { 
        res.status(500).json({ message: 'Error al crear el usuario' });
    }
      
    
  });
// Login
app.post("/api/v1/users/login", async (req: Request, res: Response) => {  
    const { email, password } = req.body;  
    const user = await prisma.user.findUnique({  
      where: { email },  
      });  

    if (!user) {  
        return res.status(401).json({ message: 'Correo o contraseña incorrecta' });  
    }  
    console.log(user) 
    
    const isMatch = await bcrypt.compare(password, user.password );  
    if (!isMatch) {  
      return res.status(401).json({ message: 'Correo o contraseña incorrecta' });  
    }  
    
    const token = jwt.sign(user,process.env.TOKEN_SECRET!, {  
      expiresIn: "1h",  
    })  
    return res.json({ message: 'Inicio de sesion correctamente' ,user, token});  

  });

// List songs
app.get("/api/v1/songs/all", async (req: Request, res: Response) => {
  const songs = await prisma.song.findMany();
    return res.send({ message: 'Cancion agregada correctamente', songs});
});

//LISTAR CANCIONES POR ID
app.get("/api/v1/songs/:id", async (req: Request, res: Response) => {
  try {
    const id =parseInt(req.params.id);
    const result = await prisma.song.findUnique({
        where: {
          id
        },
      });
    return res.json({ message: 'Todas las canciones', result});
  } catch (err) {
    return res.status(404).json({ message: "No se encontro la cancion" });
  }
});


// Create song
app.post("/api/v1/songs", async (req: Request, res: Response) => {
  const data = req.body;
  try{
    const song = await prisma.song.create({
      data
    });
    return res.json({ message: 'Cancion creada correctamente' ,song});  
  }catch (e) {
    return res.status(500).json({ message: 'Error al crear la cancion', e });
  }
});


// Create playlist
app.post("/api/v1/create-playlist", async (req: Request, res: Response) =>{
    if(!req.body || !req.body.name || !req.body.user_id )
        return res.status(400).json({error: "Solicitud invalida"})
    const { name, user_id } = req.body;
    try {
        const user = await prisma.user.findUnique({where: { id: user_id }})
        if(!user) throw new Error("Usuario no existe")
        const playlist = await prisma.playlist.create({
            data : {
                name,
                user: { connect: { id: user_id} }
            }
        });
        return res.json( {message: "Playlist creado correctamente",  playlist} )
    } catch (error) {
        return res.status(404).json({ error: error.message });
    }
})

// Add song a playlist
app.post("/api/v1/playlist", async (req, res) => {
  try {
    const { id_playlist, id_song } = req.body;

    if (!id_playlist || !id_song) {
      return res.status(400).json({ message: "Ambos id_playlist y id_song son requeridos en el cuerpo de la solicitud" });
    }

    const playlist = await prisma.playlist.update({
      where: { id: id_playlist },
      include: { songs: true },
      data: { songs: { connect: { id: id_song } } }
    });

    return res.json({ message: "Canción agregada a la lista de reproducción exitosamente", playlist });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Ocurrió un error al agregar la canción a la lista de reproducción" });
  }
});

