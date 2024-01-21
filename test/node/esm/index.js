import { vdsm } from 'vdsm'
if ('Bun' in globalThis) {
    throw new Error('❌ Use Node.js to run this test!')
}

vdsm.create();
