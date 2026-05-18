import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('jwt_sessions')
export class JwtSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ unique: true }) token: string;
  @Column() wallet: string;
  @Column() policyId: string;
  @Column() issuedAt: number;
  @Column() expiresAt: number;
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn() createdAt: Date;
}
