import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity({ name: 'reward_distribution_whitelist' })
export class RewardDistributionWhitelist extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'ori_address' })
  originAddress!: string;

  @Column({ type: 'timestamptz', name: 'create_at', nullable: true })
  createAt!: Date;
}
