import express, { Request, Response } from 'express';
import cors from "cors";
const mysql = require('mysql2');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DBNAME,
  waitForConnections: true,
  connectionLimit: 5
});

const app = express();
app.use(express.json())

app.use(cors());

const PORT = 8001;

app.get('/expenses', async (req: Request, res: Response) => {
  console.log('request for expenses');

  const connection = await pool.promise().getConnection();
  const [rows,] = await connection.query('SELECT * FROM expenses');
  connection.release();

  res.status(200).send(rows)
});

app.get('/healthz', async (req: Request, res: Response) => {
  console.log('healthz check');
  res.status(200).send({ response: "success" })
});

app.post('/expenses', async (req, res) => {
  try {
    console.log(req.body)
    const connection = await pool.promise().getConnection();
    const price = req.body.price; // TODO: price type check that number
    await connection.query(`INSERT INTO expenses (description, price) VALUES ('${req.body.description}', ${price})`);
    connection.release();
    res.send()
  } catch (e) {
    console.log('cant reach to expenses db')
    console.log(e);
    res.status(500).send();
  }
  console.log(req.body);
  res.status(200).send();
});

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
