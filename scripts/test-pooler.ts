import postgres from "postgres";
import dotenv from "dotenv";
dotenv.config();

const regions = [
  "aws-0-ap-south-1.pooler.supabase.com",
  "aws-0-ap-southeast-1.pooler.supabase.com",
  "aws-0-us-east-1.pooler.supabase.com",
  "aws-0-eu-central-1.pooler.supabase.com"
];

async function testPoolers() {
  const projectRef = "woavdlhvmjikobigadqc";
  const password = "N2BZp5JjipdvhLnE";
  const user = `postgres.${projectRef}`;
  
  for (const host of regions) {
    const url = `postgresql://${user}:${password}@${host}:6543/postgres`;
    console.log(`Testing pooler: ${host}...`);
    try {
      const sql = postgres(url, { connect_timeout: 5 });
      const res = await sql`SELECT count(*) FROM categories`;
      console.log(`SUCCESS! Connected to ${host}! Count:`, res[0].count);
      await sql.end();
      return url;
    } catch (err: any) {
      console.log(`Failed ${host}:`, err.message);
    }
  }
}

testPoolers().then(url => {
  if (url) console.log("WORKING_URL=", url);
});
