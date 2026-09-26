import type { FeedbackItem, InboxResponse, InternalNote, NotesResponse, SummaryResponse } from '../../../shared/types'
import type { DatabaseConnection } from '../types/database'
import type { ApiHandler } from '../types/http'
import * as feedback from '../services/feedback'
import { HttpError } from '../services/errors'
import { assignmentInput, feedbackFilter, inboxQuery, noteInput, positiveId, summaryId } from '../validation/inputs'

export function feedbackControllers(db: DatabaseConnection, summarize: (prompt: string) => Promise<string>) {
  const list: ApiHandler<InboxResponse> = (req, res) => {
    res.json(feedback.listFeedback(db, inboxQuery(req.query)))
  }
  const get: ApiHandler<FeedbackItem> = (req, res) => {
    res.json(feedback.getFeedback(db, positiveId(req.params.id)))
  }
  const assign: ApiHandler<FeedbackItem> = (req, res) => {
    res.json(feedback.assignFeedback(db, positiveId(req.params.id), assignmentInput(req.body)))
  }
  const resolve: ApiHandler<FeedbackItem> = (req, res) => {
    res.json(feedback.toggleFeedback(db, positiveId(req.params.id)))
  }
  const notes: ApiHandler<NotesResponse> = (req, res) => {
    res.json({ notes: feedback.listNotes(db, positiveId(req.params.id)) })
  }
  const addNote: ApiHandler<InternalNote> = (req, res) => {
    const user = res.locals.user
    if (!user) throw new HttpError(401, 'Missing token')
    res.status(201).json(feedback.createNote(db, positiveId(req.params.id), user.id, noteInput(req.body)))
  }
  const summary: ApiHandler<SummaryResponse> = async (req, res, next) => {
    try {
      res.json({ summary: await feedback.summarizeFeedback(db, summaryId(req.body), summarize) })
    } catch (error) {
      next(error)
    }
  }
  const exportCsv: ApiHandler<string> = (req, res) => {
    const csv = feedback.exportFeedback(db, feedbackFilter(req.query))
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="pulse-feedback-export.csv"')
    res.send(csv)
  }
  return { list, get, assign, resolve, notes, addNote, summary, exportCsv }
}
