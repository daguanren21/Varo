import kotlin from './kotlin.js'

if (typeof kotlin === 'undefined') {
  throw new Error('Error loading module \'esptouch-v2\'. Its dependency \'kotlin\' was not found. Please, check whether \'kotlin\' is loaded prior to \'esptouch-v2\'.')
}

function initLib(_, Kotlin) {
  'use strict'
  const toByte = Kotlin.toByte
  const Kind_OBJECT = Kotlin.Kind.OBJECT
  const Kind_CLASS = Kotlin.Kind.CLASS
  const encodeToByteArray = Kotlin.kotlin.text.encodeToByteArray_pdl1vz$
  const split = Kotlin.kotlin.text.split_ip8yn$
  const toInt = Kotlin.kotlin.text.toInt_6ic1pp$
  const IndexOutOfBoundsException_init = Kotlin.kotlin.IndexOutOfBoundsException_init
  const L0 = Kotlin.Long.ZERO
  const JsMath = Math
  const Exception_init = Kotlin.kotlin.Exception_init_pdl1vj$
  const ArrayList_init = Kotlin.kotlin.collections.ArrayList_init_mqih57$
  const contentToString = Kotlin.arrayToString
  const println = Kotlin.kotlin.io.println_s8jyv4$
  const Random = Kotlin.kotlin.random.Random_za3lpa$
  const ArrayList_init_0 = Kotlin.kotlin.collections.ArrayList_init_287e2$
  const arrayCopy = Kotlin.kotlin.collections.arrayCopy
  const Enum = Kotlin.kotlin.Enum
  const throwISE = Kotlin.throwISE
  Padding.prototype = Object.create(Enum.prototype)
  Padding.prototype.constructor = Padding
  function AES(keyWords) {
    AES$Companion_getInstance()
    this.keyWords = keyWords
    this.keySize_0 = this.keyWords.length
    this.numRounds_0 = this.keySize_0 + 6 | 0
    this.ksRows_0 = (this.numRounds_0 + 1 | 0) * 4 | 0
    const $receiver = new Int32Array(this.ksRows_0)
    let tmp$
    for (let ksRow = 0; ksRow < $receiver.length; ksRow++) {
      if (ksRow < this.keySize_0) {
        tmp$ = this.keyWords[ksRow]
      }
      else {
        let t = $receiver[ksRow - 1 | 0]
        if (ksRow % this.keySize_0 === 0) {
          t = t << 8 | t >>> 24
          t = AES$Companion_getInstance().SBOX_0[ext8(t, 24)] << 24 | AES$Companion_getInstance().SBOX_0[ext8(t, 16)] << 16 | AES$Companion_getInstance().SBOX_0[ext8(t, 8)] << 8 | AES$Companion_getInstance().SBOX_0[t & 255]
          t = t ^ AES$Companion_getInstance().RCON_0[ksRow / this.keySize_0 | 0 | 0] << 24
        }
        else if (this.keySize_0 > 6 && ksRow % this.keySize_0 === 4) {
          t = AES$Companion_getInstance().SBOX_0[ext8(t, 24)] << 24 | AES$Companion_getInstance().SBOX_0[ext8(t, 16)] << 16 | AES$Companion_getInstance().SBOX_0[ext8(t, 8)] << 8 | AES$Companion_getInstance().SBOX_0[t & 255]
        }tmp$ = $receiver[ksRow - this.keySize_0 | 0] ^ t
      }
      $receiver[ksRow] = tmp$
    }
    this.keySchedule_0 = $receiver
    const $receiver_0 = new Int32Array(this.ksRows_0)
    for (let invKsRow = 0; invKsRow < $receiver_0.length; invKsRow++) {
      const ksRow_0 = this.ksRows_0 - invKsRow | 0
      const t_0 = invKsRow % 4 !== 0 ? this.keySchedule_0[ksRow_0] : this.keySchedule_0[ksRow_0 - 4 | 0]
      $receiver_0[invKsRow] = invKsRow < 4 || ksRow_0 <= 4 ? t_0 : AES$Companion_getInstance().INV_SUB_MIX_0_0[AES$Companion_getInstance().SBOX_0[ext8(t_0, 24)]] ^ AES$Companion_getInstance().INV_SUB_MIX_1_0[AES$Companion_getInstance().SBOX_0[ext8(t_0, 16)]] ^ AES$Companion_getInstance().INV_SUB_MIX_2_0[AES$Companion_getInstance().SBOX_0[ext8(t_0, 8)]] ^ AES$Companion_getInstance().INV_SUB_MIX_3_0[AES$Companion_getInstance().SBOX_0[t_0 & 255]]
    }
    this.invKeySchedule_0 = $receiver_0
  }
  AES.prototype.encryptBlock_u4kcgn$ = function (M, offset) {
    this.doCryptBlock_0(M, offset, this.keySchedule_0, AES$Companion_getInstance().SUB_MIX_0_0, AES$Companion_getInstance().SUB_MIX_1_0, AES$Companion_getInstance().SUB_MIX_2_0, AES$Companion_getInstance().SUB_MIX_3_0, AES$Companion_getInstance().SBOX_0)
  }
  AES.prototype.decryptBlock_u4kcgn$ = function (M, offset) {
    let t = M[offset + 1 | 0]
    M[offset + 1 | 0] = M[offset + 3 | 0]
    M[offset + 3 | 0] = t
    this.doCryptBlock_0(M, offset, this.invKeySchedule_0, AES$Companion_getInstance().INV_SUB_MIX_0_0, AES$Companion_getInstance().INV_SUB_MIX_1_0, AES$Companion_getInstance().INV_SUB_MIX_2_0, AES$Companion_getInstance().INV_SUB_MIX_3_0, AES$Companion_getInstance().INV_SBOX_0)
    t = M[offset + 1 | 0]
    M[offset + 1 | 0] = M[offset + 3 | 0]
    M[offset + 3 | 0] = t
  }
  AES.prototype.doCryptBlock_0 = function (M, offset, keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX) {
    let tmp$, tmp$_0, tmp$_1, tmp$_2, tmp$_3, tmp$_4, tmp$_5, tmp$_6, tmp$_7
    let s0 = M[offset + 0 | 0] ^ keySchedule[0]
    let s1 = M[offset + 1 | 0] ^ keySchedule[1]
    let s2 = M[offset + 2 | 0] ^ keySchedule[2]
    let s3 = M[offset + 3 | 0] ^ keySchedule[3]
    let ksRow = 4
    tmp$ = this.numRounds_0
    for (let round = 1; round < tmp$; round++) {
      const t0 = SUB_MIX_0[ext8(s0, 24)] ^ SUB_MIX_1[ext8(s1, 16)] ^ SUB_MIX_2[ext8(s2, 8)] ^ SUB_MIX_3[ext8(s3, 0)] ^ keySchedule[tmp$_0 = ksRow, ksRow = tmp$_0 + 1 | 0, tmp$_0]
      const t1 = SUB_MIX_0[ext8(s1, 24)] ^ SUB_MIX_1[ext8(s2, 16)] ^ SUB_MIX_2[ext8(s3, 8)] ^ SUB_MIX_3[ext8(s0, 0)] ^ keySchedule[tmp$_1 = ksRow, ksRow = tmp$_1 + 1 | 0, tmp$_1]
      const t2 = SUB_MIX_0[ext8(s2, 24)] ^ SUB_MIX_1[ext8(s3, 16)] ^ SUB_MIX_2[ext8(s0, 8)] ^ SUB_MIX_3[ext8(s1, 0)] ^ keySchedule[tmp$_2 = ksRow, ksRow = tmp$_2 + 1 | 0, tmp$_2]
      const t3 = SUB_MIX_0[ext8(s3, 24)] ^ SUB_MIX_1[ext8(s0, 16)] ^ SUB_MIX_2[ext8(s1, 8)] ^ SUB_MIX_3[ext8(s2, 0)] ^ keySchedule[tmp$_3 = ksRow, ksRow = tmp$_3 + 1 | 0, tmp$_3]
      s0 = t0
      s1 = t1
      s2 = t2
      s3 = t3
    }
    const t0_0 = (SBOX[ext8(s0, 24)] << 24 | SBOX[ext8(s1, 16)] << 16 | SBOX[ext8(s2, 8)] << 8 | SBOX[ext8(s3, 0)]) ^ keySchedule[tmp$_4 = ksRow, ksRow = tmp$_4 + 1 | 0, tmp$_4]
    const t1_0 = (SBOX[ext8(s1, 24)] << 24 | SBOX[ext8(s2, 16)] << 16 | SBOX[ext8(s3, 8)] << 8 | SBOX[ext8(s0, 0)]) ^ keySchedule[tmp$_5 = ksRow, ksRow = tmp$_5 + 1 | 0, tmp$_5]
    const t2_0 = (SBOX[ext8(s2, 24)] << 24 | SBOX[ext8(s3, 16)] << 16 | SBOX[ext8(s0, 8)] << 8 | SBOX[ext8(s1, 0)]) ^ keySchedule[tmp$_6 = ksRow, ksRow = tmp$_6 + 1 | 0, tmp$_6]
    const t3_0 = (SBOX[ext8(s3, 24)] << 24 | SBOX[ext8(s0, 16)] << 16 | SBOX[ext8(s1, 8)] << 8 | SBOX[ext8(s2, 0)]) ^ keySchedule[tmp$_7 = ksRow, ksRow = tmp$_7 + 1 | 0, tmp$_7]
    M[offset + 0 | 0] = t0_0
    M[offset + 1 | 0] = t1_0
    M[offset + 2 | 0] = t2_0
    M[offset + 3 | 0] = t3_0
  }
  function AES$Companion() {
    AES$Companion_instance = this
    this.SBOX_0 = new Int32Array(256)
    this.INV_SBOX_0 = new Int32Array(256)
    this.SUB_MIX_0_0 = new Int32Array(256)
    this.SUB_MIX_1_0 = new Int32Array(256)
    this.SUB_MIX_2_0 = new Int32Array(256)
    this.SUB_MIX_3_0 = new Int32Array(256)
    this.INV_SUB_MIX_0_0 = new Int32Array(256)
    this.INV_SUB_MIX_1_0 = new Int32Array(256)
    this.INV_SUB_MIX_2_0 = new Int32Array(256)
    this.INV_SUB_MIX_3_0 = new Int32Array(256)
    this.RCON_0 = new Int32Array([0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54])
    const array = new Int32Array(256)
    let tmp$
    tmp$ = array.length - 1 | 0
    for (let i = 0; i <= tmp$; i++) {
      array[i] = i >= 128 ? i << 1 ^ 283 : i << 1
    }
    const d = array
    let x = 0
    let xi = 0
    for (let i_0 = 0; i_0 < 256; i_0++) {
      let sx = xi ^ xi << 1 ^ xi << 2 ^ xi << 3 ^ xi << 4
      sx = sx >>> 8 ^ sx & 255 ^ 99
      this.SBOX_0[x] = sx
      this.INV_SBOX_0[sx] = x
      const x2 = d[x]
      const x4 = d[x2]
      const x8 = d[x4]
      var t
      t = (d[sx] * 257 | 0) ^ Kotlin.imul(sx, 16843008)
      this.SUB_MIX_0_0[x] = t << 24 | t >>> 8
      this.SUB_MIX_1_0[x] = t << 16 | t >>> 16
      this.SUB_MIX_2_0[x] = t << 8 | t >>> 24
      this.SUB_MIX_3_0[x] = t << 0
      t = Kotlin.imul(x8, 16843009) ^ (x4 * 65537 | 0) ^ (x2 * 257 | 0) ^ Kotlin.imul(x, 16843008)
      this.INV_SUB_MIX_0_0[sx] = t << 24 | t >>> 8
      this.INV_SUB_MIX_1_0[sx] = t << 16 | t >>> 16
      this.INV_SUB_MIX_2_0[sx] = t << 8 | t >>> 24
      this.INV_SUB_MIX_3_0[sx] = t << 0
      if (x === 0) {
        x = 1
        xi = 1
      }
      else {
        x = x2 ^ d[d[d[x8 ^ x2]]]
        xi = xi ^ d[d[xi]]
      }
    }
  }
  AES$Companion.prototype.toIntArray_0 = function ($receiver) {
    let tmp$, tmp$_0, tmp$_1, tmp$_2
    const out = new Int32Array($receiver.length / 4 | 0)
    let m = 0
    for (let n = 0; n < out.length; n++) {
      const v3 = $receiver[tmp$ = m, m = tmp$ + 1 | 0, tmp$] & 255
      const v2 = $receiver[tmp$_0 = m, m = tmp$_0 + 1 | 0, tmp$_0] & 255
      const v1 = $receiver[tmp$_1 = m, m = tmp$_1 + 1 | 0, tmp$_1] & 255
      const v0 = $receiver[tmp$_2 = m, m = tmp$_2 + 1 | 0, tmp$_2] & 255
      out[n] = v0 << 0 | v1 << 8 | v2 << 16 | v3 << 24
    }
    return out
  }
  AES$Companion.prototype.toByteArray_0 = function ($receiver) {
    let tmp$, tmp$_0, tmp$_1, tmp$_2
    const out = new Int8Array($receiver.length * 4 | 0)
    let m = 0
    for (let n = 0; n < $receiver.length; n++) {
      const v = $receiver[n]
      out[tmp$ = m, m = tmp$ + 1 | 0, tmp$] = toByte(v >> 24 & 255)
      out[tmp$_0 = m, m = tmp$_0 + 1 | 0, tmp$_0] = toByte(v >> 16 & 255)
      out[tmp$_1 = m, m = tmp$_1 + 1 | 0, tmp$_1] = toByte(v >> 8 & 255)
      out[tmp$_2 = m, m = tmp$_2 + 1 | 0, tmp$_2] = toByte(v >> 0 & 255)
    }
    return out
  }
  AES$Companion.prototype.addPadding_0 = function (data, blockSize, padding) {
    let tmp$
    switch (padding.name) {
      case 'NoPadding':
        tmp$ = data
        break
      case 'PKCS7Padding':
        var paddingSize = blockSize - data.length % blockSize | 0
        var array = new Int8Array(data.length + paddingSize | 0)
        var tmp$_0
        tmp$_0 = array.length - 1 | 0
        for (let i = 0; i <= tmp$_0; i++) {
          array[i] = i < data.length ? data[i] : toByte(paddingSize)
        }

        tmp$ = array
        break
      default:tmp$ = Kotlin.noWhenBranchMatched()
        break
    }
    return tmp$
  }
  AES$Companion.prototype.removePadding_0 = function (data, padding) {
    let tmp$
    switch (padding.name) {
      case 'NoPadding':
        tmp$ = data
        break
      case 'PKCS7Padding':
        var paddingSize = data[data.length - 1 | 0] & 255
        var result = new Int8Array(data.length - paddingSize | 0)
        arraycopy(data, 0, result, 0, result.length)
        tmp$ = result
        break
      default:tmp$ = Kotlin.noWhenBranchMatched()
        break
    }
    return tmp$
  }
  AES$Companion.prototype.getIV_0 = function (srcIV) {
    const dstIV = new Int8Array(16)
    if (srcIV != null) {
      const min = srcIV.length < dstIV.length ? srcIV.length : dstIV.length
      arraycopy(srcIV, 0, dstIV, 0, min)
    } return dstIV
  }
  AES$Companion.prototype.encryptAes128Cbc_g608rk$ = function (data, key, iv, padding) {
    if (iv === void 0) { iv = null }
    if (padding === void 0) { padding = Padding$NoPadding_getInstance() }
    const pData = this.addPadding_0(data, 16, padding)
    const aes = AES_init(key)
    const words = this.toIntArray_0(pData)
    const wordsLength = words.length
    const ivWords = this.toIntArray_0(this.getIV_0(iv))
    let s0 = ivWords[0]
    let s1 = ivWords[1]
    let s2 = ivWords[2]
    let s3 = ivWords[3]
    for (let n = 0; n < wordsLength; n += 4) {
      words[n + 0 | 0] = words[n + 0 | 0] ^ s0
      words[n + 1 | 0] = words[n + 1 | 0] ^ s1
      words[n + 2 | 0] = words[n + 2 | 0] ^ s2
      words[n + 3 | 0] = words[n + 3 | 0] ^ s3
      aes.encryptBlock_u4kcgn$(words, n)
      s0 = words[n + 0 | 0]
      s1 = words[n + 1 | 0]
      s2 = words[n + 2 | 0]
      s3 = words[n + 3 | 0]
    }
    return this.toByteArray_0(words)
  }
  AES$Companion.prototype.decryptAes128Cbc_g608rk$ = function (data, key, iv, padding) {
    if (iv === void 0) { iv = null }
    if (padding === void 0) { padding = Padding$NoPadding_getInstance() }
    const aes = AES_init(key)
    const dataWords = this.toIntArray_0(data)
    const wordsLength = dataWords.length
    const ivWords = this.toIntArray_0(this.getIV_0(iv))
    let s0 = ivWords[0]
    let s1 = ivWords[1]
    let s2 = ivWords[2]
    let s3 = ivWords[3]
    for (let n = 0; n < wordsLength; n += 4) {
      const t0 = dataWords[n + 0 | 0]
      const t1 = dataWords[n + 1 | 0]
      const t2 = dataWords[n + 2 | 0]
      const t3 = dataWords[n + 3 | 0]
      aes.decryptBlock_u4kcgn$(dataWords, n)
      dataWords[n + 0 | 0] = dataWords[n + 0 | 0] ^ s0
      dataWords[n + 1 | 0] = dataWords[n + 1 | 0] ^ s1
      dataWords[n + 2 | 0] = dataWords[n + 2 | 0] ^ s2
      dataWords[n + 3 | 0] = dataWords[n + 3 | 0] ^ s3
      s0 = t0
      s1 = t1
      s2 = t2
      s3 = t3
    }
    return this.removePadding_0(this.toByteArray_0(dataWords), padding)
  }
  AES$Companion.$metadata$ = { kind: Kind_OBJECT, simpleName: 'Companion', interfaces: [] }
  var AES$Companion_instance = null
  function AES$Companion_getInstance() {
    if (AES$Companion_instance === null) {
      new AES$Companion()
    } return AES$Companion_instance
  }
  AES.$metadata$ = { kind: Kind_CLASS, simpleName: 'AES', interfaces: [] }
  function AES_init(key, $this) {
    $this = $this || Object.create(AES.prototype)
    AES.call($this, AES$Companion_getInstance().toIntArray_0(key))
    return $this
  }
  function getProvisionPackets(address, ssid, bssid, password, reserved, aesKey, appPort, portMark) {
    const ssidData = ssid != null ? encodeToByteArray(ssid) : null
    const bssidSplits = split(bssid, [':'])
    const array = new Int8Array(6)
    let tmp$
    tmp$ = array.length - 1 | 0
    for (let i = 0; i <= tmp$; i++) {
      array[i] = toByte(toInt(bssidSplits.get_za3lpa$(i), 16))
    }
    const bssidData = array
    const passwordData = password != null ? encodeToByteArray(password) : null
    const reservedData = reserved != null ? encodeToByteArray(reserved) : null
    const aesKeyData = aesKey != null ? encodeToByteArray(aesKey) : null
    const params = new EspProvisioningParams(address, ssidData, bssidData, passwordData, reservedData, aesKeyData, appPort, portMark)
    return params.getDataPackets()
  }
  function getSyncPacket() {
    return new Int8Array(768)
  }
  function stringToByteArray(s) {
    return encodeToByteArray(s)
  }
  function EspInputStream(buf, offset, length) {
    if (offset === void 0) { offset = 0 }
    if (length === void 0) { length = buf.length }
    this.buf = buf
    this.pos_0 = 0
    this.count_0 = 0
    this.mark_0 = 0
    this.count_0 = this.buf.length
    this.pos_0 = offset
    this.mark_0 = offset
    const a = offset + length | 0
    const b = this.buf.length
    this.count_0 = JsMath.min(a, b)
  }
  EspInputStream.prototype.read = function () {
    let tmp$, tmp$_0
    if (this.pos_0 < this.count_0) {
      tmp$_0 = this.buf[tmp$ = this.pos_0, this.pos_0 = tmp$ + 1 | 0, tmp$] & 255
    }
    else {
      tmp$_0 = -1
    }
    return tmp$_0
  }
  EspInputStream.prototype.read_mj6st8$ = function (b, off, len) {
    let lenIn = len
    if (off < 0 || lenIn < 0 || lenIn > (b.length - off | 0)) {
      throw IndexOutOfBoundsException_init()
    } if (this.pos_0 >= this.count_0) {
      return -1
    } const avail = this.count_0 - this.pos_0 | 0
    if (lenIn > avail) {
      lenIn = avail
    } if (lenIn <= 0) {
      return 0
    }arraycopy(this.buf, this.pos_0, b, off, lenIn)
    this.pos_0 = this.pos_0 + lenIn | 0
    return lenIn
  }
  EspInputStream.prototype.skip_s8cxhz$ = function (n) {
    let k = Kotlin.Long.fromInt(this.count_0).subtract(Kotlin.Long.fromInt(this.pos_0))
    if (n.compareTo_11rb$(k) < 0) {
      k = n.toNumber() < 0 ? L0 : n
    } this.pos_0 = this.pos_0 + k.toInt() | 0
    return k
  }
  EspInputStream.prototype.available = function () {
    return this.count_0 - this.pos_0 | 0
  }
  EspInputStream.prototype.markSupported = function () {
    return true
  }
  EspInputStream.prototype.mark_za3lpa$ = function (readAheadLimit) {
    this.mark_0 = this.pos_0
  }
  EspInputStream.prototype.reset = function () {
    this.pos_0 = this.mark_0
  }
  EspInputStream.$metadata$ = { kind: Kind_CLASS, simpleName: 'EspInputStream', interfaces: [] }
  function EspOutputStream(size) {
    if (size === void 0) { size = 0 }
    this.buf_0 = null
    this.count_0 = 0
    if (size > 0) {
      this.buf_0 = new Int8Array(size)
    }
    else {
      this.buf_0 = new Int8Array(32)
    }
    this.MAX_ARRAY_SIZE_0 = 2147483639
  }
  EspOutputStream.prototype.ensureCapacity_0 = function (minCapacity) {
    if ((minCapacity - this.buf_0.length | 0) > 0) { this.grow_0(minCapacity) }
  }
  EspOutputStream.prototype.grow_0 = function (minCapacity) {
    const oldCapacity = this.buf_0.length
    let newCapacity = oldCapacity << 1
    if ((newCapacity - minCapacity | 0) < 0) { newCapacity = minCapacity }
    if ((newCapacity - this.MAX_ARRAY_SIZE_0 | 0) > 0) { newCapacity = this.hugeCapacity_0(minCapacity) }
    const copy = new Int8Array(newCapacity)
    const tmp$ = this.buf_0
    const a = this.buf_0.length
    const b = newCapacity
    arraycopy(tmp$, 0, copy, 0, JsMath.min(a, b))
    this.buf_0 = copy
  }
  EspOutputStream.prototype.hugeCapacity_0 = function (minCapacity) {
    if (minCapacity < 0) { throw Exception_init('Out of memory') }
    return minCapacity > this.MAX_ARRAY_SIZE_0 ? 2147483647 : this.MAX_ARRAY_SIZE_0
  }
  EspOutputStream.prototype.write_za3lpa$ = function (b) {
    this.ensureCapacity_0(this.count_0 + 1 | 0)
    this.buf_0[this.count_0] = toByte(b)
    this.count_0 = this.count_0 + 1 | 0
  }
  EspOutputStream.prototype.write_mj6st8$ = function (b, off, len) {
    if (off === void 0) { off = 0 }
    if (len === void 0) { len = b.length }
    if (off < 0 || off > b.length || len < 0 || (off + len - b.length | 0) > 0) {
      throw IndexOutOfBoundsException_init()
    } this.ensureCapacity_0(this.count_0 + len | 0)
    arraycopy(b, off, this.buf_0, this.count_0, len)
    this.count_0 = this.count_0 + len | 0
  }
  EspOutputStream.prototype.writeTo_2t2ctf$ = function (out) {
    out.write_mj6st8$(this.buf_0, 0, this.count_0)
  }
  EspOutputStream.prototype.reset = function () {
    this.count_0 = 0
  }
  EspOutputStream.prototype.toByteArray = function () {
    const result = new Int8Array(this.count_0)
    arraycopy(this.buf_0, 0, result, 0, this.count_0)
    return result
  }
  EspOutputStream.prototype.size = function () {
    return this.count_0
  }
  EspOutputStream.$metadata$ = { kind: Kind_CLASS, simpleName: 'EspOutputStream', interfaces: [] }
  function EspPacketUtils() {
    EspPacketUtils$Companion_getInstance()
  }
  function EspPacketUtils$Companion() {
    EspPacketUtils$Companion_instance = this
  }
  EspPacketUtils$Companion.prototype.getSyncPacket = function () {
    return new Int8Array(1048)
  }
  EspPacketUtils$Companion.prototype.getSequenceSizePacket_za3lpa$ = function (size) {
    const length = 1072 + size - 1 | 0
    return new Int8Array(length)
  }
  EspPacketUtils$Companion.prototype.getSequencePacket_za3lpa$ = function (sequence) {
    const length = 128 + sequence | 0
    return new Int8Array(length)
  }
  EspPacketUtils$Companion.prototype.getDataPacket_vux9f0$ = function (data, index) {
    const length = index << 7 | 64 | data
    return new Int8Array(length)
  }
  EspPacketUtils$Companion.$metadata$ = { kind: Kind_OBJECT, simpleName: 'Companion', interfaces: [] }
  var EspPacketUtils$Companion_instance = null
  function EspPacketUtils$Companion_getInstance() {
    if (EspPacketUtils$Companion_instance === null) {
      new EspPacketUtils$Companion()
    } return EspPacketUtils$Companion_instance
  }
  function EspProvisioningParams(address, ssid, bssid, password, reservedData, aesKey, appPort, portMark) {
    this.DEBUG_0 = true
    this.VERSION_0 = 0
    this.SEQUENCE_FIRST_0 = -1
    this.emptyData_0 = new Int8Array(0)
    this.address_0 = null
    this.ssid_0 = null
    this.bssid_0 = null
    this.password_0 = null
    this.reservedData_0 = null
    this.aesKey_0 = null
    this.appPort_0 = 0
    this.appPortMark_0 = 0
    this.willEncrypt_0 = false
    this.passwordEncode_0 = false
    this.reservedEncode_0 = false
    this.ssidEncode_0 = false
    this.head_0 = new Int8Array(6)
    this.dataPackets_0 = ArrayList_init_0()
    this.address_0 = address.length === 4 ? address : new Int8Array([toByte(appPort & 255), toByte(appPort >> 8 & 255)])
    this.ssid_0 = ssid ?? this.emptyData_0
    this.bssid_0 = bssid
    this.password_0 = password ?? this.emptyData_0
    this.reservedData_0 = reservedData ?? this.emptyData_0
    this.aesKey_0 = aesKey ?? this.emptyData_0
    this.appPort_0 = appPort
    this.appPortMark_0 = portMark
    this.parse_0()
    this.generate_0()
  }
  EspProvisioningParams.prototype.getDataPackets = function () {
    return ArrayList_init(this.dataPackets_0)
  }
  EspProvisioningParams.prototype.randomBytes_0 = function (random, length) {
    const array = new Int8Array(length)
    let tmp$
    tmp$ = array.length - 1 | 0
    for (let i = 0; i <= tmp$; i++) {
      array[i] = toByte(random.nextInt() & 127)
    }
    return array
  }
  EspProvisioningParams.prototype.checkCharEncode_0 = function (data) {
    let tmp$
    for (tmp$ = 0; tmp$ !== data.length; ++tmp$) {
      const b = data[tmp$]
      if (b < 0) {
        return true
      }
    }
    return false
  }
  EspProvisioningParams.prototype.crc_0 = function (data, length) {
    if (length === void 0) { length = data.length }
    const crc = new TouchCRC8()
    crc.update_mj6st8$(data, 0, length)
    return crc.getValue()
  }
  EspProvisioningParams.prototype.parse_0 = function () {
    let tmp$ = !(this.aesKey_0.length === 0)
    if (tmp$) {
      let tmp$_0 = !(this.password_0.length === 0)
      if (!tmp$_0) {
        tmp$_0 = !(this.reservedData_0.length === 0)
      }tmp$ = tmp$_0
    } this.willEncrypt_0 = tmp$
    this.ssidEncode_0 = this.checkCharEncode_0(this.ssid_0)
    this.passwordEncode_0 = this.checkCharEncode_0(this.password_0)
    this.reservedEncode_0 = this.checkCharEncode_0(this.reservedData_0)
    const ssidInfo = this.ssid_0.length | (this.ssidEncode_0 ? 128 : 0)
    const passwordInfo = this.password_0.length | (this.passwordEncode_0 ? 128 : 0)
    const reservedInfo = this.reservedData_0.length | (this.reservedEncode_0 ? 128 : 0)
    const bssidCrc = this.crc_0(this.bssid_0)
    const isIPv4 = this.address_0.length === 4
    const flag = (isIPv4 ? 1 : 0) | (this.willEncrypt_0 ? 2 : 0) | (this.appPortMark_0 & 3) << 3 | (this.VERSION_0 & 3) << 6
    this.head_0[0] = toByte(ssidInfo)
    this.head_0[1] = toByte(passwordInfo)
    this.head_0[2] = toByte(reservedInfo)
    this.head_0[3] = toByte(bssidCrc)
    this.head_0[4] = toByte(flag)
    const headCrc = this.crc_0(this.head_0, 5)
    this.head_0[5] = toByte(headCrc)
  }
  EspProvisioningParams.prototype.setTotalSequenceSize_0 = function (size) {
    const data = EspPacketUtils$Companion_getInstance().getSequenceSizePacket_za3lpa$(size)
    this.dataPackets_0.set_wxm5ur$(1, data)
    this.dataPackets_0.set_wxm5ur$(3, data)
  }
  EspProvisioningParams.prototype.addDataFor6Bytes_0 = function (buf, sequence, crc, tailIsCrc) {
    if (this.DEBUG_0) {
      println(`buf=${contentToString(buf)}, seq=${sequence}, seqCrc=${crc}, tailIsCrc=${tailIsCrc}`)
    } if (sequence === this.SEQUENCE_FIRST_0) {
      const sycnPacket = EspPacketUtils$Companion_getInstance().getSyncPacket()
      const sequenceSizePacket = new Int8Array(0)
      this.dataPackets_0.add_11rb$(sycnPacket)
      this.dataPackets_0.add_11rb$(sequenceSizePacket)
      this.dataPackets_0.add_11rb$(sycnPacket)
      this.dataPackets_0.add_11rb$(sequenceSizePacket)
    }
    else {
      const sequencePacket = EspPacketUtils$Companion_getInstance().getSequencePacket_za3lpa$(sequence)
      this.dataPackets_0.add_11rb$(sequencePacket)
      this.dataPackets_0.add_11rb$(sequencePacket)
      this.dataPackets_0.add_11rb$(sequencePacket)
    }
    const bitCount = tailIsCrc ? 7 : 8
    for (let i = 0; i < bitCount; i++) {
      const data = buf[5] >> i & 1 | (buf[4] >> i & 1) << 1 | (buf[3] >> i & 1) << 2 | (buf[2] >> i & 1) << 3 | (buf[1] >> i & 1) << 4 | (buf[0] >> i & 1) << 5
      const dataPacket = EspPacketUtils$Companion_getInstance().getDataPacket_vux9f0$(data, i)
      this.dataPackets_0.add_11rb$(dataPacket)
    }
    if (tailIsCrc) {
      const dataPacket_0 = EspPacketUtils$Companion_getInstance().getDataPacket_vux9f0$(crc, 7)
      this.dataPackets_0.add_11rb$(dataPacket_0)
    }
  }
  EspProvisioningParams.prototype.generate_0 = function () {
    const random = Random((new Date()).getMilliseconds())
    const crcCalc = new TouchCRC8()
    let padding
    let password
    let passwordPadding
    let passwordPaddingFactor
    let passwordEncode
    let reservedData
    let reservedPadding
    let reservedPaddingFactor
    let reservedEncode
    let ssid
    let ssidPadding
    let ssidPaddingFactor
    let ssidEncode
    if (this.willEncrypt_0) {
      const willEncryptData = new Int8Array(this.password_0.length + this.reservedData_0.length | 0)
      arraycopy(this.password_0, 0, willEncryptData, 0, this.password_0.length)
      arraycopy(this.reservedData_0, 0, willEncryptData, this.password_0.length, this.reservedData_0.length)
      const encryptedData = AES$Companion_getInstance().encryptAes128Cbc_g608rk$(willEncryptData, this.aesKey_0, null, Padding$PKCS7Padding_getInstance())
      password = encryptedData
      passwordEncode = true
      passwordPaddingFactor = 5
      passwordPadding = this.emptyData_0
      padding = passwordPaddingFactor - encryptedData.length % passwordPaddingFactor | 0
      if (padding < passwordPaddingFactor) {
        passwordPadding = this.randomBytes_0(random, padding)
      }reservedData = this.emptyData_0
      reservedPadding = this.emptyData_0
      reservedPaddingFactor = -1
      reservedEncode = false
    }
    else if (!this.passwordEncode_0 && !this.reservedEncode_0) {
      const nonEncodeData = new Int8Array(this.password_0.length + this.reservedData_0.length | 0)
      arraycopy(this.password_0, 0, nonEncodeData, 0, this.password_0.length)
      arraycopy(this.reservedData_0, 0, nonEncodeData, this.password_0.length, this.reservedData_0.length)
      password = nonEncodeData
      passwordEncode = false
      passwordPaddingFactor = 6
      passwordPadding = this.emptyData_0
      padding = passwordPaddingFactor - nonEncodeData.length % passwordPaddingFactor | 0
      if (padding < passwordPaddingFactor) {
        passwordPadding = this.randomBytes_0(random, padding)
      }reservedData = this.emptyData_0
      reservedPadding = this.emptyData_0
      reservedPaddingFactor = -1
      reservedEncode = false
    }
    else {
      password = this.password_0
      passwordEncode = this.passwordEncode_0
      passwordPadding = this.emptyData_0
      passwordPaddingFactor = passwordEncode ? 5 : 6
      padding = passwordPaddingFactor - password.length % passwordPaddingFactor | 0
      if (padding < passwordPaddingFactor) {
        passwordPadding = this.randomBytes_0(random, padding)
      }reservedData = this.reservedData_0
      reservedEncode = this.reservedEncode_0
      reservedPadding = this.emptyData_0
      reservedPaddingFactor = reservedEncode ? 5 : 6
      padding = reservedPaddingFactor - reservedData.length % reservedPaddingFactor | 0
      if (padding < reservedPaddingFactor) {
        reservedPadding = this.randomBytes_0(random, padding)
      }
    }
    ssid = this.ssid_0
    ssidEncode = this.ssidEncode_0
    ssidPaddingFactor = ssidEncode ? 5 : 6
    ssidPadding = this.emptyData_0
    padding = ssidPaddingFactor - ssid.length % ssidPaddingFactor | 0
    if (padding < ssidPaddingFactor) {
      ssidPadding = this.randomBytes_0(random, padding)
    } const os = new EspOutputStream()
    os.write_mj6st8$(this.head_0)
    os.write_mj6st8$(password)
    os.write_mj6st8$(passwordPadding)
    os.write_mj6st8$(reservedData)
    os.write_mj6st8$(reservedPadding)
    os.write_mj6st8$(ssid)
    os.write_mj6st8$(ssidPadding)
    const reservedBeginPosition = this.head_0.length + password.length + passwordPadding.length | 0
    const ssidBeginPosition = reservedBeginPosition + reservedData.length + reservedPadding.length | 0
    let offset = 0
    const reader = new EspInputStream(os.toByteArray())
    let sequence = this.SEQUENCE_FIRST_0
    let count = 0
    while (reader.available() > 0) {
      var expectLength
      var tailIsCrc
      if (sequence < (this.SEQUENCE_FIRST_0 + 1 | 0)) {
        tailIsCrc = false
        expectLength = 6
      }
      else {
        if (offset < reservedBeginPosition) {
          tailIsCrc = !passwordEncode
          expectLength = passwordPaddingFactor
        }
        else if (offset < ssidBeginPosition) {
          tailIsCrc = !reservedEncode
          expectLength = reservedPaddingFactor
        }
        else {
          tailIsCrc = !ssidEncode
          expectLength = ssidPaddingFactor
        }
      }
      const buf = new Int8Array(6)
      const read = reader.read_mj6st8$(buf, 0, expectLength)
      if (read === -1) {
        break
      }offset = offset + read | 0
      crcCalc.reset()
      crcCalc.update_mj6st8$(buf, 0, read)
      const seqCrc = crcCalc.getValue()
      if (expectLength < buf.length) {
        buf[buf.length - 1 | 0] = toByte(seqCrc)
      } this.addDataFor6Bytes_0(buf, sequence, seqCrc, tailIsCrc)
      sequence = sequence + 1 | 0
      count = count + 1 | 0
    }
    this.setTotalSequenceSize_0(count)
  }
  EspProvisioningParams.$metadata$ = { kind: Kind_CLASS, simpleName: 'EspProvisioningParams', interfaces: [] }
  function ext8($receiver, offset) {
    return $receiver >>> offset & 255
  }
  function arraycopy(src, srcPos, dst, dstPos, count) {
    arrayCopy(src, dst, dstPos, srcPos, srcPos + count | 0)
    return dst
  }
  function Padding(name, ordinal) {
    Enum.call(this)
    this.name$ = name
    this.ordinal$ = ordinal
  }
  function Padding_initFields() {
    Padding_initFields = function () {
    }
    Padding$NoPadding_instance = new Padding('NoPadding', 0)
    Padding$PKCS7Padding_instance = new Padding('PKCS7Padding', 1)
  }
  var Padding$NoPadding_instance
  function Padding$NoPadding_getInstance() {
    Padding_initFields()
    return Padding$NoPadding_instance
  }
  var Padding$PKCS7Padding_instance
  function Padding$PKCS7Padding_getInstance() {
    Padding_initFields()
    return Padding$PKCS7Padding_instance
  }
  Padding.$metadata$ = { kind: Kind_CLASS, simpleName: 'Padding', interfaces: [Enum] }
  function Padding$values() {
    return [Padding$NoPadding_getInstance(), Padding$PKCS7Padding_getInstance()]
  }
  Padding.values = Padding$values
  function Padding$valueOf(name) {
    switch (name) {
      case 'NoPadding':
        return Padding$NoPadding_getInstance()
      case 'PKCS7Padding':
        return Padding$PKCS7Padding_getInstance()
      default:throwISE(`No enum constant Padding.${name}`)
    }
  }
  Padding.valueOf_61zpoe$ = Padding$valueOf
  function TouchCRC8() {
    TouchCRC8$Companion_getInstance()
    this._value_0 = 0
  }
  function TouchCRC8$Companion() {
    TouchCRC8$Companion_instance = this
    this.crcTable_0 = new Int32Array(256)
    this.CRC_POLYNOM_0 = 140
    this.CRC_INITIAL_0 = 0
    for (let dividend = 0; dividend <= 255; dividend++) {
      let remainder = dividend
      for (let bit = 0; bit <= 7; bit++) {
        if ((remainder & 1) !== 0) {
          remainder = remainder >>> 1 ^ 140
        }
        else {
          remainder = remainder >>> 1
        }
      }
      this.crcTable_0[dividend] = remainder & 65535
    }
  }
  TouchCRC8$Companion.$metadata$ = { kind: Kind_OBJECT, simpleName: 'Companion', interfaces: [] }
  var TouchCRC8$Companion_instance = null
  function TouchCRC8$Companion_getInstance() {
    if (TouchCRC8$Companion_instance === null) {
      new TouchCRC8$Companion()
    } return TouchCRC8$Companion_instance
  }
  TouchCRC8.prototype.update_za3lpa$ = function (b) {
    const data = b ^ this._value_0
    this._value_0 = TouchCRC8$Companion_getInstance().crcTable_0[data & 255] ^ this._value_0 << 8
    this._value_0 = this._value_0 & 65535
  }
  TouchCRC8.prototype.update_mj6st8$ = function (buf, offset, length) {
    if (offset === void 0) { offset = 0 }
    if (length === void 0) { length = buf.length }
    for (let i = offset; i < length; i++) {
      const b = buf[i]
      this.update_za3lpa$(b)
    }
  }
  TouchCRC8.prototype.getValue = function () {
    return this._value_0 & 255
  }
  TouchCRC8.prototype.reset = function () {
    this._value_0 = 0
  }
  TouchCRC8.$metadata$ = { kind: Kind_CLASS, simpleName: 'TouchCRC8', interfaces: [] }
  Object.defineProperty(AES, 'Companion', { get: AES$Companion_getInstance })
  _.AES_init_fqrh44$ = AES_init
  _.AES = AES
  _.getProvisionPackets_ygkgtq$ = getProvisionPackets
  _.getSyncPacket = getSyncPacket
  _.stringToByteArray_61zpoe$ = stringToByteArray
  _.EspInputStream = EspInputStream
  _.EspOutputStream = EspOutputStream
  Object.defineProperty(EspPacketUtils, 'Companion', { get: EspPacketUtils$Companion_getInstance })
  _.EspPacketUtils = EspPacketUtils
  _.EspProvisioningParams = EspProvisioningParams
  _.ext8_dqglrj$ = ext8
  _.arraycopy_nlwz52$ = arraycopy
  Object.defineProperty(Padding, 'NoPadding', { get: Padding$NoPadding_getInstance })
  Object.defineProperty(Padding, 'PKCS7Padding', { get: Padding$PKCS7Padding_getInstance })
  _.Padding = Padding
  Object.defineProperty(TouchCRC8, 'Companion', { get: TouchCRC8$Companion_getInstance })
  _.TouchCRC8 = TouchCRC8
  return _
}

const esptouch = {
  getSyncPacket: esptouchv2Lib.getSyncPacket,
  getProvisionPackets: esptouchv2Lib.getProvisionPackets_ygkgtq$,
}

export default esptouch
