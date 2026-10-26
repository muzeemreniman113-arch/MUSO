# MUSO file transfer

> **Secure File Transfer using Encryption**  
> *An Industrial-Grade, Zero-Knowledge Client-Side Cryptographic File Transfer Framework*

---

## 🛡️ Executive Overview

**MUSO file transfer** is a client-side zero-knowledge file encryption and transfer platform engineered for high-security environments including Aerospace & Defense, Healthcare (HIPAA), Critical SCADA Energy Infrastructure, and Executive Corporate Finance.

Every cryptographic operation occurs natively in the user's browser using the **W3C Web Cryptography API (`window.crypto.subtle`)**. Sensitive files, private keys, and passphrases are never sent across the network in plaintext.

---

## 👥 Core Project Credits & Engineering Authors

This project was conceived, architected, and engineered by:

| Engineer | Core Responsibilities & Specialization |
| :--- | :--- |
| **Srivatsa Soham** | **Lead Cryptographic Engineer & Protocol Architect**<br>• Designed the AES-256-GCM authenticated cipher pipeline<br>• Implemented PBKDF2 key derivation schedules (120,000 iterations)<br>• Architected the hybrid RSA-OAEP asymmetric key encapsulation mechanism |
| **Reniman Muzeem** | **Full Stack Systems & Security Infrastructure Engineer**<br>• Engineered zero-knowledge package serialization (`.muso` container format)<br>• Built the memory-safe streaming runtime and ephemeral download token lifecycle<br>• Managed repository architecture, deployment automation, and GitHub integration |
| **Polina Haswitha** | **Zero-Knowledge UI/UX & Client-Side Runtime Engineer**<br>• Designed the industrial design system (Olive, Ivory, and Caramel palette)<br>• Implemented drag-and-drop file ingestion, live telemetry, and entropy analyzers<br>• Created responsive touchpoints and sandbox file previewers |
| **Shaik Saleena** | **Security Auditing, Compliance & Penetration Testing Specialist**<br>• Verified adherence to NIST SP 800-38D and FIPS 140-3 architectural standards<br>• Designed the Man-in-the-Middle (MITM) tamper simulation and authentication tag verification<br>• Implemented DoD 5220.22-M 3-pass zero-fill file shredder protocols |

---

## 🎨 Industrial Color Palette & Design System

The application features a clean, high-readability industrial light theme by default:

* **Ivory (`#FAF8F2` / `#FFFFFF`)**: Warm, low-fatigue base backgrounds and elevated cards.
* **Olive (`#3F5122` / `#586F33`)**: Authoritative, military-spec green primary accents, primary buttons, and verified cryptographic badges.
* **Caramel (`#C47C35` / `#DE9249`)**: Warm golden-amber highlights, callouts, cryptographic key alerts, and action elements.
* **Dark Mode Toggle**: Built-in industrial high-contrast dark theme accessible via the top-right toggle button.

---

## 🔑 Core Functional Modules (100% Functional Buttons)

