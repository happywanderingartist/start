export function testConfig(user:'postgres'|'start_public_reader',connectionString=process.env.START_TEST_DATABASE_URL??'postgresql://postgres@127.0.0.1:55432/start_test_foundation') {
  const url=new URL(connectionString),database=decodeURIComponent(url.pathname.slice(1));
  if(!['postgres:','postgresql:'].includes(url.protocol)||!['127.0.0.1','localhost'].includes(url.hostname)||!/^start_test_[a-z0-9_]+$/u.test(database))throw Error('Tests require a local start_test_ database');
  return {host:url.hostname,port:Number(url.port||5432),database,user};
}
