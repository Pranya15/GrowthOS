import fs from "node:fs";
import path from "node:path";
import type { CapacitorConfig } from "@capacitor/cli";

function readEnvFileValue(filePath: string, key: string) {
  if (!fs.existsSync(filePath)) {
    return "";
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const currentKey = line.slice(0, separatorIndex).trim();
    if (currentKey !== key) {
      continue;
    }

    return line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
  }

  return "";
}

function resolveMobileAppUrl() {
  const directValue = process.env.MOBILE_APP_URL?.trim();
  if (directValue) {
    return directValue;
  }

  const envMobilePath = path.join(process.cwd(), ".env.mobile");
  return readEnvFileValue(envMobilePath, "MOBILE_APP_URL");
}

const mobileAppUrl = resolveMobileAppUrl();

const config: CapacitorConfig = {
  appId: "com.growthos.app",
  appName: "Growth OS",
  webDir: "mobile-shell",
  android: {
    allowMixedContent: true
  },
  server: mobileAppUrl
    ? {
        url: mobileAppUrl,
        cleartext: mobileAppUrl.startsWith("http://")
      }
    : undefined
};

export default config;
