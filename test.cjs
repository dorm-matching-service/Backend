const dns = require("node:dns");

dns.setDefaultResultOrder("ipv4first");

dns.lookup("db.ilycwvdaygtbakswdjhq.supabase.co", (err, addr, family) => {
  console.log("RESULT =>");
  console.log("  addr:", addr);
  console.log("  family:", family);
  console.log("  err:", err);
});
