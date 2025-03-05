import express from "express";
import cors from "cors"; // Import CORS package
import dotenvConfig from "./config/dotenvConfig.js";
import askRouter from "./api/ask.js";

dotenvConfig(); 

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Allow all origins to access the API
app.use(
  cors({
    origin: "*", // Allow all origins
    credentials: true, // Allow cookies (optional)
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], 
  })
);

app.use(express.json());

app.use("/ask", askRouter);

app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
