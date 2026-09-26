import type { RequestHandler } from 'express'
import type { ParamsDictionary, Query } from 'express-serve-static-core'
import type { ApiError, User } from '../../../shared/types'

// Bodies remain unknown until a controller validates them. Authentication is
// optional here because public routes use the same response locals.
export type ApiLocals = { user?: User }
export type ApiHandler<T> = RequestHandler<ParamsDictionary, T | ApiError, unknown, Query, ApiLocals>
