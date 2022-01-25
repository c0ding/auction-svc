import { Entity, Column, PrimaryColumn, BaseEntity } from 'typeorm';

@Entity({ name: 'dot_contributions_v2' })
export class DotContribution extends BaseEntity {
  @PrimaryColumn()
  id!: string;

  @Column({ name: 'para_id' })
  paraId!: number;

  @Column({ type: 'varchar', length: 100 })
  account!: string;

  @Column({ type: 'bigint' }) // The bigint return string instead of the number, see: https://github.com/typeorm/typeorm/issues/2400
  amount!: string;

  @Column({ type: 'timestamp' })
  timestamp!: Date;

  @Column({ name: 'block_height', type: 'int' })
  blockHeight!: number;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'referral_code' })
  referralCode: string | undefined;

  @Column({ name: 'is_valid' })
  isValid!: boolean;

  @Column({ name: 'transaction_executed' })
  transactionExecuted!: boolean;

  @Column({ type: 'int', nullable: true, name: 'executed_block_height' })
  executedBlockHeight: number | undefined;
}
