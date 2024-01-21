if ('Bun' in globalThis) {
    throw new Error('❌ Use Node.js to run this test!')
}

const { vdsm } = require('vdsm');

vdsm.create();