INSERT INTO "public"."reward_distribution_whitelist" (ori_address) VALUES ('126mNaDNqWjGYAomdTjjNGV3EEwmqzgSWNMddjN9jhAHqh38');
INSERT INTO "public"."reward_distribution_whitelist" (ori_address) VALUES ('1ESih1sv3kgE3prBdpSiURHpgLeWpJrskP3wHt1R7SakUyF');
INSERT INTO "public"."reward_distribution_whitelist" (ori_address) VALUES ('16hh6pv6FeRc6a4XHobmW2CLAe6YruN6jAL1rLAYDv3bHgVU');


INSERT INTO "public"."reward_distribution_address_mapping" (ori_address, dst_address, tx_hash) VALUES (
 '126mNaDNqWjGYAomdTjjNGV3EEwmqzgSWNMddjN9jhAHqh38',
 '126mNaDNqWjGYAomdTjjNGV3EEwmqzgSWNMddjN9jhAHqh38',
 '0xe235f87928660b5dccffd6f717d2d1ca3b41106de538ae189c887c6ddfab3e1e'
 );

INSERT INTO "public"."reward_distribution_address_mapping" (ori_address, dst_address, tx_hash) VALUES (
  '16hh6pv6FeRc6a4XHobmW2CLAe6YruN6jAL1rLAYDv3bHgVU',
  '16hh6pv6FeRc6a4XHobmW2CLAe6YruN6jAL1rLAYDv3bHgVU',
  '0x3fa0f482ab64de86c2f6a16b70c6ca6dbfcb04ec3ff9bd2bd9670469119fb0ff'
);

INSERT INTO "public"."reward_distribution_address_mapping" (ori_address, dst_address, tx_hash) VALUES (
  '1ESih1sv3kgE3prBdpSiURHpgLeWpJrskP3wHt1R7SakUyF',
  '1ESih1sv3kgE3prBdpSiURHpgLeWpJrskP3wHt1R7SakUyF',
  '0x3fa0f482ab64de86c2f6a16b70c6ca6dbfcb04ec3ff9bd2bd9670469119fb0ff'
);

INSERT INTO "public"."user_project_reward_info" (
  ori_address, para_id, crowdloan_id, lease_start, lease_end, dot_amount,
  project_base_bonus, project_referral_bonus, project_early_bird_bonus, project_other_bonus, project_total_rewards, project_reward_ratio,
  para_base_bonus, para_referral_bonus, para_reinvest_bonus, para_other_bonus, para_total_rewards,
  project_decimal
) VALUES (
  '1ESih1sv3kgE3prBdpSiURHpgLeWpJrskP3wHt1R7SakUyF', 2012, '2012-6-13', 6, 13, 800000000000,
  100, 300, 400, 80, 20, 0.8,
  12, 30, 34, 45, 60,
  2000
);
