import { Entity, Column, PrimaryColumn, BaseEntity } from 'typeorm';

import { CrowdloanStatus } from '../graphql/crowdloan';

@Entity({ name: 'crowdloans' })
export class Crowdloan extends BaseEntity {
  @PrimaryColumn()
  id!: string;

  @Column({ name: 'para_id' })
  paraId!: number;

  @Column({ name: 'parallel_status', type: 'varchar', length: 100 })
  parallelStatus!: CrowdloanStatus;

  @Column({ name: 'start_contribute_block', type: 'int' })
  startContributeBlock!: number;

  @Column({ name: 'end_contribute_block', type: 'int' })
  endContributeBlock!: number;
}
