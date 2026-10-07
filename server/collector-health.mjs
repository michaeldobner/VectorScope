// Docker healthcheck of the collector: healthy while the last good round is younger than MAX_AGE_MIN.
// An unhealthy container turns the status page yellow or red and the Telegram bot reports it.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const maxAgeMs = Number(process.env.MAX_AGE_MIN ?? 30) * 60_000;
try {
  const beat = JSON.parse(readFileSync(join(process.env.DATA_DIR ?? '/data', 'heartbeat.json'), 'utf8'));
  const age = Date.now() - beat.at;
  console.log(`last round ${Math.round(age / 60_000)} min ago, ${beat.ok}/${beat.total} sources ok`);
  process.exit(age < maxAgeMs ? 0 : 1);
} catch (e) {
  console.log(`no heartbeat: ${e.message}`);
  process.exit(1);
}
