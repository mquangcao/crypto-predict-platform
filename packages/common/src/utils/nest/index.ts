import { INestApplication, Logger } from "@nestjs/common";

import { setupSwagger } from "../../docs";
import { getConfig } from "../config";
import { MicroserviceOptions } from "@nestjs/microservices";
import {
  HttpLoggingInterceptor,
  HttpResponseInterceptor,
} from "../../interceptors";
import { HttpExceptionFilter } from "../../filters";

export interface SetupBootstrapOptions {
  swaggerTitle?: string;
  swaggerDescription?: string;
  swaggerVersion?: string;
  swaggerPath?: string;
  listenPort?: number;
  listenHost?: string;
  logLevel?: "log" | "error" | "warn" | "debug" | "verbose";
}

export async function setupBootstrap(
  app: INestApplication<any>,
  options: SetupBootstrapOptions = {},
  serverUrls?: string[],
) {
  const logger = new Logger("Bootstrap");
  app.enableShutdownHooks();

  app.enableCors();

  const timeZone = getConfig("core.defaultTimeZone") || "Asia/Bangkok";
  process.env.TZ = timeZone;

  const d = new Date().toTimeString();
  logger.verbose(`Current UTC Timezone: ${timeZone}: ${d}`);

  app.useGlobalInterceptors(
    new HttpResponseInterceptor(),
    HttpLoggingInterceptor({ logLevel: options.logLevel ?? "debug" }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.setGlobalPrefix("api");

  const appName = getConfig<string>("appName");
  const swaggerPath = options.swaggerPath ?? `/${appName}/docs`;
  setupSwagger(app, appName, serverUrls, {
    swaggerTitle: options.swaggerTitle ?? `${appName} Documentation Swagger`,
    swaggerDescription: options.swaggerDescription ?? `${appName} Description`,
    swaggerVersion: options.swaggerVersion ?? "1.0",
    swaggerPath,
  });

  const initServices = getConfig("core.gateway.initServices", []);
  for (const serviceId of initServices) {
    const serviceOptions = getConfig<MicroserviceOptions>(
      `core.gateway.services.${serviceId}`,
    );
    app.connectMicroservice<MicroserviceOptions>(serviceOptions);
  }

  const port = options.listenPort ?? getConfig<number>("port");
  const host = options.listenHost ?? getConfig<string>("host", "0.0.0.0");

  await Promise.all([app.startAllMicroservices(), app.listen(port, host)]).then(
    async () => {
      const url = await app.getUrl();
      console.log(
        [
          `=====================`,
          `Application is running on: ${url}`,
          `Api document on: ${url}${swaggerPath}`,
          `=====================`,
        ].join("\n"),
      );
    },
  );
}
