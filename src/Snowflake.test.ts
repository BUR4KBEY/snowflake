import 'jest-extended';

import { generateSnowflake } from './Snowflake';

const EXAMPLE_EPOCH = new Date('2020-01-01T00:00:00.000Z').getTime();

interface SnowflakeCaseOptions {
  desc: string;

  machineIdBitAmount: number;
  machineId: number;
  machineIdBits?: string;

  sequenceNumberBitAmount: number;
}

const testSnowflakeCase = ({
  desc,
  machineId,
  machineIdBitAmount,
  machineIdBits,
  sequenceNumberBitAmount
}: SnowflakeCaseOptions) =>
  it(desc, () => {
    const timestampDate = new Date();
    const timestamp = timestampDate.getTime();
    const timestampBits = (timestamp - EXAMPLE_EPOCH).toString(2);

    if (!machineIdBits) {
      machineIdBits = machineId.toString(2);
    }

    const Snowflake = generateSnowflake({
      epoch: EXAMPLE_EPOCH,
      machineIdBitAmount,
      sequenceNumberBitAmount
    });
    Snowflake.setMachineId(machineId);

    const snowflake = Snowflake.generate(timestamp);

    const deconstruct = Snowflake.deconstruct(snowflake);

    expect(deconstruct).toBeObject();
    expect(deconstruct.allBits).toBeString();
    expect(deconstruct.incrementBits).toBeString();
    expect(deconstruct.machineIdBits).toBeString();
    expect(deconstruct.timestampBits).toBeString();
    expect(deconstruct.timestamp).toBeNumber();
    expect(deconstruct.machineId).toBeNumber();
    expect(deconstruct.increment).toBeNumber();
    expect(deconstruct.date).toBeValidDate();
    expect(
      deconstruct.timestampBits +
        deconstruct.machineIdBits +
        deconstruct.incrementBits
    ).toBe(deconstruct.allBits);
    expect(deconstruct.allBits).toStrictEqual(
      timestampBits + machineIdBits + '0'.repeat(sequenceNumberBitAmount)
    );
    expect(deconstruct.incrementBits).toStrictEqual(
      '0'.repeat(sequenceNumberBitAmount)
    );
    expect(deconstruct.incrementBits.length).toStrictEqual(
      sequenceNumberBitAmount
    );
    expect(deconstruct.machineIdBits).toStrictEqual(machineIdBits);
    expect(deconstruct.machineIdBits!.length).toStrictEqual(machineIdBitAmount);
    expect(deconstruct.timestampBits).toBe(timestampBits);
    expect(deconstruct.date).toStrictEqual(timestampDate);
    expect(deconstruct.increment).toStrictEqual(0);
    expect(deconstruct.machineId).toStrictEqual(machineId);
    expect(deconstruct.timestamp).toStrictEqual(timestamp - EXAMPLE_EPOCH);
  });

