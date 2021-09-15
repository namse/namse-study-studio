class Decimal {
  // 100 -> [0, 0, 1]
  private readonly digits: number[];
  // i -> there are point on the left of this.numbers[i]
  private readonly pointLocation: number = 0;
  constructor(digits: number[], pointLocation: number);
  constructor(numberString: string);
  constructor(arg1: any, arg2?: any) {
    if (arg2 !== undefined) {
      this.digits = arg1;
      this.pointLocation = arg2;
      return;
    }

    const numberString = arg1 as string;
    this.digits = numberString
      .split("")
      .filter((string) => string !== ".")
      .map((string) => parseInt(string))
      .reverse();
    const pointIndex = numberString.indexOf(".");
    if (pointIndex === -1) {
      this.pointLocation = 0;
    } else {
      // 10.0
      // index = 2
      // numbers = 001
      // pointLocation = 1
      // so, pointLocation = numbers.length - index
      this.pointLocation = this.digits.length - pointIndex;
    }
  }

  add(decimal: Decimal): Decimal {
    // 1. make the point locations same
    const [a, b] = Decimal.makePointLocationSame(this, decimal);

    // 2. add each digit numbers
    const digits: number[] = [];
    Decimal.addDigits(digits, a);
    Decimal.addDigits(digits, b);

    // 3. regroup the digits
    Decimal.regroupDigits(digits);

    // 4. return the result
    return new Decimal(digits, a.pointLocation);
  }
  static makePointLocationSame(
    a: Decimal,
    b: Decimal
  ): [a: Decimal, b: Decimal] {
    if (a.pointLocation === b.pointLocation) {
      return [a, b];
    }
    const max = Math.max(a.pointLocation, b.pointLocation);
    return [
      Decimal.increasePointLocation(a, max),
      Decimal.increasePointLocation(b, max),
    ];
  }
  static increasePointLocation(
    decimal: Decimal,
    pointLocation: number
  ): Decimal {
    const pointLocationDiff = pointLocation - decimal.pointLocation;
    if (pointLocationDiff < 0) {
      throw new Error("Point location to increase can't be less than operand.");
    }
    if (pointLocationDiff === 0) {
      return decimal;
    }
    const newDigits: number[] = [];
    for (let i = 0; i < pointLocationDiff; i++) {
      newDigits.push(0);
    }
    const digits = [...newDigits, ...decimal.digits];
    return new Decimal(digits, pointLocation);
  }

  static addDigits(digits: number[], decimal: Decimal): void {
    decimal.digits.forEach((digit, index) => {
      if (digits[index] === undefined) {
        return (digits[index] = digit);
      }
      digits[index] += digit;
    });
  }
  static regroupDigits(digits: number[]): void {
    // NOTE : only consider about addition.
    // NOTE : only support 2-level number (10, 91 is ok. 100 is not ok).

    digits.forEach((digit, index) => {
      if (digit < 10) {
        return;
      }
      const ones = digit % 10;
      const tens = (digit - ones) / 10;

      digits[index] = ones;

      if (digits[index + 1] === undefined) {
        digits[index + 1] = tens;
      } else {
        digits[index + 1] += tens;
      }
    });
  }

  toString(): string {
    const digits: (number | string)[] = [...this.digits];
    const pointLocation = this.pointLocation;
    const pointIndex = digits.length - pointLocation;
    digits.splice(pointIndex, 0, ".");
    return digits.reverse().join("");
  }
}

const decimals: Decimal[] = [];

for (let i = 0; i < 100; i += 1) {
  decimals.push(new Decimal("0.1"));
}
decimals.push(new Decimal("0.00000000000000000000000000000000001"));
decimals.push(new Decimal("10000000000000000000000000000000000"));

const sumResult = decimals.reduce((prev, curr) => {
  return prev.add(curr);
});

console.log(sumResult.toString());
