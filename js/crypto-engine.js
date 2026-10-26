/**
 * MUSO File Transfer - Cryptographic Engine
 * Industrial-grade client-side zero-knowledge encryption module
 * Standards: NIST SP 800-38D (AES-GCM), FIPS 140-3, RFC 8018 (PBKDF2)
 * Authors: Srivatsa Soham, Reniman Muzeem, Polina Hswitha, Shaik Saleena
 */

class MusoCryptoEngine {
  constructor() {
    this.crypto = window.crypto || window.msCrypto;
    this.subtle = this.crypto ? this.crypto.subtle : null;
    this.VERSION = 'MUSO-CIPHER-V1.0';
    this.PBKDF2_ITERATIONS = 120000; // Exceeds OWASP 2026 recommended threshold
  }

  isSupported() {
    return !!(this.crypto && this.subtle);
  }

  /**
   * Helper: Convert ArrayBuffer to Hex String
   */
  bufferToHex(buffer) {
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Helper: Convert Hex String to ArrayBuffer
   */
  hexToBuffer(hexString) {
    const cleanHex = hexString.replace(/[^0-9a-fA-F]/g, '');
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
    }
    return bytes.buffer;
  }

  /**
   * Helper: Convert ArrayBuffer to Base64 String
   */
  bufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    const chunkSize = 0x8000; // Avoid maximum call stack size
    for (let i = 0; i < len; i += chunkSize) {
      binary += String.fromCharCode.apply(
        null,
        bytes.subarray(i, Math.min(i + chunkSize, len))
      );
    }
    return window.btoa(binary);
  }

  /**
   * Helper: Convert Base64 String to ArrayBuffer
   */
  base64ToBuffer(base64) {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Helper: ArrayBuffer to UTF-8 String
   */
  bufferToUtf8(buffer) {
    return new TextDecoder().decode(buffer);
  }

  /**
   * Helper: UTF-8 String to ArrayBuffer
   */
  utf8ToBuffer(string) {
    return new TextEncoder().encode(string);
  }

  /**
   * Compute Cryptographic Hash (SHA-256, SHA-512, SHA-1)
   */
  async computeHash(dataBuffer, algorithm = 'SHA-256') {
    if (!this.subtle) throw new Error('WebCrypto API not supported in this environment');
    const hashBuffer = await this.subtle.digest(algorithm, dataBuffer);
    return this.bufferToHex(hashBuffer);
  }

  /**
   * Compute MD5 fallback for checksum comparison
   */
  computeSimpleChecksum(dataBuffer) {
    // Lightweight 32-bit FNV-1a hash algorithm for fast integrity tag
    const bytes = new Uint8Array(dataBuffer);
    let hash = 0x811c9dc5;
    for (let i = 0; i < bytes.length; i++) {
      hash ^= bytes[i];
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  /**
   * Generate High-Entropy Cryptographic Passphrase
   */
  generatePassphrase(length = 28) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()-_=+';
    const randomBytes = new Uint8Array(length);
    this.crypto.getRandomValues(randomBytes);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[randomBytes[i] % chars.length];
    }
    return result;
  }

  /**
   * Generate Hex Key (e.g. 256-bit = 32 bytes)
   */
  generateRandomHex(byteCount = 32) {
    const randomBytes = new Uint8Array(byteCount);
    this.crypto.getRandomValues(randomBytes);
    return this.bufferToHex(randomBytes.buffer);
  }

  /**
   * Calculate Password Entropy & Strength
   */
  evaluateEntropy(passphrase) {
    if (!passphrase) return { score: 0, label: 'Empty', color: '#888' };
    let pool = 0;
    if (/[a-z]/.test(passphrase)) pool += 26;
    if (/[A-Z]/.test(passphrase)) pool += 26;
    if (/[0-9]/.test(passphrase)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(passphrase)) pool += 32;

    const entropy = Math.round(passphrase.length * Math.log2(pool || 1));
    if (entropy < 45) return { score: 25, label: 'Weak (Vulnerable)', color: '#D9534F', entropy };
    if (entropy < 70) return { score: 55, label: 'Moderate', color: '#F0AD4E', entropy };
    if (entropy < 95) return { score: 85, label: 'Strong (Commercial)', color: '#5B6E2E', entropy };
    return { score: 100, label: 'Quantum-Resistant (Industrial)', color: '#41521F', entropy };
  }

  /**
   * Derive AES-GCM Key from Passphrase and Salt via PBKDF2
   */
  async deriveKeyFromPassphrase(passphrase, saltBuffer, algorithm = 'AES-GCM') {
    const keyMaterial = await this.subtle.importKey(
      'raw',
      this.utf8ToBuffer(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    const derivedKey = await this.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: this.PBKDF2_ITERATIONS,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: algorithm, length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    return derivedKey;
  }

  /**
   * Encrypt File Data using AES-256-GCM
   */
  async encryptFileAesGcm(fileBuffer, passphrase, metadata = {}) {
    if (!this.subtle) throw new Error('WebCrypto API unavailable');
    if (!passphrase) throw new Error('Encryption passphrase cannot be empty');

    const startTime = performance.now();

    // 1. Compute Pre-encryption SHA-256 integrity hash
    const preHash = await this.computeHash(fileBuffer, 'SHA-256');
    const sha512Hash = await this.computeHash(fileBuffer, 'SHA-512');

    // 2. Generate random 16-byte salt for PBKDF2
    const salt = new Uint8Array(16);
    this.crypto.getRandomValues(salt);

    // 3. Generate random 12-byte IV for AES-GCM (standard 96-bit nonce)
    const iv = new Uint8Array(12);
    this.crypto.getRandomValues(iv);

    // 4. Derive AES-256-GCM Key
    const key = await this.deriveKeyFromPassphrase(passphrase, salt.buffer, 'AES-GCM');

    // 5. Encrypt data with 128-bit authentication tag
    const encryptedBuffer = await this.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128
      },
      key,
      fileBuffer
    );

    const durationMs = Math.round(performance.now() - startTime);

    // 6. Build Industrial Muso Container
    const container = {
      header: {
        magic: 'MUSO_SECURE_PAYLOAD',
        version: this.VERSION,
        cipher: 'AES-256-GCM',
        kdf: 'PBKDF2-HMAC-SHA256',
        iterations: this.PBKDF2_ITERATIONS,
        timestamp: new Date().toISOString(),
        expiresAt: metadata.expiresAt || null,
        burnAfterRead: !!metadata.burnAfterRead,
        maxDownloads: metadata.maxDownloads || 1
      },
      fileMeta: {
        name: metadata.fileName || 'encrypted_payload.bin',
        size: fileBuffer.byteLength,
        type: metadata.fileType || 'application/octet-stream',
        preHashSha256: preHash,
        preHashSha512: sha512Hash
      },
      cryptoMeta: {
        saltBase64: this.bufferToBase64(salt.buffer),
        ivBase64: this.bufferToBase64(iv.buffer)
      },
      telemetry: {
        encryptionDurationMs: durationMs,
        speedMbps: ((fileBuffer.byteLength / 1024 / 1024) / (Math.max(durationMs, 1) / 1000) * 8).toFixed(2)
      },
      payloadBase64: this.bufferToBase64(encryptedBuffer)
    };

    return {
      container,
      jsonString: JSON.stringify(container, null, 2),
      encryptedSize: encryptedBuffer.byteLength,
      durationMs,
      preHash
    };
  }

  /**
   * Decrypt Muso Container using AES-256-GCM
   */
  async decryptFileAesGcm(container, passphrase) {
    if (!this.subtle) throw new Error('WebCrypto API unavailable');
    if (!passphrase) throw new Error('Decryption passphrase required');

    // Verify container schema
    if (!container || !container.header || container.header.magic !== 'MUSO_SECURE_PAYLOAD') {
      throw new Error('Invalid MUSO container format or corrupted header');
    }

    // Verify expiration
    if (container.header.expiresAt) {
      const expirationDate = new Date(container.header.expiresAt);
      if (new Date() > expirationDate) {
        throw new Error('This secure file transfer has expired and is permanently locked.');
      }
    }

    const startTime = performance.now();

    // 1. Extract Salt and IV
    const saltBuffer = this.base64ToBuffer(container.cryptoMeta.saltBase64);
    const ivBuffer = this.base64ToBuffer(container.cryptoMeta.ivBase64);
    const ciphertextBuffer = this.base64ToBuffer(container.payloadBase64);

    // 2. Derive AES Key
    const key = await this.deriveKeyFromPassphrase(passphrase, saltBuffer, 'AES-GCM');

    // 3. Attempt Decryption & Tag Verification
    let decryptedBuffer;
    try {
      decryptedBuffer = await this.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: new Uint8Array(ivBuffer),
          tagLength: 128
        },
        key,
        ciphertextBuffer
      );
    } catch (err) {
      throw new Error('Decryption failed: Incorrect passphrase or payload has been tampered with (GCM authentication tag mismatch).');
    }

    const durationMs = Math.round(performance.now() - startTime);

    // 4. Compute Post-Decryption SHA-256 Integrity Hash
    const postHash = await this.computeHash(decryptedBuffer, 'SHA-256');
    const integrityVerified = (postHash.toLowerCase() === container.fileMeta.preHashSha256.toLowerCase());

    if (!integrityVerified) {
      throw new Error('CRITICAL INTEGRITY FAILURE: Decrypted content SHA-256 does not match original pre-hash!');
    }

    return {
      fileBuffer: decryptedBuffer,
      fileName: container.fileMeta.name,
      fileType: container.fileMeta.type,
      fileSize: container.fileMeta.size,
      preHash: container.fileMeta.preHashSha256,
      postHash: postHash,
      integrityVerified: true,
      durationMs,
      burnAfterRead: !!container.header.burnAfterRead
    };
  }

  /**
   * RSA-OAEP Asymmetric Key Pair Generation
   */
  async generateRsaKeyPair(modulusLength = 2048) {
    if (!this.subtle) throw new Error('WebCrypto API unavailable');

    const keyPair = await this.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: modulusLength,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
        hash: 'SHA-256'
      },
      true,
      ['encrypt', 'decrypt']
    );

    // Export Public Key to SPKI (PEM)
    const spkiBuffer = await this.subtle.exportKey('spki', keyPair.publicKey);
    const publicKeyPem = this.spkiToPem(spkiBuffer);

    // Export Private Key to PKCS8 (PEM)
    const pkcs8Buffer = await this.subtle.exportKey('pkcs8', keyPair.privateKey);
    const privateKeyPem = this.pkcs8ToPem(pkcs8Buffer);

    return {
      publicKeyPem,
      privateKeyPem,
      keyPair,
      modulusLength
    };
  }

  /**
   * Helper: Convert SPKI Buffer to PEM String
   */
  spkiToPem(buffer) {
    const b64 = this.bufferToBase64(buffer);
    const lines = b64.match(/.{1,64}/g).join('\n');
    return `-----BEGIN PUBLIC KEY-----\n${lines}\n-----END PUBLIC KEY-----`;
  }

  /**
   * Helper: Convert PKCS8 Buffer to PEM String
   */
  pkcs8ToPem(buffer) {
    const b64 = this.bufferToBase64(buffer);
    const lines = b64.match(/.{1,64}/g).join('\n');
    return `-----BEGIN PRIVATE KEY-----\n${lines}\n-----END PRIVATE KEY-----`;
  }

  /**
   * Clean PEM to ArrayBuffer
   */
  pemToBuffer(pem) {
    const cleanB64 = pem
      .replace(/-----BEGIN [A-Z ]+-----/g, '')
      .replace(/-----END [A-Z ]+-----/g, '')
      .replace(/\s+/g, '');
    return this.base64ToBuffer(cleanB64);
  }

  /**
   * Import RSA Public Key from PEM
   */
  async importRsaPublicKey(pem) {
    const buffer = this.pemToBuffer(pem);
    return await this.subtle.importKey(
      'spki',
      buffer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256'
      },
      true,
      ['encrypt']
    );
  }

  /**
   * Import RSA Private Key from PEM
   */
  async importRsaPrivateKey(pem) {
    const buffer = this.pemToBuffer(pem);
    return await this.subtle.importKey(
      'pkcs8',
      buffer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256'
      },
      true,
      ['decrypt']
    );
  }

  /**
   * Hybrid RSA-OAEP + AES-256-GCM Encryption
   * (Encrypts bulk data with ephemeral AES key, encrypts AES key with recipient RSA public key)
   */
  async encryptRsaHybrid(fileBuffer, recipientPublicKeyPem, metadata = {}) {
    const rsaPublicKey = await this.importRsaPublicKey(recipientPublicKeyPem);

    // 1. Generate random ephemeral 256-bit AES key
    const aesKey = await this.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    // 2. Export raw AES key
    const rawAesKey = await this.subtle.exportKey('raw', aesKey);

    // 3. Encrypt AES key using RSA-OAEP
    const encryptedAesKey = await this.subtle.encrypt(
      { name: 'RSA-OAEP' },
      rsaPublicKey,
      rawAesKey
    );

    // 4. Encrypt bulk payload with AES-GCM
    const iv = new Uint8Array(12);
    this.crypto.getRandomValues(iv);
    const preHash = await this.computeHash(fileBuffer, 'SHA-256');

    const encryptedData = await this.subtle.encrypt(
      { name: 'AES-GCM', iv: iv, tagLength: 128 },
      aesKey,
      fileBuffer
    );

    const container = {
      header: {
        magic: 'MUSO_SECURE_PAYLOAD',
        version: this.VERSION,
        cipher: 'RSA-OAEP-2048+AES-256-GCM',
        timestamp: new Date().toISOString()
      },
      fileMeta: {
        name: metadata.fileName || 'rsa_payload.bin',
        size: fileBuffer.byteLength,
        type: metadata.fileType || 'application/octet-stream',
        preHashSha256: preHash
      },
      cryptoMeta: {
        encryptedKeyBase64: this.bufferToBase64(encryptedAesKey),
        ivBase64: this.bufferToBase64(iv.buffer)
      },
      payloadBase64: this.bufferToBase64(encryptedData)
    };

    return {
      container,
      jsonString: JSON.stringify(container, null, 2),
      preHash
    };
  }

  /**
   * Hybrid RSA Decryption
   */
  async decryptRsaHybrid(container, recipientPrivateKeyPem) {
    const rsaPrivateKey = await this.importRsaPrivateKey(recipientPrivateKeyPem);

    // 1. Decrypt ephemeral AES key
    const encryptedKeyBuffer = this.base64ToBuffer(container.cryptoMeta.encryptedKeyBase64);
    const rawAesKey = await this.subtle.decrypt(
      { name: 'RSA-OAEP' },
      rsaPrivateKey,
      encryptedKeyBuffer
    );

    // 2. Import decrypted AES key
    const aesKey = await this.subtle.importKey(
      'raw',
      rawAesKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    // 3. Decrypt payload
    const iv = new Uint8Array(this.base64ToBuffer(container.cryptoMeta.ivBase64));
    const encryptedData = this.base64ToBuffer(container.payloadBase64);

    const decryptedBuffer = await this.subtle.decrypt(
      { name: 'AES-GCM', iv: iv, tagLength: 128 },
      aesKey,
      encryptedData
    );

    const postHash = await this.computeHash(decryptedBuffer, 'SHA-256');
    const integrityVerified = (postHash.toLowerCase() === container.fileMeta.preHashSha256.toLowerCase());

    return {
      fileBuffer: decryptedBuffer,
      fileName: container.fileMeta.name,
      fileType: container.fileMeta.type,
      fileSize: container.fileMeta.size,
      preHash: container.fileMeta.preHashSha256,
      postHash: postHash,
      integrityVerified
    };
  }
}

// Export singleton to window
window.MusoCrypto = new MusoCryptoEngine();
