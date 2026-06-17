import express, { json } from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler.js";
import authRouter from "./routes/authRoutes.js";
import studentRouter from "./routes/studentRoutes.js";
import eventRouter from "./routes/eventRoutes.js";
import organizerRouter from "./routes/organizerRoutes.js";
import adminRouter from "./routes/adminRoutes.js";

const app = express();

app.use(cors());
app.use(json());

app.use("/api/auth", authRouter);
app.use("/api/students", studentRouter);
app.use("/api/events", eventRouter);
app.use("/api/organizers", organizerRouter);
app.use("/api/admin", adminRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});