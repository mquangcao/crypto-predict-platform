import { registerAs } from "@nestjs/config";
import { MicroserviceName } from "../constants";

export const getAppConfig = () => ({
  appName: process.env.APP_NAME || "App",
  appPort: parseInt(process.env.PORT, 10) || 3000,
  microserviceName: process.env.MICROSERVICE_NAME as MicroserviceName,
});

export const appConfiguration = registerAs("app", getAppConfig);
