import appConfig from "../../app.json";

const expoConfig = appConfig.expo;

export const APP_NAME = expoConfig.name;
export const APP_SLUG = expoConfig.slug;
export const APP_VERSION = expoConfig.version;
export const APP_VERSION_LABEL = `v${APP_VERSION}`;
