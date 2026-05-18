import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum LogicType { AND = 'AND', OR = 'OR' }
export enum ConditionType { TOKEN_BALANCE = 'TOKEN_BALANCE', NFT_OWNERSHIP = 'NFT_OWNERSHIP', TX_COUNT = 'TX_COUNT' }

export interface PolicyCondition {
  type: ConditionType;
  asset?: string;
  collectionId?: string;
  operator?: string;
  value?: number;
}

@Entity('policies')
export class Policy {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column() creator: string;
  @Column() name: string;
  @Column({ nullable: true }) description: string;
  @Column({ type: 'enum', enum: LogicType, default: LogicType.AND }) logicType: LogicType;
  @Column('jsonb') conditions: PolicyCondition[];
  @Column({ default: 3600 }) expirationSeconds: number;
  @Column({ default: true }) isActive: boolean;
  @Column({ nullable: true }) metadataUri: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}