/**
 * MUSO File Transfer - Transfer Manager & P2P Tunnel Dispatcher
 * Handles zero-knowledge link generation, BroadcastChannel inter-tab relay,
 * expiration counters, and tamper verification.
 * Authors: Srivatsa Soham, Reniman Muzeem, Pullayya, Modi
 */

class MusoTransferManager {
  constructor() {
    this.STORAGE_PREFIX = 'MUSO_TRANSFER_';
    this.channelName = 'MUSO_P2P_DATA_TUNNEL_V1';
    this.broadcastChannel = ('BroadcastChannel' in window) ? new BroadcastChannel(this.channelName) : null;
    this.p2pListeners = [];

    if (this.broadcastChannel) {
      this.broadcastChannel.onmessage = (event) => {
        this.handleP2PMessage(event.data);
      };
    }
  }

  /**
   * Save transfer payload to local session repository
   */
  storeTransfer(transferId, containerJson, passphrase = '') {
    const record = {
      id: transferId,
      createdAt: new Date().toISOString(),
      containerJson: containerJson,
      passphrase: passphrase, // Stored only in local memory/session
      downloadsLeft: containerJson.header?.maxDownloads || 1,
      burnAfterRead: !!containerJson.header?.burnAfterRead
    };

    try {
      sessionStorage.setItem(this.STORAGE_PREFIX + transferId, JSON.stringify(record));
    } catch (e) {
      console.warn('SessionStorage quota exceeded, storing in memory cache:', e);
      window._musoMemoryStore = window._musoMemoryStore || {};
      window._musoMemoryStore[transferId] = record;
    }
    return record;
  }

  /**
   * Retrieve transfer by ID
   */
  getTransfer(transferId) {
    let raw = sessionStorage.getItem(this.STORAGE_PREFIX + transferId);
    if (!raw && window._musoMemoryStore && window._musoMemoryStore[transferId]) {
      raw = JSON.stringify(window._musoMemoryStore[transferId]);
    }
    if (!raw) return null;

    const record = JSON.parse(raw);

    // Check expiration
    if (record.containerJson?.header?.expiresAt) {
      const exp = new Date(record.containerJson.header.expiresAt);
      if (new Date() > exp) {
        this.destroyTransfer(transferId);
        throw new Error('This transfer package has expired.');
      }
    }

    // Check download limits
    if (record.downloadsLeft <= 0) {
      this.destroyTransfer(transferId);
      throw new Error('This transfer link was burned or reached maximum allowed downloads.');
    }

    return record;
  }

  /**
   * Burn or decrement transfer download count
   */
  consumeDownload(transferId) {
    const record = this.getTransfer(transferId);
    if (!record) return;

    record.downloadsLeft -= 1;
    if (record.burnAfterRead || record.downloadsLeft <= 0) {
      this.destroyTransfer(transferId);
      if (window.MusoAudit) {
        window.MusoAudit.log('DECRYPTION', 'Burn-After-Reading Executed', { transferId }, 'SUCCESS', 'SHREDDER');
      }
    } else {
      sessionStorage.setItem(this.STORAGE_PREFIX + transferId, JSON.stringify(record));
    }
  }

  /**
   * Delete transfer permanently
   */
  destroyTransfer(transferId) {
    sessionStorage.removeItem(this.STORAGE_PREFIX + transferId);
    if (window._musoMemoryStore && window._musoMemoryStore[transferId]) {
      delete window._musoMemoryStore[transferId];
    }
  }

  /**
   * Generate Shareable Transfer Link
   */
  generateShareUrl(transferId, autoIncludeKey = false, passphrase = '') {
    const baseUrl = window.location.origin + window.location.pathname;
    let hash = `#transfer=${encodeURIComponent(transferId)}`;
    if (autoIncludeKey && passphrase) {
      hash += `&key=${encodeURIComponent(passphrase)}`;
    }
    return baseUrl + hash;
  }

  /**
   * Broadcast P2P Tunnel Message to all tabs or local peers
   */
  sendP2PBroadcast(type, payload) {
    const message = {
      source: 'MUSO_CLIENT_' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      timestamp: new Date().toISOString(),
      type: type,
      payload: payload
    };

    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(message);
    }
    // Also trigger locally
    this.handleP2PMessage(message);
    return message;
  }

  handleP2PMessage(message) {
    this.p2pListeners.forEach(cb => {
      try { cb(message); } catch (e) { console.error('P2P handler error:', e); }
    });
  }

  onP2PMessage(callback) {
    this.p2pListeners.push(callback);
  }
}

window.MusoTransfer = new MusoTransferManager();
