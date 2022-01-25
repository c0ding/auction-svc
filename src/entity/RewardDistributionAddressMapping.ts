import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity({ name: 'reward_distribution_address_mapping' })
export class RewardDistributionAddressMapping extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'ori_address', type: 'varchar', length: 100 })
  originAddress!: string;

  @Column({ name: 'dst_address', type: 'varchar', length: 100 })
  destinationAddress!: string;

  @Column({ name: 'tx_hash', type: 'varchar', length: 500 })
  transactionHash!: string;

  @Column({ type: 'timestamptz', name: 'create_at', nullable: true })
  createAt!: Date;
}
