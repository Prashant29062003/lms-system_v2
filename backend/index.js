import express from "express";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Connect to database
// await ConnectDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Hello World!");
});

// server start
app.listen(PORT, () => {
    console.log(`App listening at http://localhost:${PORT}`);
})