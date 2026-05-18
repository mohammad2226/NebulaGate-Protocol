import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('access_tokens')
export class AccessToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column() wallet: string;
  @Column() policyId: string;
  @Column() issuedAt: number;
  @Column() expiresAt: number;
  @Column({ default: true }) isActive: boolean;
  @Column({ nullable: true }) revokedAt: Date;
  @CreateDateColumn() createdAt: Date;
}
