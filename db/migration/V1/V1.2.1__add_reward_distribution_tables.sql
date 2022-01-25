CREATE TABLE IF NOT EXISTS reward_distribution_whitelist (
    id SERIAL PRIMARY KEY,
    ori_address varchar(100) NOT NULL,
    create_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reward_distribution_address_mapping (
    id SERIAL PRIMARY KEY,
    ori_address varchar(100) NOT NULL,
    dst_address varchar(100) NOT NULL,
    tx_hash varchar(500) NOT NULL,
    create_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reward_distribution_task (
    id SERIAL PRIMARY KEY,
    crowdloan_id varchar(100) NOT NULL,
    ori_address varchar(100) NOT NULL,
    dst_address varchar(100) NOT NULL,
    tx_hash varchar(500),
    amount varchar(100) NOT NULL,
    status varchar(100) NOT NULL,
    create_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS claimed_reward (
    id SERIAL PRIMARY KEY,
    claim_tx_hash varchar(500),
    crowdloan_id varchar(100) NOT NULL,
    amount varchar(100) NOT NULL,
    received_address varchar(100) NOT NULL,
    create_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
