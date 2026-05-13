import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import { PaymentController } from "./app/modules/payment/payemnt.controller";
import router from "./app/routes";

const app: Application = express();

// Webhook must be before other middleware
app.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    PaymentController.handleStripeWebhooksEvent
);

// app.use(cors({
//     origin: ["http://localhost:3000", "http://localhost:5173"],
//     credentials: true,
// }));

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());





app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Welcome to MedSupply API",
    });
});

app.set("trust proxy", 1);

app.use("/api/v1", router);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
