let pg = require('pg');

let conString = process.env.DB_URL
console.log(conString)
let client = new pg.Client(conString);

// Query Strings related to Users relation....
const strCreateUsersTable = `CREATE TABLE IF NOT EXISTS Users (id SERIAL PRIMARY KEY, name varchar(255) NOT NULL, email varchar(255) UNIQUE NOT NULL, passHash varchar(255))`
const strInsertIntoUsers = "INSERT INTO Users (name, email, passHash) Values($1, $2, $3)";
const strSelectNow = "SELECT NOW()"
const strSelectAllUsers = "SELECT * FROM Users"
const strSelectUserByEmail = "SELECT * FROM Users WHERE email = $1"
const strDropTable = `DROP TABLE IF EXISTS Users`


//Query strings related to News
const createNewsTable = `CREATE TABLE IF NOT EXISTS News (id SERIAL PRIMARY KEY, title varchar(255) NOT NULL UNIQUE, subtitle varchar(255),description varchar(255) NOT NULL, uid INT, created DATE, modified DATE , FOREIGN KEY (uid) REFERENCES Users(id) )`
const getAllNews = `SELECT * FROM News`
const insertNews = `INSERT INTO News (title, subtitle, description, uid ,created) Values($1, $2, $3, $4, $5)`
const dropNewsTAble = `DROP TABLE IF EXISTS News`
const getTodayNews = `SELECT * FROM News WHERE created = $1`
const updateNews = `UPDATE News SET title = $1, Subtitle = $2, description = $3, modified = $4  WHERE id = $5`



const connectToDB = async () => {
  await client.connect().then(() => console.log('connected to elephant sql database'))
 .catch((err) => console.error('connection error', err.stack))
  //await client.query(dropNewsTAble)
  await client.query(strCreateUsersTable)
  await client.query(createNewsTable)

  const now = new Date()
  await client.query(insertNews, ["title1", "subtitle1", "descripti1", 1, now])
  await client.query(updateNews, ["title11", "subtitle222", "descr1111", now ,1])

  const result = await client.query(getAllNews)
  console.log("here is result of get all news ")
  console.log(result.rows)
  console.log(now)



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


const insertNewNewsItem = async (title, subtitle, description, uid) => {
  const now = new Date()
  let result = await client.query(insertNews, [title, subtitle, description, uid , now])
  return result
}

const getAllNewsToday = async () => {
  const now = new Date()
  const result = await client.query(getAllNewsToday, [now])
  return result
}

const getAllNewsItems = async () => {
  const result = await client.query(getAllNews)
  return result
}

const modifyNewsItem = async (id, title, subtitle, description) => {
  const now = new Date()
  const result = await client.query(updateNews, [title, subtitle, description, now, id])
}


module.exports = {connectToDB, insertIntoUsers, getUserByEmail, insertNewNewsItem, getAllNewsToday, modifyNewsItem}







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