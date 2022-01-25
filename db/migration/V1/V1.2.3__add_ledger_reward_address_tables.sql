CREATE TABLE IF NOT EXISTS ledger_reward_address (
    id VARCHAR(100) NOT NULL PRIMARY KEY,
    ori_address varchar(100) NOT NULL,
    dst_address varchar(100) NOT NULL,
    block_height INT NOT NULL,
    create_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
