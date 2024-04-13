export interface SnowflakeOptions {
  epoch: number;
  machineIdBitAmount: number;
  sequenceNumberBitAmount: number;
}

export interface SnowflakeDeconstructResult {
  timestamp: number;
  date: Date;
  machineId: number | null;
  increment: number;
  timestampBits: string;
  machineIdBits: string | null;
  incrementBits: string;
  allBits: string;
}

export function generateSnowflake({
  epoch,
  machineIdBitAmount,
  sequenceNumberBitAmount
}: SnowflakeOptions) {
  if (machineIdBitAmount < 0)
    throw new Error('"machineIdBitAmount" cannot be negative.');

  if (sequenceNumberBitAmount < 0)
    throw new Error('"sequenceNumberBitAmount" cannot be negative.');

  if (sequenceNumberBitAmount === 0)
    throw new Error(
      'You must provide at least one bit for the sequence number to ensure unique Snowflake generation.'
    );

  const MAX_POSSIBLE_INCREMENT = BigInt(2 ** sequenceNumberBitAmount - 1);
  const MAX_MACHINE_ID = BigInt(2 ** machineIdBitAmount - 1);

  const MACHINE_ID_SHIFT_AMOUNT: bigint =
    machineIdBitAmount === sequenceNumberBitAmount
      ? BigInt(machineIdBitAmount)
      : BigInt(sequenceNumberBitAmount);

  let INCREMENT = 0n;
  let MACHINE_ID: bigint | null = null;

  return class Snowflake {
    static get epoch() {
      return epoch;
    }

    static get machineIdBitAmount() {
      return machineIdBitAmount;
    }

    static get sequenceNumberBitAmount() {
      return sequenceNumberBitAmount;
    }

    static get machineId(): number | null {
      if (machineIdBitAmount === 0) return null;

      if (MACHINE_ID === null)
        throw new Error(
          'Machine id has not been set. Please use the "Snowflake.setMachineId()" method to specify a machine id before generating snowflakes.'
        );

      return Number(MACHINE_ID);
    }

    static setMachineId(id: number) {
      if (machineIdBitAmount === 0)
        throw new Error(
          `You cannot set a machine id with 0 bits. Please avoid using "Snowflake.setMachineId()" method and instead use the "Snowflake.generate()" method directly to generate snowflakes.`
        );

      if (MACHINE_ID !== null)
        throw new Error(
          'Machine id has already been set. It cannot be set more than once.'
        );

      if (id < 0) throw new Error('Machine id cannot be negative.');

      if (BigInt(id) > MAX_MACHINE_ID)
        throw new Error(
          `Machine id '${id}' exceeds the maximum allowed value of '${MAX_MACHINE_ID}'.`
        );

      MACHINE_ID = BigInt(id);
    }

    static getTimestamp(dateOrTimestamp: Date | number): number {
      if (dateOrTimestamp instanceof Date) return dateOrTimestamp.getTime();

      return dateOrTimestamp;
    }

    static generate(dateOrTimestamp: Date | number = Date.now()): string {
      if (MACHINE_ID === null && machineIdBitAmount !== 0)
        throw new Error(
          'Machine id has not been set. Please use the "Snowflake.setMachineId()" method to specify a machine id before generating snowflakes.'
        );

      const timestamp = Snowflake.getTimestamp(dateOrTimestamp);

      if (timestamp - epoch < 0)
        throw new Error(
          'Timestamp is before the epoch. Please provide a timestamp that is after the epoch.'
        );

      if (INCREMENT > MAX_POSSIBLE_INCREMENT) {
        INCREMENT = 0n;
      }

      const result =
        (BigInt(timestamp - epoch) <<
          BigInt(machineIdBitAmount + sequenceNumberBitAmount)) |
        ((MACHINE_ID ?? 0n) << MACHINE_ID_SHIFT_AMOUNT) |
        INCREMENT;

      INCREMENT += 1n;

      return result.toString();
    }

    static deconstruct(snowflakeStr: string): SnowflakeDeconstructResult {
      const snowflake = BigInt(snowflakeStr);
      const snowflakeBits = snowflake.toString(2);

      const timestamp =
        snowflake >> BigInt(machineIdBitAmount + sequenceNumberBitAmount);
      const timestampBits = timestamp.toString(2);

      const restBits = snowflakeBits.slice(timestampBits.length);
      const machineIdBits = restBits.slice(0, machineIdBitAmount) || null;
      const incrementBits = restBits.slice(machineIdBitAmount);

      return {
        timestamp: Number(timestamp),
        date: new Date(epoch + Number(timestamp)),
        machineId: machineIdBits === null ? null : parseInt(machineIdBits, 2),
        increment: parseInt(incrementBits, 2),
        timestampBits,
        machineIdBits,
        incrementBits,
        allBits: snowflakeBits
      };
    }
  };
}
