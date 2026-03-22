# Using Happy with WSL (Execution) and Android (Remote)

This guide explains how to run your AI coding agent inside **Windows Subsystem for Linux (WSL)** and control it remotely from your **Android phone** using the Happy app.

## Architecture

```
┌──────────────────────────────┐          ┌──────────────────────┐
│  Windows PC                  │          │  Android Phone       │
│  ┌────────────────────────┐  │          │  ┌────────────────┐  │
│  │  WSL 2 (Ubuntu/Debian) │  │◄────────►│  │  Happy App     │  │
│  │  └─ happy (CLI)        │  │ encrypted│  │  (Play Store)  │  │
│  │     └─ claude / codex  │  │    sync  │  └────────────────┘  │
│  └────────────────────────┘  │          └──────────────────────┘
└──────────────────────────────┘
```

The Happy CLI runs inside WSL and communicates with the Happy server using end-to-end encryption. Your Android phone connects to the same server to display output and send commands — your code never leaves your devices unencrypted.

---

## Step 1: Get the Android App

### Option A — Play Store (Recommended)

Install the official app directly from the Play Store:

[![Get it on Google Play](https://img.shields.io/badge/Google_Play-414141?logo=google-play&logoColor=white)](https://play.google.com/store/apps/details?id=com.ex3ndr.happy)

This is the quickest path and requires no build tooling.

### Option B — Build from Source

If you want to build the app yourself from this repository:

#### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 20 and [yarn](https://yarnpkg.com/)
- An [Expo](https://expo.dev/) account (free)
- [EAS CLI](https://docs.expo.dev/eas/): `npm install -g eas-cli`

#### Cloud Build via EAS (Easiest)

EAS Build compiles the native app in Expo's cloud so you don't need Android Studio locally.

```bash
# From the repo root
cd packages/happy-app

yarn install

# Log in to your Expo account
eas login

# Build a development APK (distributable internally)
eas build --profile development --platform android
```

When the build finishes, EAS provides a download link. Install the APK on your Android device:

```bash
# Transfer the APK to your phone and install it, or
# use the QR code / link that EAS shows in the terminal
```

> **Note:** The development build uses bundle ID `com.slopus.happy.dev` (app name: "Happy (dev)").  
> The production Play Store build uses `com.ex3ndr.happy` (app name: "Happy").

#### Local Build (Android Studio required)

```bash
cd packages/happy-app

yarn install

# Generate native Android directory
yarn prebuild

# Build and run on a connected device or emulator
yarn android:dev
```

---

## Step 2: Set Up the CLI in WSL

All commands below run inside your WSL terminal.

### Install Node.js ≥ 20

```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc   # or restart your terminal
nvm install 20
nvm use 20
```

### Install an AI coding agent

Install at least one of the supported agents:

```bash
# Claude Code
npm install -g @anthropic-ai/claude-code

# OpenAI Codex CLI
npm install -g @openai/codex
```

### Install Happy CLI

```bash
npm install -g happy-coder

# Verify
happy --version
```

---

## Step 3: Authenticate

Run the initial login inside your WSL terminal:

```bash
happy auth login
```

You will see a menu asking whether to authenticate via **mobile app** or **web browser**.

### Option A — Mobile Authentication (QR Code)

Choose **mobile** in the menu. Happy prints a QR code directly in the terminal. Open the Happy app on your Android phone and tap **Scan QR code** to pair.

> **Tip:** If the QR code renders poorly in your terminal, the raw URL is also printed below it. In the Happy app, tap **Enter URL** and paste it manually.

### Option B — Web Authentication

Choose **web** in the menu. Because WSL does not have a display server by default, the browser may not open automatically. Happy always prints the URL:

```
If the browser did not open, please copy and paste this URL:
https://app.happy.engineering/auth?...
```

Copy the URL, paste it into **any browser on your Windows host** (or on your phone), complete the login, and the CLI will detect the completed authentication automatically.

---

## Step 4: Start a Session

```bash
# Claude Code session
happy

# Codex session
happy codex

# Gemini session
happy gemini
```

Happy starts the AI agent locally in WSL and displays the session link in the terminal. When you open the Happy app on your Android phone, the active session appears automatically.

---

## Step 5: Switch Between Local and Remote Control

| Action | How |
|--------|-----|
| **Take control from Android** | Tap the session in the Happy app → tap **Take control** |
| **Return control to WSL** | Press **any key** in your WSL terminal |
| **Send a message from Android** | Type in the message box in the app |
| **Approve a permission from Android** | Tap **Allow** / **Deny** on the permission notification |

When the Android app has control, the WSL terminal shows:

```
Remote mode active — press any key to take back control
```

Pressing any key in the WSL window immediately returns control to the local terminal.

---

## Step 6: Background Mode (Optional)

If you want sessions to keep running after you close your WSL terminal, start the background daemon:

```bash
# Start the daemon (runs in background)
happy daemon start

# Check status
happy daemon status

# List active sessions
happy daemon list

# Stop the daemon
happy daemon stop
```

The daemon survives terminal closures and reconnects automatically when WSL restarts.

---

## Troubleshooting

### QR code does not render in my terminal

WSL terminals sometimes display Unicode block characters incorrectly. Use the URL fallback: copy the `happy://terminal?...` URL that is printed below the QR code and paste it into the Happy app via **Enter URL**.

### Browser does not open for web authentication

This is expected in WSL without an X server. Happy always prints the full URL — copy it and open it in Edge or Chrome on your Windows host, or on your phone.

### `happy` command not found after `npm install -g`

Make sure your global npm bin directory is in `PATH`:

```bash
echo 'export PATH="$PATH:$(npm config get prefix)/bin"' >> ~/.bashrc
source ~/.bashrc
```

### Permission denied / EACCES errors

```bash
# Use nvm-managed Node (avoids permission issues with global packages)
nvm use 20
npm install -g happy-coder
```

### Claude / Codex not found

Verify the agent is installed and accessible from WSL:

```bash
which claude   # should print a path
which codex    # should print a path
```

If not, install it inside WSL (not on the Windows host).

### Network connectivity issues

WSL 2 uses a virtual network adapter. If the Happy CLI cannot reach the Happy server, check that Windows Firewall is not blocking outbound connections from the WSL virtual machine. By default, WSL 2 has full internet access.

---

## EAS Build Profiles Reference

| Profile | App name | Bundle ID | Notes |
|---------|----------|-----------|-------|
| `development` | Happy (dev) | `com.slopus.happy.dev` | Development client with hot reload |
| `preview` | Happy (preview) | `com.slopus.happy.preview` | Beta builds |
| `production` | Happy | `com.ex3ndr.happy` | Same as Play Store build |

See [`packages/happy-app/CONTRIBUTING.md`](../packages/happy-app/CONTRIBUTING.md) for the full build guide including iOS, macOS desktop (Tauri), and OTA update workflows.
