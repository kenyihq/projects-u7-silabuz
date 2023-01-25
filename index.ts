import express, { Express, Request, Response } from 'express';
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { validateAuthorization } from "./middleware";

import bcrypt from "bcrypt"
//import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import e from 'express';

dotenv.config();

// Iniciando el cliente
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

app.post("/api/v1/users", async (req, res) => {
    const { name, email, password, date_born} = req.body;
    const last_session= new Date()
    const update_at= new Date()
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const user = await prisma.user.create({
        data: {
            name ,
            email ,
            password : hashedPassword,
            last_session ,
            update_at ,
            date_born : new Date()
          },
    });
    res.json(user);
  });

app.post("/api/v1/users/login", async (req: Request, res: Response) => {  
    const { email, password } = req.body;  
    const user = await prisma.user.findUnique({  
      where: { email },  
      });  

    if (!user) {  
        return res.status(401).json({ message: 'Invalid email or password' });  
    }  
    console.log(user) 
    
    const isMatch = await bcrypt.compare(password, user.password );  
    if (!isMatch) {  
      return res.status(401).json({ message: 'Invalid email or password' });  
    }  
    
    const token = jwt.sign(user,process.env.TOKEN_SECRET!, {  
      expiresIn: "1h",  
    })  
    return res.json({ message: 'Logged in successfully' ,user, token});  

  });

// List songs
app.get("/api/v1/songs/all", async (req: Request, res: Response) => {
  const songs = await prisma.song.findMany();
    return res.send({ message: 'Song listed successfully', songs});
});

//LISTAR CANCIONES POR ID
app.get("/api/v1/songs/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const result = await prisma.song.findUnique({
        where: {
          id
        },
      });
    return res.json({ message: 'Song listed by id successfully', result});
  } catch (err) {
    return res.status(404).json({ message: "Song not found" });
  }
});


// Create song
app.post("/api/v1/songs", async (req: Request, res: Response) => {
  const data = req.body;
  try{
    const song = await prisma.song.create({
      data
    });
    return res.json({ message: 'Song created successfully' ,song});  
  }catch (e) {
    return res.status(500).json({ message: 'Error creating song', e });
  }
});


// Create playlist
app.post("/api/v1/create-playlist", async (req: Request, res: Response) =>{
    if(!req.body || !req.body.name || !req.body.user_id )
        return res.status(400).json({error: "Invalid request"})
    const { name, user_id } = req.body;
    try {
        const user = await prisma.user.findUnique({where: { id: user_id }})
        if(!user) throw new Error("user not found")
        const playlist = await prisma.playlist.create({
            data : {
                name,
                user: { connect: { id: user_id} }
            }
        });
        return res.json( {message: "Playlist created succesfuly",  playlist} )
    } catch (error) {
        return res.status(404).json({ error: error.message });
    }
})
