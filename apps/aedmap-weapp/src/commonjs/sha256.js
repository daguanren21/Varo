/**
 * [js-sha256]{@link https://github.com/emn178/js-sha256}
 *
 * @version 0.9.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2014-2017
 * @license MIT
 */
/* jslint bitwise: true */
(function () {
  'use strict'

  const ERROR = 'input is invalid type'
  let WINDOW = typeof window === 'object'
  let root = WINDOW ? window : {}
  if (root.JS_SHA256_NO_WINDOW) {
    WINDOW = false
  }
  const WEB_WORKER = !WINDOW && typeof self === 'object'
  const NODE_JS = false
  if (NODE_JS) {
    root = global
  }
  else if (WEB_WORKER) {
    root = self
  }
  const COMMON_JS = !root.JS_SHA256_NO_COMMON_JS && typeof module === 'object' && module.exports
  const AMD = typeof define === 'function' && define.amd
  const ARRAY_BUFFER = !root.JS_SHA256_NO_ARRAY_BUFFER && typeof ArrayBuffer !== 'undefined'
  const HEX_CHARS = '0123456789abcdef'.split('')
  const EXTRA = [-2147483648, 8388608, 32768, 128]
  const SHIFT = [24, 16, 8, 0]
  const K = [
    0x428A2F98,
    0x71374491,
    0xB5C0FBCF,
    0xE9B5DBA5,
    0x3956C25B,
    0x59F111F1,
    0x923F82A4,
    0xAB1C5ED5,
    0xD807AA98,
    0x12835B01,
    0x243185BE,
    0x550C7DC3,
    0x72BE5D74,
    0x80DEB1FE,
    0x9BDC06A7,
    0xC19BF174,
    0xE49B69C1,
    0xEFBE4786,
    0x0FC19DC6,
    0x240CA1CC,
    0x2DE92C6F,
    0x4A7484AA,
    0x5CB0A9DC,
    0x76F988DA,
    0x983E5152,
    0xA831C66D,
    0xB00327C8,
    0xBF597FC7,
    0xC6E00BF3,
    0xD5A79147,
    0x06CA6351,
    0x14292967,
    0x27B70A85,
    0x2E1B2138,
    0x4D2C6DFC,
    0x53380D13,
    0x650A7354,
    0x766A0ABB,
    0x81C2C92E,
    0x92722C85,
    0xA2BFE8A1,
    0xA81A664B,
    0xC24B8B70,
    0xC76C51A3,
    0xD192E819,
    0xD6990624,
    0xF40E3585,
    0x106AA070,
    0x19A4C116,
    0x1E376C08,
    0x2748774C,
    0x34B0BCB5,
    0x391C0CB3,
    0x4ED8AA4A,
    0x5B9CCA4F,
    0x682E6FF3,
    0x748F82EE,
    0x78A5636F,
    0x84C87814,
    0x8CC70208,
    0x90BEFFFA,
    0xA4506CEB,
    0xBEF9A3F7,
    0xC67178F2,
  ]
  const OUTPUT_TYPES = ['hex', 'array', 'digest', 'arrayBuffer']

  const blocks = []

  if (root.JS_SHA256_NO_NODE_JS || !Array.isArray) {
    Array.isArray = function (obj) {
      return Object.prototype.toString.call(obj) === '[object Array]'
    }
  }

  if (ARRAY_BUFFER && (root.JS_SHA256_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView)) {
    ArrayBuffer.isView = function (obj) {
      return typeof obj === 'object' && obj.buffer && obj.buffer.constructor === ArrayBuffer
    }
  }

  const createOutputMethod = function (outputType, is224) {
    return function (message) {
      return new Sha256(is224, true).update(message)[outputType]()
    }
  }

  const createMethod = function (is224) {
    const method = createOutputMethod('hex', is224)
    method.create = function () {
      return new Sha256(is224)
    }
    method.update = function (message) {
      return method.create().update(message)
    }
    for (let i = 0; i < OUTPUT_TYPES.length; ++i) {
      const type = OUTPUT_TYPES[i]
      method[type] = createOutputMethod(type, is224)
    }
    return method
  }

  const createHmacOutputMethod = function (outputType, is224) {
    return function (key, message) {
      return new HmacSha256(key, is224, true).update(message)[outputType]()
    }
  }

  const createHmacMethod = function (is224) {
    const method = createHmacOutputMethod('hex', is224)
    method.create = function (key) {
      return new HmacSha256(key, is224)
    }
    method.update = function (key, message) {
      return method.create(key).update(message)
    }
    for (let i = 0; i < OUTPUT_TYPES.length; ++i) {
      const type = OUTPUT_TYPES[i]
      method[type] = createHmacOutputMethod(type, is224)
    }
    return method
  }

  function Sha256(is224, sharedMemory) {
    if (sharedMemory) {
      blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3]
        = blocks[4] = blocks[5] = blocks[6] = blocks[7]
          = blocks[8] = blocks[9] = blocks[10] = blocks[11]
            = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0
      this.blocks = blocks
    }
    else {
      this.blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }

    if (is224) {
      this.h0 = 0xC1059ED8
      this.h1 = 0x367CD507
      this.h2 = 0x3070DD17
      this.h3 = 0xF70E5939
      this.h4 = 0xFFC00B31
      this.h5 = 0x68581511
      this.h6 = 0x64F98FA7
      this.h7 = 0xBEFA4FA4
    }
    else { // 256
      this.h0 = 0x6A09E667
      this.h1 = 0xBB67AE85
      this.h2 = 0x3C6EF372
      this.h3 = 0xA54FF53A
      this.h4 = 0x510E527F
      this.h5 = 0x9B05688C
      this.h6 = 0x1F83D9AB
      this.h7 = 0x5BE0CD19
    }

    this.block = this.start = this.bytes = this.hBytes = 0
    this.finalized = this.hashed = false
    this.first = true
    this.is224 = is224
  }

  Sha256.prototype.update = function (message) {
    if (this.finalized) {
      return
    }
    let notString; const type = typeof message
    if (type !== 'string') {
      if (type === 'object') {
        if (message === null) {
          throw new Error(ERROR)
        }
        else if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
          message = new Uint8Array(message)
        }
        else if (!Array.isArray(message)) {
          if (!ARRAY_BUFFER || !ArrayBuffer.isView(message)) {
            throw new Error(ERROR)
          }
        }
      }
      else {
        throw new Error(ERROR)
      }
      notString = true
    }
    let code; let index = 0; let i; const length = message.length; const blocks = this.blocks

    while (index < length) {
      if (this.hashed) {
        this.hashed = false
        blocks[0] = this.block
        blocks[16] = blocks[1] = blocks[2] = blocks[3]
          = blocks[4] = blocks[5] = blocks[6] = blocks[7]
            = blocks[8] = blocks[9] = blocks[10] = blocks[11]
              = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0
      }

      if (notString) {
        for (i = this.start; index < length && i < 64; ++index) {
          blocks[i >> 2] |= message[index] << SHIFT[i++ & 3]
        }
      }
      else {
        for (i = this.start; index < length && i < 64; ++index) {
          code = message.charCodeAt(index)
          if (code < 0x80) {
            blocks[i >> 2] |= code << SHIFT[i++ & 3]
          }
          else if (code < 0x800) {
            blocks[i >> 2] |= (0xC0 | (code >> 6)) << SHIFT[i++ & 3]
            blocks[i >> 2] |= (0x80 | (code & 0x3F)) << SHIFT[i++ & 3]
          }
          else if (code < 0xD800 || code >= 0xE000) {
            blocks[i >> 2] |= (0xE0 | (code >> 12)) << SHIFT[i++ & 3]
            blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3F)) << SHIFT[i++ & 3]
            blocks[i >> 2] |= (0x80 | (code & 0x3F)) << SHIFT[i++ & 3]
          }
          else {
            code = 0x10000 + (((code & 0x3FF) << 10) | (message.charCodeAt(++index) & 0x3FF))
            blocks[i >> 2] |= (0xF0 | (code >> 18)) << SHIFT[i++ & 3]
            blocks[i >> 2] |= (0x80 | ((code >> 12) & 0x3F)) << SHIFT[i++ & 3]
            blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3F)) << SHIFT[i++ & 3]
            blocks[i >> 2] |= (0x80 | (code & 0x3F)) << SHIFT[i++ & 3]
          }
        }
      }

      this.lastByteIndex = i
      this.bytes += i - this.start
      if (i >= 64) {
        this.block = blocks[16]
        this.start = i - 64
        this.hash()
        this.hashed = true
      }
      else {
        this.start = i
      }
    }
    if (this.bytes > 4294967295) {
      this.hBytes += this.bytes / 4294967296 << 0
      this.bytes = this.bytes % 4294967296
    }
    return this
  }

  Sha256.prototype.finalize = function () {
    if (this.finalized) {
      return
    }
    this.finalized = true
    const blocks = this.blocks; const i = this.lastByteIndex
    blocks[16] = this.block
    blocks[i >> 2] |= EXTRA[i & 3]
    this.block = blocks[16]
    if (i >= 56) {
      if (!this.hashed) {
        this.hash()
      }
      blocks[0] = this.block
      blocks[16] = blocks[1] = blocks[2] = blocks[3]
        = blocks[4] = blocks[5] = blocks[6] = blocks[7]
          = blocks[8] = blocks[9] = blocks[10] = blocks[11]
            = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0
    }
    blocks[14] = this.hBytes << 3 | this.bytes >>> 29
    blocks[15] = this.bytes << 3
    this.hash()
  }

  Sha256.prototype.hash = function () {
    let a = this.h0; let b = this.h1; let c = this.h2; let d = this.h3; let e = this.h4; let f = this.h5; let g = this.h6
    let h = this.h7; const blocks = this.blocks; let j; let s0; let s1; let maj; let t1; let t2; let ch; let ab; let da; let cd; let bc

    for (j = 16; j < 64; ++j) {
      // rightrotate
      t1 = blocks[j - 15]
      s0 = ((t1 >>> 7) | (t1 << 25)) ^ ((t1 >>> 18) | (t1 << 14)) ^ (t1 >>> 3)
      t1 = blocks[j - 2]
      s1 = ((t1 >>> 17) | (t1 << 15)) ^ ((t1 >>> 19) | (t1 << 13)) ^ (t1 >>> 10)
      blocks[j] = blocks[j - 16] + s0 + blocks[j - 7] + s1 << 0
    }

    bc = b & c
    for (j = 0; j < 64; j += 4) {
      if (this.first) {
        if (this.is224) {
          ab = 300032
          t1 = blocks[0] - 1413257819
          h = t1 - 150054599 << 0
          d = t1 + 24177077 << 0
        }
        else {
          ab = 704751109
          t1 = blocks[0] - 210244248
          h = t1 - 1521486534 << 0
          d = t1 + 143694565 << 0
        }
        this.first = false
      }
      else {
        s0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))
        s1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))
        ab = a & b
        maj = ab ^ (a & c) ^ bc
        ch = (e & f) ^ (~e & g)
        t1 = h + s1 + ch + K[j] + blocks[j]
        t2 = s0 + maj
        h = d + t1 << 0
        d = t1 + t2 << 0
      }
      s0 = ((d >>> 2) | (d << 30)) ^ ((d >>> 13) | (d << 19)) ^ ((d >>> 22) | (d << 10))
      s1 = ((h >>> 6) | (h << 26)) ^ ((h >>> 11) | (h << 21)) ^ ((h >>> 25) | (h << 7))
      da = d & a
      maj = da ^ (d & b) ^ ab
      ch = (h & e) ^ (~h & f)
      t1 = g + s1 + ch + K[j + 1] + blocks[j + 1]
      t2 = s0 + maj
      g = c + t1 << 0
      c = t1 + t2 << 0
      s0 = ((c >>> 2) | (c << 30)) ^ ((c >>> 13) | (c << 19)) ^ ((c >>> 22) | (c << 10))
      s1 = ((g >>> 6) | (g << 26)) ^ ((g >>> 11) | (g << 21)) ^ ((g >>> 25) | (g << 7))
      cd = c & d
      maj = cd ^ (c & a) ^ da
      ch = (g & h) ^ (~g & e)
      t1 = f + s1 + ch + K[j + 2] + blocks[j + 2]
      t2 = s0 + maj
      f = b + t1 << 0
      b = t1 + t2 << 0
      s0 = ((b >>> 2) | (b << 30)) ^ ((b >>> 13) | (b << 19)) ^ ((b >>> 22) | (b << 10))
      s1 = ((f >>> 6) | (f << 26)) ^ ((f >>> 11) | (f << 21)) ^ ((f >>> 25) | (f << 7))
      bc = b & c
      maj = bc ^ (b & d) ^ cd
      ch = (f & g) ^ (~f & h)
      t1 = e + s1 + ch + K[j + 3] + blocks[j + 3]
      t2 = s0 + maj
      e = a + t1 << 0
      a = t1 + t2 << 0
    }

    this.h0 = this.h0 + a << 0
    this.h1 = this.h1 + b << 0
    this.h2 = this.h2 + c << 0
    this.h3 = this.h3 + d << 0
    this.h4 = this.h4 + e << 0
    this.h5 = this.h5 + f << 0
    this.h6 = this.h6 + g << 0
    this.h7 = this.h7 + h << 0
  }

  Sha256.prototype.hex = function () {
    this.finalize()

    const h0 = this.h0; const h1 = this.h1; const h2 = this.h2; const h3 = this.h3; const h4 = this.h4; const h5 = this.h5
    const h6 = this.h6; const h7 = this.h7

    let hex = HEX_CHARS[(h0 >> 28) & 0x0F] + HEX_CHARS[(h0 >> 24) & 0x0F]
      + HEX_CHARS[(h0 >> 20) & 0x0F] + HEX_CHARS[(h0 >> 16) & 0x0F]
      + HEX_CHARS[(h0 >> 12) & 0x0F] + HEX_CHARS[(h0 >> 8) & 0x0F]
      + HEX_CHARS[(h0 >> 4) & 0x0F] + HEX_CHARS[h0 & 0x0F]
      + HEX_CHARS[(h1 >> 28) & 0x0F] + HEX_CHARS[(h1 >> 24) & 0x0F]
      + HEX_CHARS[(h1 >> 20) & 0x0F] + HEX_CHARS[(h1 >> 16) & 0x0F]
      + HEX_CHARS[(h1 >> 12) & 0x0F] + HEX_CHARS[(h1 >> 8) & 0x0F]
      + HEX_CHARS[(h1 >> 4) & 0x0F] + HEX_CHARS[h1 & 0x0F]
      + HEX_CHARS[(h2 >> 28) & 0x0F] + HEX_CHARS[(h2 >> 24) & 0x0F]
      + HEX_CHARS[(h2 >> 20) & 0x0F] + HEX_CHARS[(h2 >> 16) & 0x0F]
      + HEX_CHARS[(h2 >> 12) & 0x0F] + HEX_CHARS[(h2 >> 8) & 0x0F]
      + HEX_CHARS[(h2 >> 4) & 0x0F] + HEX_CHARS[h2 & 0x0F]
      + HEX_CHARS[(h3 >> 28) & 0x0F] + HEX_CHARS[(h3 >> 24) & 0x0F]
      + HEX_CHARS[(h3 >> 20) & 0x0F] + HEX_CHARS[(h3 >> 16) & 0x0F]
      + HEX_CHARS[(h3 >> 12) & 0x0F] + HEX_CHARS[(h3 >> 8) & 0x0F]
      + HEX_CHARS[(h3 >> 4) & 0x0F] + HEX_CHARS[h3 & 0x0F]
      + HEX_CHARS[(h4 >> 28) & 0x0F] + HEX_CHARS[(h4 >> 24) & 0x0F]
      + HEX_CHARS[(h4 >> 20) & 0x0F] + HEX_CHARS[(h4 >> 16) & 0x0F]
      + HEX_CHARS[(h4 >> 12) & 0x0F] + HEX_CHARS[(h4 >> 8) & 0x0F]
      + HEX_CHARS[(h4 >> 4) & 0x0F] + HEX_CHARS[h4 & 0x0F]
      + HEX_CHARS[(h5 >> 28) & 0x0F] + HEX_CHARS[(h5 >> 24) & 0x0F]
      + HEX_CHARS[(h5 >> 20) & 0x0F] + HEX_CHARS[(h5 >> 16) & 0x0F]
      + HEX_CHARS[(h5 >> 12) & 0x0F] + HEX_CHARS[(h5 >> 8) & 0x0F]
      + HEX_CHARS[(h5 >> 4) & 0x0F] + HEX_CHARS[h5 & 0x0F]
      + HEX_CHARS[(h6 >> 28) & 0x0F] + HEX_CHARS[(h6 >> 24) & 0x0F]
      + HEX_CHARS[(h6 >> 20) & 0x0F] + HEX_CHARS[(h6 >> 16) & 0x0F]
      + HEX_CHARS[(h6 >> 12) & 0x0F] + HEX_CHARS[(h6 >> 8) & 0x0F]
      + HEX_CHARS[(h6 >> 4) & 0x0F] + HEX_CHARS[h6 & 0x0F]
    if (!this.is224) {
      hex += HEX_CHARS[(h7 >> 28) & 0x0F] + HEX_CHARS[(h7 >> 24) & 0x0F]
        + HEX_CHARS[(h7 >> 20) & 0x0F] + HEX_CHARS[(h7 >> 16) & 0x0F]
        + HEX_CHARS[(h7 >> 12) & 0x0F] + HEX_CHARS[(h7 >> 8) & 0x0F]
        + HEX_CHARS[(h7 >> 4) & 0x0F] + HEX_CHARS[h7 & 0x0F]
    }
    return hex
  }

  Sha256.prototype.toString = Sha256.prototype.hex

  Sha256.prototype.digest = function () {
    this.finalize()

    const h0 = this.h0; const h1 = this.h1; const h2 = this.h2; const h3 = this.h3; const h4 = this.h4; const h5 = this.h5
    const h6 = this.h6; const h7 = this.h7

    const arr = [
      (h0 >> 24) & 0xFF,
      (h0 >> 16) & 0xFF,
      (h0 >> 8) & 0xFF,
      h0 & 0xFF,
      (h1 >> 24) & 0xFF,
      (h1 >> 16) & 0xFF,
      (h1 >> 8) & 0xFF,
      h1 & 0xFF,
      (h2 >> 24) & 0xFF,
      (h2 >> 16) & 0xFF,
      (h2 >> 8) & 0xFF,
      h2 & 0xFF,
      (h3 >> 24) & 0xFF,
      (h3 >> 16) & 0xFF,
      (h3 >> 8) & 0xFF,
      h3 & 0xFF,
      (h4 >> 24) & 0xFF,
      (h4 >> 16) & 0xFF,
      (h4 >> 8) & 0xFF,
      h4 & 0xFF,
      (h5 >> 24) & 0xFF,
      (h5 >> 16) & 0xFF,
      (h5 >> 8) & 0xFF,
      h5 & 0xFF,
      (h6 >> 24) & 0xFF,
      (h6 >> 16) & 0xFF,
      (h6 >> 8) & 0xFF,
      h6 & 0xFF,
    ]
    if (!this.is224) {
      arr.push((h7 >> 24) & 0xFF, (h7 >> 16) & 0xFF, (h7 >> 8) & 0xFF, h7 & 0xFF)
    }
    return arr
  }

  Sha256.prototype.array = Sha256.prototype.digest

  Sha256.prototype.arrayBuffer = function () {
    this.finalize()

    const buffer = new ArrayBuffer(this.is224 ? 28 : 32)
    const dataView = new DataView(buffer)
    dataView.setUint32(0, this.h0)
    dataView.setUint32(4, this.h1)
    dataView.setUint32(8, this.h2)
    dataView.setUint32(12, this.h3)
    dataView.setUint32(16, this.h4)
    dataView.setUint32(20, this.h5)
    dataView.setUint32(24, this.h6)
    if (!this.is224) {
      dataView.setUint32(28, this.h7)
    }
    return buffer
  }

  function HmacSha256(key, is224, sharedMemory) {
    let i; const type = typeof key
    if (type === 'string') {
      const bytes = []; const length = key.length; let index = 0; let code
      for (i = 0; i < length; ++i) {
        code = key.charCodeAt(i)
        if (code < 0x80) {
          bytes[index++] = code
        }
        else if (code < 0x800) {
          bytes[index++] = (0xC0 | (code >> 6))
          bytes[index++] = (0x80 | (code & 0x3F))
        }
        else if (code < 0xD800 || code >= 0xE000) {
          bytes[index++] = (0xE0 | (code >> 12))
          bytes[index++] = (0x80 | ((code >> 6) & 0x3F))
          bytes[index++] = (0x80 | (code & 0x3F))
        }
        else {
          code = 0x10000 + (((code & 0x3FF) << 10) | (key.charCodeAt(++i) & 0x3FF))
          bytes[index++] = (0xF0 | (code >> 18))
          bytes[index++] = (0x80 | ((code >> 12) & 0x3F))
          bytes[index++] = (0x80 | ((code >> 6) & 0x3F))
          bytes[index++] = (0x80 | (code & 0x3F))
        }
      }
      key = bytes
    }
    else {
      if (type === 'object') {
        if (key === null) {
          throw new Error(ERROR)
        }
        else if (ARRAY_BUFFER && key.constructor === ArrayBuffer) {
          key = new Uint8Array(key)
        }
        else if (!Array.isArray(key)) {
          if (!ARRAY_BUFFER || !ArrayBuffer.isView(key)) {
            throw new Error(ERROR)
          }
        }
      }
      else {
        throw new Error(ERROR)
      }
    }

    if (key.length > 64) {
      key = (new Sha256(is224, true)).update(key).array()
    }

    const oKeyPad = []; const iKeyPad = []
    for (i = 0; i < 64; ++i) {
      const b = key[i] || 0
      oKeyPad[i] = 0x5C ^ b
      iKeyPad[i] = 0x36 ^ b
    }

    Sha256.call(this, is224, sharedMemory)

    this.update(iKeyPad)
    this.oKeyPad = oKeyPad
    this.inner = true
    this.sharedMemory = sharedMemory
  }
  HmacSha256.prototype = new Sha256()

  HmacSha256.prototype.finalize = function () {
    Sha256.prototype.finalize.call(this)
    if (this.inner) {
      this.inner = false
      const innerHash = this.array()
      Sha256.call(this, this.is224, this.sharedMemory)
      this.update(this.oKeyPad)
      this.update(innerHash)
      Sha256.prototype.finalize.call(this)
    }
  }

  const exports = createMethod()
  exports.sha256 = exports
  exports.sha224 = createMethod(true)
  exports.sha256.hmac = createHmacMethod()
  exports.sha224.hmac = createHmacMethod(true)

  if (COMMON_JS) {
    module.exports = exports
  }
  else {
    root.sha256 = exports.sha256
    root.sha224 = exports.sha224
    if (AMD) {
      define(() => {
        return exports
      })
    }
  }
})()
