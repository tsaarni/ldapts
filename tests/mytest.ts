// npx ts-node --esm tests/mytest.ts

/* eslint-disable no-console */
import type { BerReader, BerWriter } from 'asn1';

import { Client } from '../src';
import { Control } from '../src/controls';

class MyControl extends Control {
  public constructor() {
    super('1.3.6.1.4.1.42.2.27.8.5.1');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public override parseControl(reader: BerReader): void {
    console.log('reading', reader);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public override writeControl(writer: BerWriter): void {
    console.log('writing', writer);
  }
}

async function main(): Promise<void> {
  const client = new Client({
    url: 'ldaps://localhost:8636',
    tlsOptions: {
      rejectUnauthorized: false,
    },
  });

  const control = new MyControl();
  await client.bind('uid=mustchange,dc=example,dc=com', 'mustchange', control);
  await client.unbind();
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
void (async () => {
  await main();
})();
