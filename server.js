import express from "express";
import dotenvConfig from "./config/dotenvConfig.js";
import askRouter from "./api/ask.js";

dotenvConfig(); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/ask", askRouter);

app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
