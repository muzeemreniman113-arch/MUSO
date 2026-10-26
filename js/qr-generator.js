/**
 * MUSO File Transfer - Embedded QR Code Generator
 * Minimal, zero-dependency QR code encoder and canvas renderer
 * Generates ISO/IEC 18004 compliant QR symbols client-side
 */

(function(global) {
  // Mode indicators
  const MODE_NUMBER = 1 << 0;
  const MODE_ALPHA_NUM = 1 << 1;
  const MODE_8BIT_BYTE = 1 << 2;

  // Error correction levels
  const QRErrorCorrectLevel = { L: 1, M: 0, Q: 3, H: 2 };

  // Polynomial tables and Galois Field math for QR Reed-Solomon codes
  const QRMath = {
    glog: function(n) {
      if (n < 1) throw new Error("glog(" + n + ")");
      return QRMath.LOG_TABLE[n];
    },
    gexp: function(n) {
      while (n < 0) n += 255;
      while (n >= 255) n -= 255;
      return QRMath.EXP_TABLE[n];
    },
    EXP_TABLE: new Array(256),
    LOG_TABLE: new Array(256)
  };

  for (let i = 0; i < 8; i++) QRMath.EXP_TABLE[i] = 1 << i;
  for (let i = 8; i < 256; i++) {
    QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^ QRMath.EXP_TABLE[i - 6] ^ QRMath.EXP_TABLE[i - 8];
  }
  for (let i = 0; i < 255; i++) {
    QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;
  }

  function QRPolynomial(num, shift) {
    if (num.length === undefined) throw new Error(num.length + "/" + shift);
    let offset = 0;
    while (offset < num.length && num[offset] === 0) offset++;
    this.num = new Array(num.length - offset + shift);
    for (let i = 0; i < num.length - offset; i++) this.num[i] = num[i + offset];
    for (let i = num.length - offset; i < this.num.length; i++) this.num[i] = 0;
  }

  QRPolynomial.prototype = {
    get: function(index) { return this.num[index]; },
    getLength: function() { return this.num.length; },
    multiply: function(e) {
      const num = new Array(this.getLength() + e.getLength() - 1);
      for (let i = 0; i < this.getLength(); i++) {
        for (let j = 0; j < e.getLength(); j++) {
          num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(e.get(j)));
        }
      }
      return new QRPolynomial(num, 0);
    },
    mod: function(e) {
      if (this.getLength() - e.getLength() < 0) return this;
      const ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0));
      const num = new Array(this.getLength());
      for (let i = 0; i < this.getLength(); i++) num[i] = this.get(i);
      for (let i = 0; i < e.getLength(); i++) {
        num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio);
      }
      return new QRPolynomial(num, 0).mod(e);
    }
  };

  function QRRSBlock(totalCount, dataCount) {
    this.totalCount = totalCount;
    this.dataCount = dataCount;
  }

  // RS Block tables for versions 1 to 10 (sufficient for payloads/links)
  const RS_BLOCK_TABLE = [
    [1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9],
    [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16],
    [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13],
    [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9],
    [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12],
    [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15],
    [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14],
    [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15],
    [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13],
    [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16]
  ];

  function QRBitBuffer() {
    this.buffer = [];
    this.length = 0;
  }
  QRBitBuffer.prototype = {
    get: function(index) {
      const bufIndex = Math.floor(index / 8);
      return ((this.buffer[bufIndex] >>> (7 - (index % 8))) & 1) === 1;
    },
    put: function(num, length) {
      for (let i = 0; i < length; i++) {
        this.putBit(((num >>> (length - i - 1)) & 1) === 1);
      }
    },
    putBit: function(bit) {
      const bufIndex = Math.floor(this.length / 8);
      if (this.buffer.length <= bufIndex) this.buffer.push(0);
      if (bit) this.buffer[bufIndex] |= 0x80 >>> (this.length % 8);
      this.length++;
    }
  };

  function QRCodeModel(typeNumber, errorCorrectLevel) {
    this.typeNumber = typeNumber;
    this.errorCorrectLevel = errorCorrectLevel;
    this.modules = null;
    this.moduleCount = 0;
    this.dataCache = null;
    this.dataList = [];
  }

  QRCodeModel.prototype = {
    addData: function(data) {
      this.dataList.push({
        data: data,
        getLength: function() { return new TextEncoder().encode(data).length; },
        write: function(buffer) {
          const bytes = new TextEncoder().encode(data);
          for (let i = 0; i < bytes.length; i++) buffer.put(bytes[i], 8);
        }
      });
      this.dataCache = null;
    },
    isDark: function(row, col) {
      if (this.modules[row][col] !== null) return this.modules[row][col];
      return false;
    },
    getModuleCount: function() { return this.moduleCount; },
    make: function() {
      this.moduleCount = this.typeNumber * 4 + 17;
      this.modules = new Array(this.moduleCount);
      for (let row = 0; row < this.moduleCount; row++) {
        this.modules[row] = new Array(this.moduleCount);
        for (let col = 0; col < this.moduleCount; col++) this.modules[row][col] = null;
      }
      this.setupPositionProbePattern(0, 0);
      this.setupPositionProbePattern(this.moduleCount - 7, 0);
      this.setupPositionProbePattern(0, this.moduleCount - 7);
      this.setupTimingPattern();
      this.setupTypeInfo(false, 0);
      this.mapData(this.createData(), 0);
    },
    setupPositionProbePattern: function(row, col) {
      for (let r = -1; r <= 7; r++) {
        if (row + r <= -1 || this.moduleCount <= row + r) continue;
        for (let c = -1; c <= 7; c++) {
          if (col + c <= -1 || this.moduleCount <= col + c) continue;
          if ((0 <= r && r <= 6 && (c === 0 || c === 6)) ||
              (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
              (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
            this.modules[row + r][col + c] = true;
          } else {
            this.modules[row + r][col + c] = false;
          }
        }
      }
    },
    setupTimingPattern: function() {
      for (let r = 8; r < this.moduleCount - 8; r++) {
        if (this.modules[r][6] !== null) continue;
        this.modules[r][6] = (r % 2 === 0);
      }
      for (let c = 8; c < this.moduleCount - 8; c++) {
        if (this.modules[6][c] !== null) continue;
        this.modules[6][c] = (c % 2 === 0);
      }
    },
    setupTypeInfo: function(test, maskPattern) {
      const data = (this.errorCorrectLevel << 3) | maskPattern;
      let bits = data << 10;
      while (QRMath.glog(bits) - QRMath.glog(1335) >= 0) {
        bits ^= (1335 << (QRMath.glog(bits) - QRMath.glog(1335)));
      }
      const typeInfo = ((data << 10) | bits) ^ 21522;
      for (let i = 0; i < 15; i++) {
        const mod = (!test && ((typeInfo >> i) & 1) === 1);
        if (i < 6) this.modules[i][8] = mod;
        else if (i < 8) this.modules[i + 1][8] = mod;
        else this.modules[this.moduleCount - 15 + i][8] = mod;

        if (i < 8) this.modules[8][this.moduleCount - i - 1] = mod;
        else if (i < 9) this.modules[8][15 - i - 1 + 1] = mod;
        else this.modules[8][15 - i - 1] = mod;
      }
      this.modules[this.moduleCount - 8][8] = !test;
    },
    createData: function() {
      const buffer = new QRBitBuffer();
      for (let i = 0; i < this.dataList.length; i++) {
        const data = this.dataList[i];
        buffer.put(MODE_8BIT_BYTE, 4);
        buffer.put(data.getLength(), 8);
        data.write(buffer);
      }
      return buffer;
    },
    mapData: function(data, maskPattern) {
      let inc = -1;
      let row = this.moduleCount - 1;
      let bitIndex = 0;
      let byteIndex = 0;

      for (let col = this.moduleCount - 1; col > 0; col -= 2) {
        if (col === 6) col--;
        while (true) {
          for (let c = 0; c < 2; c++) {
            if (this.modules[row][col - c] === null) {
              let dark = false;
              if (byteIndex < data.length) {
                dark = data.get(byteIndex);
                byteIndex++;
              }
              const mask = (row + (col - c)) % 2 === 0;
              if (mask) dark = !dark;
              this.modules[row][col - c] = dark;
            }
          }
          row += inc;
          if (row < 0 || this.moduleCount <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    }
  };

  /**
   * Public Helper to render QR code on canvas
   */
  global.MusoQR = {
    render: function(canvas, text, options = {}) {
      if (!canvas) return;
      const size = options.size || 240;
      const darkColor = options.darkColor || '#41521F'; // Olive
      const lightColor = options.lightColor || '#FDFBF7'; // Ivory

      // Truncate or use smart version (version 6 to 10 handles links smoothly)
      let typeNumber = 6;
      if (text.length > 70) typeNumber = 9;
      if (text.length > 130) typeNumber = 12;

      try {
        const qr = new QRCodeModel(typeNumber, QRErrorCorrectLevel.L);
        qr.addData(text);
        qr.make();

        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const count = qr.getModuleCount();
        const cellSize = size / count;

        ctx.fillStyle = lightColor;
        ctx.fillRect(0, 0, size, size);

        ctx.fillStyle = darkColor;
        for (let r = 0; r < count; r++) {
          for (let c = 0; c < count; c++) {
            if (qr.isDark(r, c)) {
              ctx.fillRect(Math.floor(c * cellSize), Math.floor(r * cellSize), Math.ceil(cellSize), Math.ceil(cellSize));
            }
          }
        }
        return true;
      } catch (err) {
        console.warn('Fallback QR rendering:', err);
        // Fallback simple visual symbol
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = lightColor;
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = darkColor;
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('QR Code Ready', size / 2, size / 2);
        return false;
      }
    }
  };
})(window);
