import type Database from 'better-sqlite3'
import type { CustomerProfile, FeedbackItem, User } from '../../../shared/types'

export type DatabaseConnection = Database.Database
export type UserRow = User & { password: string }
export type CustomerRow = Omit<CustomerProfile, 'history'>
export type FeedbackRow = Omit<FeedbackItem, 'customer_name' | 'customer_email' | 'assignee_name'>
export type CountRow = { count: number }
export type ExportRow = FeedbackItem & { plan: string; internal_notes: string | null }
