CREATE TABLE IF NOT EXISTS dot_contributions_v2 (
  id VARCHAR(100) NOT NULL PRIMARY KEY,
  block_height INT NOT NULL,
  para_id INT NOT NULL,
  account VARCHAR(100) NOT NULL,
  amount BIGINT NOT NULL,
  referral_code VARCHAR(500),
  timestamp TIMESTAMP NOT NULL,
  transaction_executed BOOLEAN NOT NULL,
  is_valid BOOLEAN NOT NULL,
  executed_block_height INT
);
