let pg = require("pg");

// connection string in enviornment variable
let conString = process.env.DB_URL;

// instantiate new post gres client to access data
let client = new pg.Client(conString);

// SQL Query Strings related to Users relation....
const strCreateUsersTable = `CREATE TABLE IF NOT EXISTS Users (id SERIAL PRIMARY KEY, name varchar(255) NOT NULL, email varchar(255) UNIQUE NOT NULL, passHash varchar(255))`;
const strInsertIntoUsers =
  `INSERT INTO Users (name, email, passHash) Values($1, $2, $3)`;
const strSelectNow = `SELECT NOW()`;
const strSelectAllUsers = `SELECT * FROM Users`;
const strSelectUserByEmail = `SELECT * FROM Users WHERE email = $1`;
const strDropUsersTable = `DROP TABLE IF EXISTS Users`;

//Query strings related to News. 
const createNewsTable = `CREATE TABLE IF NOT EXISTS News (id SERIAL PRIMARY KEY, title varchar(255) NOT NULL UNIQUE, subtitle varchar(255),description varchar(255) NOT NULL, name varchar(50) ,uid INT, created DATE, modified DATE , FOREIGN KEY (uid) REFERENCES Users(id) )`;
const getAllNews = `SELECT * FROM News`;
const insertNews = `INSERT INTO News (title, subtitle, description, uid ,created, name) Values($1, $2, $3, $4, $5, $6)`;
const dropNewsTAble = `DROP TABLE IF EXISTS News`;
const getTodayNews = `SELECT * FROM News WHERE created = $1`;
const updateNews = `UPDATE News SET title = $1, Subtitle = $2, description = $3, modified = $4  WHERE id = $5`;

//Query string related to Comments
const strCreateCommentTable = `CREATE TABLE IF NOT EXISTS Comment (id SERIAL PRIMARY KEY, ctext varchar(255) NOT NULL, news_id INT, uid INT, name varchar(50) ,created DATE, FOREIGN KEY (uid) REFERENCES Users(id),FOREIGN KEY (news_id) REFERENCES News(id))`;
const strGetAllComments = `SELECT * FROM Comment`;
const strInsertComment = `INSERT INTO Comment (ctext, news_id, uid ,created, name) Values($1, $2, $3, $4, $5)`;
const strDropCommentTable = `DROP TABLE IF EXISTS Comment`;
const strGetCommentOfNews = `SELECT * FROM Comment WHERE news_id = $1`;

// function to connect to POSTGRE Database
const connectToDB = async () => {
  await client
    .connect()
    .then(() => console.log("connected to elephant sql database"))
    .catch((err) => console.error("connection error", err.stack));

  //await client.query(strDropCommentTable)
  //await client.query(dropNewsTAble)
  //await client.query(strDropUsersTable)

  // Creating database tables if not exists
  await client.query(strCreateUsersTable);
  await client.query(createNewsTable);
  await client.query(strCreateCommentTable);
};

// function for inserting new users in db
const insertIntoUsers = async (name, email, passHash) => {
  let result = await client.query(strInsertIntoUsers, [name, email, passHash]);
  return result;
};

// function for getting all users from db
const getAllUsers = async () => {
  let result = await client.query(strSelectAllUsers);
  return result;
};

// function to search a user by email
const getUserByEmail = async (email) => {
  let result = await client.query(strSelectUserByEmail, [email]);
  
  return result;
};

// function to insert new news item
const insertNewNewsItem = async (
  title,
  subtitle,
  description,
  uid,
  name = undefined
) => {
  const now = new Date();
  let result = await client.query(insertNews, [
    title,
    subtitle,
    description,
    uid,
    now,
    name,
  ]);
  return result;
};

// function to get all news item of TODAY
const getAllNewsToday = async () => {
  const now = new Date();
  const result = await client.query(getTodayNews, [now]);
  result.rows.reverse();
  return result;
};

// function to get all news items
const getAllNewsItems = async () => {
  const result = await client.query(getAllNews);
  return result;
};

// function to modify a news item
const modifyNewsItem = async (id, title, subtitle, description) => {
  const now = new Date();
  const result = await client.query(updateNews, [
    title,
    subtitle,
    description,
    now,
    id,
  ]);
};

// function to insert comment
const insertComment = async (ctext, news_id, uid, name = undefined) => {
  const now = new Date();
  const result = await client.query(strInsertComment, [
    ctext,
    news_id,
    uid,
    now,
    name,
  ]);
  return result;
};

// function to get comment of a specific news
const getCommentOfNews = async (news_id) => {
  const result = await client.query(strGetCommentOfNews, [news_id]);
  result.rows.reverse();
  return result;
};

module.exports = {
  connectToDB,
  insertIntoUsers,
  getUserByEmail,
  insertNewNewsItem,
  getAllNewsToday,
  modifyNewsItem,
  getAllNewsItems,
  insertComment,
  getCommentOfNews,
};
