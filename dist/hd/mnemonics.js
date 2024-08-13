"use strict";
/**
 * Copyright (c) Whales Corp.
 * All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveMnemonicsPath = exports.deriveMnemonicHardenedKey = exports.getMnemonicsMasterKeyFromSeed = void 0;
const mnemonic_1 = require("../mnemonic/mnemonic");
const hmac_sha512_1 = require("../primitives/hmac_sha512");
const HARDENED_OFFSET = 0x80000000;
const MNEMONICS_SEED = 'TON Mnemonics HD seed';
async function getMnemonicsMasterKeyFromSeed(seed) {
    const I = await (0, hmac_sha512_1.hmac_sha512)(MNEMONICS_SEED, seed);
    const IL = I.slice(0, 32);
    const IR = I.slice(32);
    return {
        key: IL,
        chainCode: IR,
    };
}
exports.getMnemonicsMasterKeyFromSeed = getMnemonicsMasterKeyFromSeed;
;
async function deriveMnemonicHardenedKey(parent, index) {
    if (index >= HARDENED_OFFSET) {
        throw Error('Key index must be less than offset');
    }
    // Key Derive Path: 0x00 + parent.key + index;
    const indexBuffer = Buffer.alloc(4);
    indexBuffer.writeUInt32BE(index + HARDENED_OFFSET, 0);
    const data = Buffer.concat([Buffer.alloc(1, 0), parent.key, indexBuffer]);
    // Derive key
    const I = await (0, hmac_sha512_1.hmac_sha512)(parent.chainCode, data);
    const IL = I.slice(0, 32);
    const IR = I.slice(32);
    return {
        key: IL,
        chainCode: IR,
    };
}
exports.deriveMnemonicHardenedKey = deriveMnemonicHardenedKey;
async function deriveMnemonicsPath(seed, path, wordsCount = 24, password) {
    let state = await getMnemonicsMasterKeyFromSeed(seed);
    let remaining = [...path];
    while (remaining.length > 0) {
        let index = remaining[0];
        remaining = remaining.slice(1);
        state = await deriveMnemonicHardenedKey(state, index);
    }
    return await (0, mnemonic_1.mnemonicFromRandomSeed)(state.key, wordsCount, password);
}
exports.deriveMnemonicsPath = deriveMnemonicsPath;