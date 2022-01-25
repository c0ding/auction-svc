import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity({ name: 'user_project_reward_info' })
export class UserProjectRewardInfo extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'ori_address', type: 'varchar', length: 100 })
  originAddress!: string;

  @Column({ name: 'para_id', type: 'integer' })
  paraId!: number;

  @Column({ name: 'crowdloan_id', type: 'varchar', length: 100 })
  crowdloanId!: string;

  @Column({ name: 'lease_start', type: 'integer' })
  leaseStart!: number;

  @Column({ name: 'lease_end', type: 'integer' })
  leaseEnd!: number;

  @Column({ name: 'dot_amount', type: 'varchar', length: 100 })
  dotAmount!: string;

  @Column({ name: 'project_base_bonus', type: 'varchar', length: 100 })
  projectBaseBonus!: string;

  @Column({ name: 'project_referral_bonus', type: 'varchar', length: 100 })
  projectReferralBonus!: string;

  @Column({ name: 'project_early_bird_bonus', type: 'varchar', length: 100 })
  projectEarlyBirdBonus!: string;

  @Column({ name: 'project_other_bonus', type: 'varchar', length: 100 })
  projectOtherBonus!: string;

  @Column({ name: 'project_total_rewards', type: 'varchar', length: 100 })
  projectTotalRewards!: string;

  @Column({ name: 'project_reward_ratio', type: 'float' })
  projectRewardRatio!: number;

  @Column({ name: 'para_base_bonus', type: 'varchar', length: 100 })
  paraBaseBonus!: string;

  @Column({ name: 'para_referral_bonus', type: 'varchar', length: 100 })
  paraReferralBonus!: string;

  @Column({ name: 'para_reinvest_bonus', type: 'varchar', length: 100 })
  paraReinvestBonus!: string;

  @Column({ name: 'para_other_bonus', type: 'varchar', length: 100 })
  paraOtherBonus!: string;

  @Column({ name: 'para_total_rewards', type: 'varchar', length: 100 })
  paraTotalRewards!: string;

  @Column({ name: 'project_decimal', type: 'integer' })
  projectDecimal!: number;

  @Column({ type: 'timestamptz', name: 'create_at', nullable: true })
  createAt!: Date;
}
