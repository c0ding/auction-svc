CREATE TABLE IF NOT EXISTS dot_contributions (
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

CREATE TABLE IF NOT EXISTS crowdloans (
    id VARCHAR(200) NOT NULL PRIMARY KEY,
    para_id INT NOT NULL,
    parallel_status VARCHAR(100) NOT NULL,
    start_contribute_block INT NOT NULL,
    end_contribute_block INT
);

CREATE TABLE IF NOT EXISTS refund_action(
  id SERIAL PRIMARY KEY,
  account VARCHAR(100) NOT NULL,
  action VARCHAR(20) NOT NULL,
  amount BIGINT NOT NULL,
  para_id INT,
  signature VARCHAR(500) NOT NULL,
  signed_message VARCHAR(500) NOT NULL,
  status VARCHAR(20) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  referral_code varchar(500),
  transfer_transaction_hash varchar(500)
);
