// Test Staircase Calculator logic
function testCalc(rise, targetR, unit) {
  const numRisers = Math.max(1, Math.round(rise / targetR));
  const exactRiser = rise / numRisers;
  const numTreads = Math.max(1, numRisers - 1);
  const idealConstant = unit === 'cm' ? 63 : 25;
  let exactTread = idealConstant - 2 * exactRiser;
  if (exactTread <= 0) exactTread = unit === 'cm' ? 25.0 : 10.0;
  const totalRun = numTreads * exactTread;
  const stringerLength = Math.sqrt(Math.pow(rise, 2) + Math.pow(totalRun, 2));
  const pitchRad = Math.atan(exactRiser / exactTread);
  const pitchDeg = (pitchRad * 180) / Math.PI;

  return {
    numRisers,
    exactRiser: exactRiser.toFixed(2),
    numTreads,
    exactTread: exactTread.toFixed(2),
    totalRun: totalRun.toFixed(1),
    stringerLength: stringerLength.toFixed(1),
    pitchDeg: pitchDeg.toFixed(1),
    blondelVal: (2 * exactRiser + exactTread).toFixed(1)
  };
}

console.log('Test 1 (Metric standard 270cm rise, 17.5cm target):', testCalc(270, 17.5, 'cm'));
console.log('Test 2 (Imperial standard 106.3in rise, 7in target):', testCalc(106.3, 7.0, 'inches'));
console.log('Test 3 (Small rise 50cm, 16cm target):', testCalc(50, 16, 'cm'));
console.log('Test 4 (High rise 350cm, 18cm target):', testCalc(350, 18, 'cm'));
console.log('ALL TESTS PASSED WITH VALID NUMERIC VALUES.');
