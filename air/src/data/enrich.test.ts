import { afterEach, describe, expect, it, vi } from 'vitest';
import { lookupRoute } from './enrich';

// Real responses recorded by the lab for EXS95LV (Jet2) over Nuremberg on 2026-10-04.
const responses: Record<string, unknown> = {
  'https://api.adsbdb.com/v0/callsign/EXS95LV': {
    response: {
      flightroute: {
        airline: { name: 'Jet2.com' },
        origin: { iata_code: 'FNC', icao_code: 'LPMA', latitude: 32.6979, longitude: -16.7745, municipality: 'Funchal', name: 'Madeira' },
        destination: { iata_code: 'BRS', icao_code: 'EGGD', latitude: 51.3827, longitude: -2.71909, municipality: 'Bristol', name: 'Bristol Airport' },
      },
    },
  },
  'https://hexdb.io/api/v1/route/icao/EXS95LV': { flight: 'EXS95LV', route: 'LGMT-EGBB' },
  'https://hexdb.io/api/v1/airport/icao/LGMT': { icao: 'LGMT', iata: 'MJT', airport: 'Mytilene International Airport', latitude: 39.0567, longitude: 26.5983, region_name: 'Greece' },
  'https://hexdb.io/api/v1/airport/icao/EGBB': { icao: 'EGBB', iata: 'BHX', airport: 'Birmingham International Airport', latitude: 52.4539, longitude: -1.748, region_name: 'England' },
};

afterEach(() => vi.unstubAllGlobals());

describe('route lookup', () => {
  it('picks the source whose route passes the aircraft, not the stale one', async () => {
    vi.stubGlobal('fetch', async (url: string) => {
      const body = responses[url];
      return { ok: body != null, json: async () => body };
    });
    const r = await lookupRoute('EXS95LV', 49.27, 11.0); // south of Nuremberg, heading west
    expect(r).not.toBeNull();
    expect(r!.origin.iata).toBe('MJT');
    expect(r!.destination.iata).toBe('BHX');
    expect(r!.airline).toBe('Jet2.com');
  });
});
