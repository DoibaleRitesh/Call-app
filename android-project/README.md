# Call (PrivateCall India)
### Production-Quality Local-First Android Calling & Privacy Application

Call is a privacy-first cellular dialer engineered specifically for users in India. It merges standard Android telephony with a cryptographically protected private vault and Calling Name Presentation (CNAP) compliance.

---

## Key Features

1. **Local-First & 100% Offline Architecture**
   - Zero internet connectivity required.
   - Zero servers, accounts, or telemetry.
   - All private metadata stays on-device in Room SQLite.

2. **Hidden / Private Contacts**
   - Mark any Android contact as Private.
   - Hidden contacts immediately disappear from standard Contacts, Recents, Favorites, and Search.
   - The original Google/Android contact remains untouched in `ContactsContract`.

3. **Biometric & PIN Vault**
   - Hardware-backed Android Keystore integration.
   - BiometricPrompt with cryptographic salted PIN fallback.
   - Configurable auto-lock (Immediate, 1 min, 5 min) on backgrounding.
   - Android `FLAG_SECURE` prevention against task switcher previews and screenshots.

4. **Zero-Leak Home Screen Shortcut**
   - Home shortcut powered by `ShortcutManager`.
   - Passes zero contact identifiers or history in intent metadata.
   - Directs user through Biometric/PIN authentication before opening.

5. **Indian Telecom CNAP Priority Architecture**
   - Follows TRAI (Telecom Regulatory Authority of India) CNAP specifications:
     1. Incoming number is a Private Contact? -> Show **"Private Contact"** (Hides saved name!).
     2. Incoming number saved locally? -> Show saved contact name.
     3. Telecom network provides CNAP header? -> Show telecom-verified name.
     4. Default fallback -> Show normalized phone number.

6. **Full Default Dialer Integration**
   - `RoleManager.ROLE_DIALER` support.
   - Custom `InCallService` and full-screen incoming call UI.

---

## Technical Stack

- **Language:** Kotlin 2.0+
- **UI:** Jetpack Compose + Material 3
- **Architecture:** Clean Architecture + MVVM + Kotlin Coroutines & StateFlow
- **Database:** Room SQLite
- **Security:** AndroidKeyStore (AES-256-GCM) + BiometricPrompt
- **Telephony:** TelecomManager, InCallService, RoleManager, ContactsContract

---

## How to Build the APK

### Method 1: Using Android Studio (Recommended)
1. Download the project (click **Download Project (.ZIP)** or export to GitHub/ZIP from the settings).
2. Unzip the downloaded file.
3. Open **Android Studio** (Hedgehog 2023.1.1 or newer recommended).
4. Select **Open** and choose the `android-project` folder.
5. Allow Gradle to sync dependencies automatically.
6. In the top menu bar, click:
   **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
7. Once compilation finishes, a popup notification will appear in the bottom right corner with a **locate** link:
   Click **locate** to find `app-debug.apk` inside `app/build/outputs/apk/debug/`.

### Method 2: Using the Command Line (Terminal / PowerShell)
Prerequisites: JDK 17+ installed.

1. Open your terminal and navigate to the project directory:
   ```bash
   cd android-project
   ```
2. Run the Gradle build command:
   - **On macOS / Linux:**
     ```bash
     ./gradlew assembleDebug
     ```
   - **On Windows:**
     ```cmd
     gradlew.bat assembleDebug
     ```
3. Locate your generated APK at:
   ```
   android-project/app/build/outputs/apk/debug/app-debug.apk
   ```

### Method 3: Automated Cloud Build via GitHub Actions
1. Push this repository to GitHub (or export to GitHub via the AI Studio Settings menu).
2. Go to the **Actions** tab in your GitHub repository.
3. The workflow `.github/workflows/build-apk.yml` runs automatically on push.
4. When complete, download the built **Call-App-Debug-APK** artifact directly from the workflow run summary!

---

## Installing the APK on your Android Phone

1. **Direct Transfer:**
   - Transfer `app-debug.apk` to your phone via Google Drive, WhatsApp, USB cable, or email.
   - Tap the APK on your phone and choose **Install** (enable "Install unknown apps" if prompted).
2. **Via ADB (Android Debug Bridge):**
   ```bash
   adb install app/build/outputs/apk/debug/app-debug.apk
   ```
3. On first launch, grant Phone and Contacts permissions and set **Call** as your default phone app when prompted.
