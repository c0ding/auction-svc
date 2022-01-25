import { Entity, Column, PrimaryColumn, BaseEntity } from 'typeorm';

@Entity({ name: 'moonbeam_terms_signed' })
export class MoonbeamTermsSigned extends BaseEntity {
  @PrimaryColumn()
  id!: string;

  @Column({ name: 'block_height', type: 'integer' })
  blockHeight!: number;

  @Column({ name: 'account', type: 'varchar', length: 100 })
  account!: string;

  @Column({ name: 'timestamp', type: 'timestamptz', nullable: true })
  timestamp!: Date;
}
