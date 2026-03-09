import cors from 'cors';
import express from 'express';
import authRoutes from './routes/auth.routes.js';
import docRoutes from './routes/docs.routes.js';
import docMembersRoutes from "./routes/docs.members.routes.js";
import cookieParser from 'cookie-parser';
import { httpCorsOptions } from './Config/cors.js';
import helmet from 'helmet';
import { globalLimiter } from './middlewares/rateLimit.js';


const app = express();
if (process.env.NODE_ENV === 'production' || process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}
app.use(helmet());
app.use(cors(httpCorsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(globalLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/docs", docRoutes);
app.use("/api/docs", docMembersRoutes);


app.get("/" ,(req, res) =>{
    res.status(200).send("API is running...");
})


export default app;
