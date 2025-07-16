import type { VercelRequest, VercelResponse } from "@vercel/node"
import OpenAI from "openai"
import { db } from "../../../api/_lib/db.js";
import { artists, aiPrompts } from "./db/schema.js";
import {eq} from "drizzle-orm"


