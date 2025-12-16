import { INestApplication, Logger } from "@nestjs/common";

import { setupSwagger } from "../../docs";

export interface SetupBootstrapOptions {
  appName: string;
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
  options: SetupBootstrapOptions,
  serverUrls?: string[]
) {
  const logger = new Logger("Bootstrap");
  app.enableShutdownHooks();

  app.enableCors();

  const timeZone = "Asia/Bangkok";
  process.env.TZ = timeZone;

  const d = new Date().toTimeString();
  logger.verbose(`Current UTC Timezone: ${timeZone}: ${d}`);

  const swaggerPath = options.swaggerPath ?? `/api/${options.appName}/docs`;
  setupSwagger(app, options.appName, serverUrls, {
    swaggerTitle:
      options.swaggerTitle ?? `${options.appName} Documentation Swagger`,
    swaggerDescription:
      options.swaggerDescription ?? `${options.appName} Description`,
    swaggerVersion: options.swaggerVersion ?? "1.0",
    swaggerPath,
  });

  await Promise.all([app.listen(options.listenPort, options.listenHost)]).then(
    async () => {
      const url = await app.getUrl();
      console.log(
        [
          `=====================`,
          `Application is running on: ${url}`,
          `Api document on: ${url}${swaggerPath}`,
          `=====================`,
        ].join("\n")
      );
    }
  );
}
