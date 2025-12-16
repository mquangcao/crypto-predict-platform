import * as config from "config";

export function getConfig<T = any>(configPath: string, defaultValue?: T): T {
  return config.has(configPath) ? config.get(configPath) : defaultValue;
}
