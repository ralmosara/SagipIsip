const { Client } = require('pg');

async function testConn(user, password) {
  const client = new Client({
    user,
    password,
    host: 'localhost',
    port: 5433,
    database: 'postgres' // connect to default db first
  });
  try {
    await client.connect();
    console.log(`SUCCESS with user: ${user}, password: ${password}`);
    await client.end();
    return true;
  } catch (err) {
    console.log(`FAILED with user: ${user}, password: ${password} - ${err.message}`);
    return false;
  }
}

async function run() {
  const users = ['postgres', 'admin', 'root', 'sagipisip'];
  const passwords = ['postgres', 'admin', 'root', 'password', 'password123', ''];

  for (const u of users) {
    for (const p of passwords) {
      if (await testConn(u, p)) {
        process.exit(0);
      }
    }
  }
}

run();
