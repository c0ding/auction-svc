import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity({ name: 'refund_action' })
export class RefundAction extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column({ name: 'para_id', nullable: true })
  paraId?: number;

  @Column({ type: 'varchar', length: 100 })
  account!: string;

  @Column({ type: 'bigint' }) // The bigint return string instead of the number, see: https://github.com/typeorm/typeorm/issues/2400
  amount!: string;

  @Column({ type: 'varchar', length: 20 })
  action!: string;

  @Column({ type: 'varchar', length: 20 })
  status!: string;

  @Column({ type: 'varchar', length: 500 })
  signature!: string;

  @Column({ type: 'varchar', length: 500, name: 'signed_message' })
  signedMessage!: string;

  @Column({ type: 'timestamptz' })
  timestamp!: Date;

  @Column({ type: 'timestamptz', name: 'create_time', nullable: true })
  createTime?: Date;

  @Column({ type: 'timestamptz', name: 'update_time', nullable: true })
  updateTime?: Date;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'referral_code' })
  referralCode?: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'transfer_transaction_hash' })
  transferTransactionHash?: string;
}
