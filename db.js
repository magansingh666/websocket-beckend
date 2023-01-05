let pg = require('pg');

let conString = process.env.DB_URL
console.log(conString)
let client = new pg.Client(conString);


const strCreateUsersTable = `CREATE TABLE IF NOT EXISTS Users (id SERIAL PRIMARY KEY, name varchar(255) NOT NULL, email varchar(255) UNIQUE NOT NULL, passHash varchar(255))`
const strInsertIntoUsers = "INSERT INTO Users (name, email, passHash) Values($1, $2, $3)";
const strSelectNow = "SELECT NOW()"
const strSelectAllUsers = "SELECT * FROM Users"
const strSelectUserByEmail = "SELECT * FROM Users WHERE email = $1"
const strDropTable = `DROP TABLE IF EXISTS Users`
const values1 = ["Ravi Saxena", "ravisaxena@gmail.com", "uiuiuhdif456899$34"]
const values2 = ['Swati Maliwal', 'swatimalival@gmail.com', 'sssssdfdfdfdfd']


const connectToDB = async () => {
  await client.connect().then(() => console.log('connected to elephant sql database'))
 .catch((err) => console.error('connection error', err.stack))
  //await client.query(strDropTable)
  await client.query(strCreateUsersTable)
}

const insertIntoUsers = async (name, email, passHash) => {
  let result = await client.query(strInsertIntoUsers, [name, email, passHash])
  return result
}

const getAllUsers = async () => {
  let result = await client.query(strSelectAllUsers)
  console.log(result.rows)
}

const getUserByEmail = async (email) => {
  let result = await client.query(strSelectUserByEmail,[email])
  //console.log(result)
  return result
}



module.exports = {connectToDB, insertIntoUsers, getUserByEmail}







/*

[
  {
    id: 1,
    name: 'Dummy User 001',
    email: 'dummyuser001@gmail.com',
    passhash: '$2b$10$c8J8.27vGm1RyqPEldbUoOCrwVTkG0IfQAJaDxyzQQtOlDnm5We.2'
  },
  {
    id: 3,
    name: 'Dummy User 002',
    email: 'dummyuser002@gmail.com',
    passhash: '$2b$10$0lOFgqCZZ2tpoDC5VZtUmuxLhhCv//M2pBYWB9imAnxdTuYdrMyRK'
  },
  {
    id: 4,
    name: 'Dummy User 003',
    email: 'dummyuser003@gmail.com',
    passhash: '$2b$10$FEgqpAUH2T42D393yZRBd.qOLn/.x6nYC9E4PVMYqTjuguqPZkwbO'
  }
]




*/