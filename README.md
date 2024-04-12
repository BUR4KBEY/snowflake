# ❄️ [@burakbey/snowflake](https://npmjs.com/package/@burakbey/snowflake)

This library provides an easy-to-use implementation of [Snowflake](https://en.wikipedia.org/wiki/Snowflake_ID) for generating unique, distributed IDs.

## How does it work?

This library allows you to generate Snowflakes with customizable parameters, ensuring flexibility and reliability in distributed systems:

1. **Set the Epoch**: Determine the starting point in time for your Snowflakes.
2. **Configure Machine ID Bit Amount**: Define the number of bits allocated for machine IDs to support multiple machines.
3. **Choose Sequence Number Bit Amount**: Specify the number of bits used for per-machine sequence numbers to ensure uniqueness.

This library does not produce fixed length Snowflakes (such as only 64 bytes) or allow the generation of Snowflakes with timestamps before the specified epoch. Instead, it enables you to generate Snowflakes according to your specific needs within the constraints of these parameters.

Once these parameters are set, you can create a `Snowflake` class using the `generateSnowflake` function. After generation, you can generate Snowflakes with this class using the `Snowflake.generate()` method.

Remember to set a unique machine ID for each `Snowflake` class before generating any Snowflakes.

You can also deconstruct a Snowflake using the `Snowflake.deconstruct()` method to inspect its components based on your Snowflake configuration.

## Installation 🚀

Install the package using your preferred package manager. Here's an example using `pnpm`:

```bash
pnpm add @burakbey/snowflake
```

## Example Usage 📝

This example demonstrates usage in TypeScript, but the library is also **compatible** with JavaScript.

```ts
import { generateSnowflake } from '@burakbey/snowflake';

// Generate a Snowflake class
//
//        flexible                10              12
// ________________________ + ___________ + _______________
//        timestamp             machine       per-machine
//          bits                  id           sequence
//                               bits         number bits
//
const Snowflake = generateSnowflake({
  epoch: new Date('2020-01-01T00:00:00.000Z').getTime(),
  machineIdBitAmount: 10,
  sequenceNumberBitAmount: 12
});

// Set a machine id
Snowflake.setMachineId(0);

// Generate Snowflakes
const snowflake1 = Snowflake.generate(); // Uses `Date.now()` by default
const snowflake2 = Snowflake.generate(new Date('2022-02-02T22:22:22.222Z')); // Accepts Date objects
const snowflake3 = Snowflake.generate(
  new Date('2023-02-02T22:22:22.222Z').getTime()
); // Accepts timestamps

// Deconstruct a Snowflake
const info = Snowflake.deconstruct(snowflake3);

console.log(snowflake1); // 566390217229991936
console.log(snowflake2); // 276839760016703489
console.log(snowflake3); // 409111330960703490
console.log(info); /* {
                        timestamp: 97539742222,
                        date: 2023-02-02T22:22:22.222Z,
                        machineId: 0,
                        increment: 2,
                        timestampBits: "1011010110101110100100101101000001110",
                        machineIdBits: "0000000000",
                        incrementBits: "000000000010",
                        allBits: "10110101101011101001001011010000011100000000000000000000010",
                      } */
```
