import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import postgres from "postgres";

async function runSecurityCouponsMigration() {
  console.log("Starting Security Coupons & Rate Limiter Database Migration...");
  const sql = postgres(process.env.DATABASE_URL!, { connect_timeout: 10 });

  try {
    // 1. Add hardened columns to coupons table
    console.log("1. Adding security columns to coupons table...");
    await sql`
      ALTER TABLE coupons 
      ADD COLUMN IF NOT EXISTS code_hash text,
      ADD COLUMN IF NOT EXISTS code_masked text,
      ADD COLUMN IF NOT EXISTS code_suffix text,
      ADD COLUMN IF NOT EXISTS description text,
      ADD COLUMN IF NOT EXISTS is_private boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS is_single_use boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS assigned_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS assigned_email text,
      ADD COLUMN IF NOT EXISTS can_stack_with_campaigns boolean NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS internal_reason text,
      ADD COLUMN IF NOT EXISTS revoked_at timestamp without time zone,
      ADD COLUMN IF NOT EXISTS revoked_by text;
    `;

    // 2. Add unique constraint / index on code_hash
    console.log("2. Creating unique index on coupons.code_hash...");
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_code_hash 
      ON coupons(code_hash) 
      WHERE code_hash IS NOT NULL;
    `;

    // 3. Create security_rate_limits table
    console.log("3. Creating security_rate_limits table...");
    await sql`
      CREATE TABLE IF NOT EXISTS security_rate_limits (
        id text PRIMARY KEY,
        identifier text NOT NULL,
        action text NOT NULL,
        hit_count integer NOT NULL DEFAULT 1,
        first_hit_at timestamp without time zone NOT NULL DEFAULT now(),
        last_hit_at timestamp without time zone NOT NULL DEFAULT now(),
        blocked_until timestamp without time zone,
        created_at timestamp without time zone NOT NULL DEFAULT now()
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_rate_limit_lookup 
      ON security_rate_limits (identifier, action);
    `;

    // 4. Update existing public coupons (WELCOME10, FESTIVE500) with masked info
    console.log("4. Updating existing public coupons with metadata...");
    await sql`
      UPDATE coupons 
      SET 
        code_masked = code,
        code_suffix = RIGHT(code, 4),
        description = CASE 
          WHEN code = 'WELCOME10' THEN 'Official Welcome 10% First Order Offer'
          WHEN code = 'FESTIVE500' THEN 'Festive ₹500 Seasonal Reward'
          ELSE COALESCE(description, code)
        END,
        is_private = false,
        can_stack_with_campaigns = true
      WHERE code_masked IS NULL;
    `;

    console.log("Migration completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runSecurityCouponsMigration();
