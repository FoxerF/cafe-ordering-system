import express from "express";
import cors from "cors";

import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

app.use((_req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

export default app;