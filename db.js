let pg = require('pg');

let conString = process.env.DB_URL
console.log(conString)
let client = new pg.Client(conString);


const strCreateUsersTable = `CREATE TABLE IF NOT EXISTS Users (id SERIAL PRIMARY KEY, name varchar(255) NOT NULL, email varchar(255) UNIQUE NOT NULL, passHash varchar(255))`
const strInsertIntoUsers = "INSERT INTO Users (name, email, passHash) Values($1, $2, $3)";
const strSelectNow = "SELECT NOW()"
const strSelectAllUsers = "SELECT * FROM Users"
const strDropTable = `DROP TABLE IF EXISTS Users`
const values1 = ["Ravi Saxena", "ravisaxena@gmail.com", "uiuiuhdif456899$34"]
const values2 = ['Swati Maliwal', 'swatimalival@gmail.com', 'sssssdfdfdfdfd']


const connectToDB = async () => {
  await client.connect().then(() => console.log('connected to elephant sql database'))
 .catch((err) => console.error('connection error', err.stack))
  await client.query(strDropTable)
  await client.query(strCreateUsersTable)
}

const executeQuery = async () => {
  let result = undefined;
  try {
    result = await client.query(strSelectAllUsers, [])
    console.log(result.rows)

  }catch(err){
    console.log(err)
  }  
}

const insertIntoUsers = async (name, email, passHash) => {
  let result = await client.query(strInsertIntoUsers, [name, email, passHash])
  return result

}



module.exports = {connectToDB, executeQuery, insertIntoUsers}

