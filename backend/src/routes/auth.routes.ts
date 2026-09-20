import { Router } from "express";

import {
  login,
  me,
} from "../controllers/auth.controller.js";

import {
  authenticate,
} from "../middleware/auth.middleware.js";

const router = Router();

router.post("/login", login);
// Legacy/plural route alias in case some clients use /logins
router.post("/logins", login);
router.get("/me", authenticate, me);

export default router;