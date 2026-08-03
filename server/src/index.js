import { env } from './config/env.js';

// app.js pulls in the Firebase Admin config at import time, which throws a
// descriptive error if credentials aren't set up yet — dynamic import lets
// us catch that and print something readable instead of a raw stack trace.
async function main() {
  try {
    const { default: app } = await import('./app.js');
    app.listen(env.port, () => {
      console.log(`\n✅ ShineX API running at http://localhost:${env.port}`);
      console.log(`   Health check:  http://localhost:${env.port}/api/health\n`);
    });
  } catch (err) {
    console.error('\n❌ Failed to start the ShineX API:\n');
    console.error(`   ${err.message}\n`);
    console.error('   See server/README.md for setup instructions.\n');
    process.exit(1);
  }
}

main();
