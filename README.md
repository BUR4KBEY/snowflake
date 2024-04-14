[![NPM Version](https://img.shields.io/npm/v/%40burakbey%2Fsnowflake?style=for-the-badge&logo=npm&color=blue&cacheSeconds=3600)](https://npmjs.com/package/@burakbey/snowflake)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/bur4kbey/snowflake/test.yml?style=for-the-badge&label=tests&cacheSeconds=3600)](https://github.com/BUR4KBEY/snowflake/actions/workflows/test.yml)
[![Codecov](https://img.shields.io/codecov/c/github/bur4kbey/snowflake?style=for-the-badge&cacheSeconds=3600)](https://app.codecov.io/gh/BUR4KBEY/snowflake)
[![GitHub License](https://img.shields.io/github/license/bur4kbey/snowflake?style=for-the-badge)](https://github.com/BUR4KBEY/snowflake/blob/main/LICENSE)
[![GitHub Repo stars](https://img.shields.io/github/stars/bur4kbey/snowflake?style=for-the-badge&label=%E2%AD%90%20STARS&color=yellow&cacheSeconds=3600)](https://github.com/BUR4KBEY/snowflake)

# ❄️ [@burakbey/snowflake](https://npmjs.com/package/@burakbey/snowflake)

This library provides an easy-to-use implementation of [Snowflake](https://en.wikipedia.org/wiki/Snowflake_ID) for generating unique, distributed IDs.

## ⚙️ How does it work?

This library allows you to generate Snowflakes with customizable parameters, ensuring flexibility and reliability in distributed systems:

1. **Set the Epoch**: Determine the starting point in time for your Snowflakes.
2. **Configure Machine ID Bit Amount**: Define the number of bits allocated for machine IDs to support multiple machines.
3. **Choose Sequence Number Bit Amount**: Specify the number of bits used for per-machine sequence numbers to ensure uniqueness.

This library does not produce fixed length Snowflakes (such as only 64 bytes) or allow the generation of Snowflakes with timestamps before the specified epoch. Instead, it enables you to generate Snowflakes according to your specific needs within the constraints of these parameters.

Once these parameters are set, you can create a `Snowflake` class using the `generateSnowflake` function. After generation, you can generate Snowflakes with this class using the `Snowflake.generate()` method.

Remember to set a unique machine ID for each `Snowflake` class before generating any Snowflakes.

You can also deconstruct a Snowflake using the `Snowflake.deconstruct()` method to inspect its components based on your Snowflake configuration.

## 🚀 Installation

Install the package using your preferred package manager. Here's an example using `pnpm`:

```bash
pnpm add @burakbey/snowflake
```

## 📝 Example Usage

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

## 🔑 Minimum Required Bits

To ensure uniqueness between two generated Snowflakes, it's crucial to reserve **at least one bit for the per-machine sequence number**. However, it's **recommended** to allocate **at least 12 bits** for the sequence number. The more bits allocated, the greater the uniqueness of the Snowflakes.

Using a small number of bits for the sequence number doesn't guarantee uniqueness. Consider the example below:

```ts
import { generateSnowflake } from '@burakbey/snowflake';

// Generate a Snowflake class
const Snowflake = generateSnowflake({
  epoch: new Date('2020-01-01T00:00:00.000Z').getTime(),
  machineIdBitAmount: 10,
  sequenceNumberBitAmount: 1 // Example using very few bits for the sequence number
});

// Set a machine id
Snowflake.setMachineId(100);

// Generate Snowflakes
const s1 = Snowflake.generate();
const s2 = Snowflake.generate();
const s3 = Snowflake.generate();

// Deconstruct the Snowflakes
const i1 = Snowflake.deconstruct(s1);
const i2 = Snowflake.deconstruct(s2);
const i3 = Snowflake.deconstruct(s3);

console.log(`Snowflake: ${s1} | Increment: ${i1.increment}`); // Snowflake: 276703343268040 | Increment: 0
console.log(`Snowflake: ${s2} | Increment: ${i2.increment}`); // Snowflake: 276703343268041 | Increment: 1
console.log(`Snowflake: ${s3} | Increment: ${i3.increment}`); // Snowflake: 276703343268040 | Increment: 0
```

In this example, only one bit is reserved for the per-machine sequence number. Generating multiple Snowflakes at the same time on the same machine results in identical Snowflakes being generated. Therefore, it's advisable to reserve a minimum of 12 bits for the sequence number.

On the other side, you don't have to reserve any bits for the machine id if you work with only one process or replica of your application. It's a common scenario in single-process applications or in cases where there's only one instance of your application running.

```ts
import { generateSnowflake } from '@burakbey/snowflake';

// Generate a Snowflake class
const Snowflake = generateSnowflake({
  epoch: new Date('2020-01-01T00:00:00.000Z').getTime(),
  machineIdBitAmount: 0, // No bits reserved for machine id
  sequenceNumberBitAmount: 12
});

// You *must not* use the "Snowflake.setMachineId()" method when no bits are reserved for the machine id.

// Generate a Snowflake
const snowflake = Snowflake.generate();

// Deconstruct a Snowflake
const info = Snowflake.deconstruct(snowflake);

console.log(snowflake); // 553408320073728
console.log(info); /* {
                        timestamp: 135109453143,
                        date: 2024-04-12T18:24:13.143Z,
                        machineId: null,
                        increment: 0,
                        timestampBits: '1111101110101001001101010010101010111',
                        machineIdBits: null,
                        incrementBits: '000000000000',
                        allBits: '1111101110101001001101010010101010111000000000000'
                      } */
```

In this example, no bits are reserved for the machine id since only one process or replica of the application is being used. Attempting to use the `Snowflake.setMachineId()` method in this scenario would result in an **error**. Instead, you should use the `Snowflake.generate()` method directly to start generating Snowflakes.

## 🧪 Code Coverage and Tests

Tests are crucial for ensuring that the library functions as expected. You can review the code coverage reports by visiting [**Codecov**](https://app.codecov.io/gh/BUR4KBEY/snowflake). The primary objective is to achieve complete coverage of the entire codebase through rigorous testing.
