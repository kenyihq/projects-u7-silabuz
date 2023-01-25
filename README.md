# PROJECT UNIT 07

#### 🏆 PARTICIPANTS
  - Kenyi Hancco
  - Vanesa Huallpa

## STAR PROJECT
### 🧑‍💻 Requirements:

#### ⚡ Install dependencies

####
    npm install
  ####

#### ⚡ Perform migrations

####
    npx prisma migrate dev --name init
  ####

#### ⚡ Run the project 

####
    - npm run dev
  ####

## API 👾🎮♟🎲📲

## Endpoint description:

### Create user
#### POST /api/v1/users

  | Parameter | Type     |  
| :-------- | :------- | 
| name | `string` |
| password | `string` | 
| date_born | `date` 

### Login
#### POST /api/v1/users/login

 Parameter | Type     |  
| :-------- | :------- | 
| email | `string` |
| password | `string` 

### Create song
#### POST /api/v1/songs

|Parameter | Type |
| :------- | :------ | 
| name | string |
| artist | string |
| album | string |
| year | int |
| genre | string |
| duration | int |
