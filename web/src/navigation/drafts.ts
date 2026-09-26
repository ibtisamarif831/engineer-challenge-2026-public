import { useSyncExternalStore } from 'react'
import type { FeedbackItem } from '../types'

export type TicketDraft = {
  assignment?: { assigneeId: string; priority: FeedbackItem['priority']; dueAt: string }
  note?: { body: string; private: boolean }
}

type Drafts = Record<string, TicketDraft>
const emptyDraft: TicketDraft = {}
const listeners = new Set<() => void>()
let session = 0
export const draftSession = () => session
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}
export function useTicketDraft(id: number) {
  return useSyncExternalStore(subscribe, () => readDraft(id))
}

let owner: number | null = null
let drafts: Drafts = {}
let storageAvailable = true
const storageKey = (userId: number) => `pulse:drafts:${userId}`

function validDraft(value: unknown): value is TicketDraft {
  if (!value || typeof value !== 'object') return false
  if ('assignment' in value && value.assignment !== undefined) {
    const a = value.assignment
    if (!a || typeof a !== 'object' || !('assigneeId' in a) || typeof a.assigneeId !== 'string' ||
      !('dueAt' in a) || typeof a.dueAt !== 'string' || !('priority' in a) ||
      !['low', 'normal', 'high', 'urgent'].includes(String(a.priority))) return false
  }
  if ('note' in value && value.note !== undefined) {
    const n = value.note
    if (!n || typeof n !== 'object' || !('body' in n) || typeof n.body !== 'string' ||
      !('private' in n) || typeof n.private !== 'boolean') return false
  }
  return true
}

export function initializeDrafts(userId: number) {
  if (owner === userId) return
  session += 1
  owner = userId
  drafts = {}
  storageAvailable = true
  try {
    const data: unknown = JSON.parse(sessionStorage.getItem(storageKey(userId)) || '{}')
    if (data && typeof data === 'object') {
      for (const [id, value] of Object.entries(data)) {
        if (/^[1-9]\d*$/.test(id) && validDraft(value)) drafts[id] = value
      }
    }
  } catch { storageAvailable = false }
}

export function readDraft(id: number): TicketDraft { return drafts[id] || emptyDraft }
export function hasDrafts(): boolean { return Object.keys(drafts).length > 0 }
export function draftsPersisted(): boolean { return storageAvailable }
export function draftsNeedUnloadWarning(): boolean { return hasDrafts() && !storageAvailable }

export function writeDraft(id: number, draft: TicketDraft) {
  if (draft.assignment || draft.note?.body) drafts[id] = draft
  else delete drafts[id]
  try {
    if (owner !== null) sessionStorage.setItem(storageKey(owner), JSON.stringify(drafts))
    storageAvailable = true
  } catch { storageAvailable = false }
  listeners.forEach((listener) => listener())
}

export function clearDrafts() {
  try {
    if (owner !== null) sessionStorage.removeItem(storageKey(owner))
  } catch { throw new Error('Unable to discard stored drafts') }
  session += 1
  drafts = {}
  owner = null
}
