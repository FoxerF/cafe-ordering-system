import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import pickupSlotRoutes from "./routes/pickup-slot.routes.js";
import orderRoutes from "./routes/order.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

app.use(
  "/api/categories",
  categoryRoutes,
);

app.use(
  "/api/products",
  productRoutes,
);

app.use(
  "/api/pickup-slots",
  pickupSlotRoutes,
);

app.use(
  "/api/orders",
  orderRoutes,
);

app.use(
  "/api/auth",
  authRoutes,
);

app.use(
  "/api/admin",
  adminRoutes,
);

app.use((_req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

export default app;