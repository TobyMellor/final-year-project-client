// import { expect } from 'chai';
// import 'mocha';

// describe('Conversions', () => {

//   it('should convert degrees to radians', () => {
//     const converted1 = Drawable.degreesToRadiansFn(0);
//     const converted2 = Drawable.degreesToRadiansFn(180);
//     const converted3 = Drawable.degreesToRadiansFn(-360);

//     expect(converted1).to.equal(0);
//     expect(converted2).to.equal(Math.PI);
//     expect(converted3).to.equal(0);
//   });

//   it('should convert radians to degrees', () => {
//     const converted1 = Drawable.radiansToDegreesFn(0);
//     const converted2 = Drawable.radiansToDegreesFn(3 * Math.PI);
//     const converted3 = Drawable.radiansToDegreesFn(-Math.PI);

//     expect(converted1).to.equal(0);
//     expect(converted2).to.equal(180);
//     expect(converted3).to.equal(-180);
//   });

//   // Amount to rotate circle so the top of the circle is
//   const OFFSET_AMOUNT_DEGREES = 90;
//   const OFFSET_AMOUNT_RADIANS = Math.PI / 2;

//   it('should convert percentage to degrees', () => {
//     const converted1 = Drawable.percentageToDegreesFn(0);
//     const converted2 = Drawable.percentageToDegreesFn(100);
//     const converted3 = Drawable.percentageToDegreesFn(50);

//     expect(converted1).to.equal(0 + OFFSET_AMOUNT_DEGREES);
//     expect(converted2).to.equal(0 + OFFSET_AMOUNT_DEGREES);
//     expect(converted3).to.equal(180 + OFFSET_AMOUNT_DEGREES);
//   });

//   it('should convert percentage to radians', () => {
//     const converted1 = Drawable.percentageToRadiansFn(0);
//     const converted2 = Drawable.percentageToRadiansFn(100);
//     const converted3 = Drawable.percentageToRadiansFn(50);

//     expect(converted1).to.equal(0 + OFFSET_AMOUNT_RADIANS);
//     expect(converted2).to.equal(0 + OFFSET_AMOUNT_RADIANS);
//     expect(converted3).to.equal(Math.PI + OFFSET_AMOUNT_RADIANS);
//   });
// });
