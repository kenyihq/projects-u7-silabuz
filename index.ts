import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';


// Importando Prisma Client
import { PrismaClient } from '@prisma/client'

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
   
    const isMatch = await bcrypt.compare(password, user.password ); 
    if (!isMatch) { 
      return res.status(401).json({ message: 'Invalid email or password' }); 
    } 
 
    const token = jwt.sign(email,TOKEN_SECRET, { 
      expiresIn: "1h", 
    }) 
 
    res.cookie('token', token, { httpOnly: true }); 
 
    return res.json({ message: 'Logged in successfully' }); 
    //return res.status(201).json({user, token});      // 201: creado 
  });

// List songs
app.get("/api/v1/songs/all", async (req: Request, res: Response) => {
  const songs = await prisma.song.findMany();
    return res.send({ message: 'Song listed successfully', songs});
});

//LISTAR CANCIONES POR ID
app.get("/api/v1/songs/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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