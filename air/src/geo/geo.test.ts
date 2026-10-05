import { describe, expect, it } from 'vitest';
import { bearingDeg, compassPoint, cpa, destination, distanceM, elevationDeg, project } from './geo';
import { skyGeometry } from './overhead';

const FRA = { lat: 50.1109, lon: 8.6821 };

describe('geo', () => {
  it('distance Frankfurt to Munich is about 304 km', () => {
    const d = distanceM(FRA, { lat: 48.1351, lon: 11.582 });
    expect(d / 1000).toBeGreaterThan(300);
    expect(d / 1000).toBeLessThan(308);
  });

  it('destination and bearing round-trip', () => {
    const p = destination(FRA, 123, 25_000);
    expect(distanceM(FRA, p)).toBeCloseTo(25_000, -1);
    expect(bearingDeg(FRA, p)).toBeCloseTo(123, 0);
  });

  it('elevation is 90 degrees directly overhead and about 45 at equal distance and height', () => {
    expect(elevationDeg(0, 10_000)).toBeCloseTo(90, 0);
    expect(elevationDeg(10_000, 10_000)).toBeCloseTo(45, 0);
  });

  it('cpa of an aircraft flying straight at the observer is ~0 m ahead in time', () => {
    const start = destination(FRA, 270, 20_000); // 20 km west, flying east
    const r = cpa(FRA, start, 200, 90);
    expect(r.tSec).toBeCloseTo(100, 0);
    expect(r.distM).toBeLessThan(50);
    expect(r.rangeRate).toBeLessThan(0);
  });

  it('cpa with lateral offset reports the miss distance and side', () => {
    const start = destination(destination(FRA, 270, 20_000), 0, 3_000); // 3 km north of track
    const r = cpa(FRA, start, 200, 90);
    expect(r.distM).toBeCloseTo(3_000, -2);
    expect(compassPoint(r.bearing)).toBe('N');
  });

  it('receding aircraft has negative cpa time', () => {
    const start = destination(FRA, 90, 10_000);
    const r = cpa(FRA, start, 200, 90);
    expect(r.tSec).toBeLessThan(0);
    expect(r.rangeRate).toBeGreaterThan(0);
  });

  it('project follows a turn', () => {
    const p = project(FRA, 100, 0, 90, 1); // quarter turn in 90 s
    expect(bearingDeg(FRA, p)).toBeGreaterThan(30);
    expect(bearingDeg(FRA, p)).toBeLessThan(60);
  });
});

describe('sky geometry', () => {
  it('airliner at 11 km and 3 km distance is zenith', () => {
    const p = destination(FRA, 10, 3_000);
    const g = skyGeometry(FRA, 100, { ...p, altM: 11_000, onGround: false, speedMps: 230, track: 90, vRateMps: 0 });
    expect(g.state).toBe('zenith');
  });

  it('aircraft 40 km away heading toward observer is approaching', () => {
    const p = destination(FRA, 270, 40_000);
    const g = skyGeometry(FRA, 100, { ...p, altM: 10_000, onGround: false, speedMps: 230, track: 90, vRateMps: 0 });
    expect(g.state).toBe('approaching');
    expect(g.cpa!.tSec).toBeGreaterThan(150);
    expect(g.cpaElevation!).toBeGreaterThan(80);
  });

  it('low helicopter 8 km away on a crossing course is not overhead', () => {
    const p = destination(FRA, 180, 8_000);
    const g = skyGeometry(FRA, 100, { ...p, altM: 400, onGround: false, speedMps: 50, track: 90, vRateMps: 0 });
    expect(g.elevation).toBeLessThan(5);
    expect(g.state).toBe('none');
  });

  it('ground traffic is ignored', () => {
    const g = skyGeometry(FRA, 100, { ...FRA, altM: 100, onGround: true, speedMps: 5, track: 0, vRateMps: 0 });
    expect(g.state).toBe('none');
  });
});