### 1. 📤 Send & Encrypt Room
* **File Ingestion**: Drag-and-drop or file picker supporting all file extensions and sizes up to 2GB.
* **Pre-Encryption Telemetry**: Instant pre-encryption SHA-256 integrity hash calculation, file size, and MIME detection.
* **Ciphers**:
  * **AES-256-GCM** (NIST SP 800-38D authenticated encryption with 128-bit integrity tag).
  * **RSA-OAEP 2048/4096-bit Hybrid** (Ephemeral AES session key wrapped with recipient's public key).
* **Key Derivation (KDF)**: PBKDF2 with HMAC-SHA-256, 120,000 iterations, and a cryptographically secure 16-byte random salt.
* **Entropy Analysis**: Real-time password entropy calculation (bits) with visual strength meter.
* **Expiration & Burn Controls**: 10 minutes, 1 hour, 24 hours, 7 days, or **Burn After 1 Read** self-destruct mode.
* **Outputs**:
  * Downloadable `.muso` encrypted container file.
  * One-click clipboard copy for secret keys and transfer links.
  * Embedded ISO/IEC 18004 QR code for mobile scanning.
  * One-click direct dispatch to the live P2P tunnel.

### 2. 📥 Receive & Decrypt Room
* **Multi-Input**: Drag-and-drop `.muso` container files or paste container JSON directly.
* **Header Inspection**: Automatic extraction of cipher metadata, salt, IV, expiration, and download limits.
* **Cryptographic Decryption**: WebCrypto AES-GCM decryption with automated GCM tag integrity validation.
* **Integrity Match Engine**: Automatic recalculation of post-decryption SHA-256 compared with original pre-hash digest (Green Verified Genuine Lock).
* **In-Browser Sandbox Preview**: Preview decrypted images, JSON, code, and documents directly in browser memory without writing plaintext to disk.
* **Safe Download**: Native download preserving original filename and MIME type.

### 3. 🌐 Peer-to-Peer Direct Secure Tunnel
* **Simulated WebRTC DataChannel / BroadcastChannel**: Send and receive encrypted streams across browser tabs or windows in real-time.
* **Interactive Tamper Attack Simulation**: Demonstrates what happens during a Man-in-the-Middle attack by corrupting 1 bit in ciphertext, showing AES-GCM's 128-bit tag instantly detecting tampering and raising security alarms.

### 4. 🔐 Key Vault & Ciphers Studio
* **RSA Keypair Generator**: Generates 2048-bit and 4096-bit RSA keys; copy and download SPKI Public (`.pem`) and PKCS8 Private (`.pem`) keys.
* **Symmetric Studio**: Generate 256-bit CSPRNG Hex and Base64 raw cryptographic keys.
* **Multi-Hash Checksum Tool**: Instant real-time calculation of SHA-256, SHA-512, SHA-1, and MD5 (FNV checksum), with hash comparator.
* **DoD 5220.22-M Multi-Pass Shredder**: Simulates 3-pass sanitization (0xAA overwrite -> 0x55 complement -> 0x00 zero-fill) for secure document destruction.

### 5. 📜 Security Audit & Compliance Log
* **Real-Time Audit Trail**: Chronological event logs with timestamp, event ID, algorithm, status, and integrity hashes.
* **Export Options**: One-click export to **JSON** or **CSV** for enterprise security compliance audits.
* **Regulatory Compliance Standards**:
  * **NIST SP 800-38D** (AES-GCM Authenticated Encryption)
  * **FIPS 140-3** (Decentralized Key Cryptographic Architecture)
  * **GDPR Article 32** (Security of Processing & Pseudonymization)
  * **HIPAA Security Rule** (45 CFR § 164.312(a)(2)(iv) Integrity Controls)

### 6. 🚀 Industrial Demo Cases (1-Click Load)
Pre-configured realistic enterprise files ready to test immediately:
1. **Aerospace & Defense**: Orbital Satellite Attitude Telemetry (`.log`)
2. **Healthcare**: Patient Whole-Exome Genomic Sequencing (`.json`)
3. **Critical Infrastructure**: Substation SCADA Protection Settings (`.xml`)
4. **Executive Finance**: Confidential M&A Corporate Escrow Dossier (`.txt`)

---

## 📐 System Architecture & Data Flow (1-Page Specification)

```
[Select File] ➔ [Calculate SHA-256] ➔ [Enter/Generate Secret] ➔ [AES-256-GCM Encryption] ➔ [Package as .MUSO]
                                                                                                  │
                                                                                           (Secure Transfer)
                                                                                                  ▼
[Save/Preview File] ◄─ [Compare Hashes] ◄─ [Calculate SHA-256] ◄─ [Decrypt & Authenticate] ◄─ [Load Container]
```

A dedicated, printable 1-page architecture sheet is available at [`architecture.html`](architecture.html).

### Layered Architecture Stack
| Layer | Description & Cryptographic Primitives |
| :--- | :--- |
| **Container Layer** | Packages ciphertext payload, 12-byte IV (nonce), PBKDF2 salt, file metadata, and expiration controls into structured `.MUSO` container files. |
| **Integrity Layer** | Calculates SHA-256 hashes pre-encryption and post-decryption; exposes comparison fields to verify recovered data and detect tampering. |
| **Key Utility Layer** | Provides symmetric-key generation (AES-256) and RSA key-pair generation (2048/4096-bit) with PEM export controls. |
| **Transfer / Demo Layer** | Offers transfer-link and QR controls plus a peer-to-peer demo interface described as using BroadcastChannel and ephemeral ECDH. |
| **Audit / Reporting Layer** | Displays cryptographic event information (timestamps, algorithms, digests, status) and provides JSON/CSV export controls. |

> **Security note:** AES-GCM provides confidentiality and authentication when used correctly with a unique nonce and a protected key. A SHA-256 hash comparison is useful for detecting differences when the expected hash is trustworthy, but a plain hash by itself is not a digital signature or proof of sender identity.

---

## 📦 Container Specification (`.muso`)

```json
{
  "header": {
    "magic": "MUSO_SECURE_PAYLOAD",
    "version": "MUSO-CIPHER-V1.0",
    "cipher": "AES-256-GCM",
    "kdf": "PBKDF2-HMAC-SHA256",
    "iterations": 120000,
    "timestamp": "2026-10-26T04:00:00.000Z",
    "expiresAt": "2026-10-27T04:00:00.000Z",
    "burnAfterRead": false,
    "maxDownloads": 1
  },
  "fileMeta": {
    "name": "confidential_blueprint.dwg",
    "size": 1048576,
    "type": "application/octet-stream",
    "preHashSha256": "4a7d...31b2",
    "preHashSha512": "89ec...a10f"
  },
  "cryptoMeta": {
    "saltBase64": "rV6K7c9F00aB4z1X2M9Q8A==",
    "ivBase64": "L8mP2v0Q4x9Z1C3V"
  },
  "payloadBase64": "U2FsdGVkX1+..."
}
```

---

## 💻 Quick Start & Running Locally

Because MUSO File Transfer is built using pure vanilla modern web standards and the native Web Crypto API, it runs without any compilation step or external server requirement:

### Option 1: Direct File Launch
Simply double-click `index.html` in your file explorer to open it directly in Google Chrome, Microsoft Edge, Mozilla Firefox, or Apple Safari.

### Option 2: Local HTTP Server (Python)
```bash
# Navigate to the project directory
cd MUSO

# Start a local static server
python -m http.server 8080
```
Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## 🌐 Deployment to GitHub Pages

This repository is pre-configured for GitHub Pages.
1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Deploy MUSO Industrial File Transfer Platform"
   git push -u origin main
   ```
2. In your GitHub repository settings:
   * Navigate to **Settings** > **Pages**
   * Under **Branch**, select `main` and folder `/ (root)`
   * Click **Save**
3. Your industrial secure file transfer website will be live at:
   `https://muzeemreniman113-arch.github.io/MUSO/`

---

## 📄 License & Attribution

Developed for demonstration and industrial evaluation.  
**Copyright © 2026 MUSO File Transfer.**  
Engineered with pride by **Srivatsa Soham, Reniman Muzeem, Polina Haswitha, and Shaik Saleena**.