describe('Snowflake', () => {
  it('should generate a new Snowflake class with statically defined methods', () => {
    const Snowflake = generateSnowflake({
      epoch: EXAMPLE_EPOCH,
      machineIdBitAmount: 2,
      sequenceNumberBitAmount: 2
    });
    Snowflake.setMachineId(0);

    expect(Snowflake).toBeDefined();
    expect(Snowflake.setMachineId).toBeFunction();
    expect(Snowflake.generate).toBeFunction();
    expect(Snowflake.deconstruct).toBeFunction();
    expect(Snowflake.epoch).toBeNumber();
    expect(Snowflake.machineIdBitAmount).toBeNumber();
    expect(Snowflake.sequenceNumberBitAmount).toBeNumber();
    expect(Snowflake.machineId).toBeNumber();
  });

  it('should throw an error when machineIdBitAmount or sequenceNumberBitAmount is negative', () => {
    expect(() =>
      generateSnowflake({
        epoch: EXAMPLE_EPOCH,
        machineIdBitAmount: -1,
        sequenceNumberBitAmount: 2
      })
    ).toThrow();

    expect(() =>
      generateSnowflake({
        epoch: EXAMPLE_EPOCH,
        machineIdBitAmount: 2,
        sequenceNumberBitAmount: -1
      })
    ).toThrow();

    expect(() =>
      generateSnowflake({
        epoch: EXAMPLE_EPOCH,
        machineIdBitAmount: -1,
        sequenceNumberBitAmount: -1
      })
    ).toThrow();
  });

  it('should throw an error when machineId is negative', () => {
    const Snowflake = generateSnowflake({
      epoch: EXAMPLE_EPOCH,
      machineIdBitAmount: 10,
      sequenceNumberBitAmount: 12
    });

    expect(() => Snowflake.setMachineId(-5)).toThrow();
  });

  it('should throw an error when generating a new Snowflake without a machine id', () => {
    const Snowflake = generateSnowflake({
      epoch: EXAMPLE_EPOCH,
      machineIdBitAmount: 2,
      sequenceNumberBitAmount: 2
    });

    expect(Snowflake.generate).toThrow();
  });

  it('should not throw an error when generating a new Snowflake with a machine id', () => {
    const Snowflake = generateSnowflake({
      epoch: EXAMPLE_EPOCH,
      machineIdBitAmount: 2,
      sequenceNumberBitAmount: 2
    });
    Snowflake.setMachineId(0);

    expect(Snowflake.generate).not.toThrow();
  });

  it('should throw an error when setting the machine id more than once', () => {
    const Snowflake = generateSnowflake({
      epoch: EXAMPLE_EPOCH,
      machineIdBitAmount: 2,
      sequenceNumberBitAmount: 2
    });
    Snowflake.setMachineId(0);

    expect(() => Snowflake.setMachineId(1)).toThrow();
  });

  it('should throw an error when the epoch is in the future', () => {
    const Snowflake = generateSnowflake({
      epoch: Date.now() + 1000000,
      machineIdBitAmount: 10,
      sequenceNumberBitAmount: 12
    });
    Snowflake.setMachineId(0);

    expect(Snowflake.generate).toThrow();
  });

  it('should correctly verify the sequence number incrementation', () => {
    const sequenceNumberBitAmount = 12;
    const maxSequenceNumber = 2 ** sequenceNumberBitAmount - 1;
    const Snowflake = generateSnowflake({
      epoch: EXAMPLE_EPOCH,
      machineIdBitAmount: 10,
      sequenceNumberBitAmount
    });
    Snowflake.setMachineId(0);

    for (let i = 0; i <= maxSequenceNumber; i += 1) {
      const snowflake = Snowflake.generate();

      if (i === maxSequenceNumber) {
        const { increment } = Snowflake.deconstruct(snowflake);
        expect(increment).toStrictEqual(maxSequenceNumber);
      }
    }

    const snowflake = Snowflake.generate();
    const { increment } = Snowflake.deconstruct(snowflake);

    expect(increment).toStrictEqual(0);
  });

  it('should handle the case where machine id bit amount is 0', () => {
    const Snowflake = generateSnowflake({
      epoch: EXAMPLE_EPOCH,
      machineIdBitAmount: 0,
      sequenceNumberBitAmount: 2
    });

    expect(() => Snowflake.setMachineId(0)).toThrow();
    expect(Snowflake.machineId).toStrictEqual(null);

    const snowflake = Snowflake.generate();
    const deconstruct = Snowflake.deconstruct(snowflake);

    expect(deconstruct.machineId).toStrictEqual(null);
    expect(deconstruct.machineIdBits).toStrictEqual(null);
    expect(deconstruct.allBits).toStrictEqual(
      deconstruct.timestampBits + deconstruct.incrementBits
    );
  });

  it('should throw an error when trying to access the "Snowflake.machineId" property before setting one', () => {
    const Snowflake = generateSnowflake({
      epoch: EXAMPLE_EPOCH,
      machineIdBitAmount: 2,
      sequenceNumberBitAmount: 2
    });

    expect(() => Snowflake.machineId).toThrow();
  });

  it('should throw an error when the sequence number bit amount is 0', () => {
    expect(() =>
      generateSnowflake({
        epoch: EXAMPLE_EPOCH,
        machineIdBitAmount: 2,
        sequenceNumberBitAmount: 0
      })
    ).toThrow();
  });

  it('should throw an error when the machine id exceeds the maximum allowed value', () => {
    const machineIdBitAmount = 2;
    const Snowflake = generateSnowflake({
      epoch: EXAMPLE_EPOCH,
      machineIdBitAmount,
      sequenceNumberBitAmount: 2
    });

    expect(() => Snowflake.setMachineId(2 ** machineIdBitAmount)).toThrow();
  });

  it('should return the timestamp', () => {
    const Snowflake = generateSnowflake({
      epoch: EXAMPLE_EPOCH,
      machineIdBitAmount: 10,
      sequenceNumberBitAmount: 12
    });

    const now = new Date();

    const t1 = Snowflake.getTimestamp(now);
    const t2 = Snowflake.getTimestamp(now.getTime());

    expect(t1).toBeNumber();
    expect(t2).toBeNumber();
    expect(t1).toStrictEqual(t2);
    expect(t1).toStrictEqual(now.getTime());
  });

  testSnowflakeCase({
    desc: 'should handle a machine id with the length of bits are equal to the machine id bit amount',
    machineId: 642,
    machineIdBitAmount: 10,
    sequenceNumberBitAmount: 12
  });

  testSnowflakeCase({
    desc: 'should handle a machine id with the length of bits are less than the machine id bit amount',
    machineId: 10,
    machineIdBits: '0000001010', // Binary representation of 10 with 10 bits
    machineIdBitAmount: 10,
    sequenceNumberBitAmount: 12
  });

  testSnowflakeCase({
    desc: 'should handle a machine id with bits less than the sequence number bits',
    machineId: 23,
    machineIdBits: '10111', // Binary representation of 23 with 5 bits
    machineIdBitAmount: 5,
    sequenceNumberBitAmount: 16
  });

  testSnowflakeCase({
    desc: 'should handle a machine id with bits greater than the sequence number bits',
    machineId: 143,
    machineIdBits: '0000000010001111', // Binary representation of 143 with 16 bits
    machineIdBitAmount: 16,
    sequenceNumberBitAmount: 5
  });

  testSnowflakeCase({
    desc: 'should handle a machine id with bits equal to the sequence number bits',
    machineId: 21043,
    machineIdBits: '0101001000110011', // Binary representation of 21043 with 16 bits
    machineIdBitAmount: 16,
    sequenceNumberBitAmount: 16
  });
});
