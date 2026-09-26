import type { CustomerProfile } from '../../../shared/types'
import type { DatabaseConnection } from '../types/database'
import type { ApiHandler } from '../types/http'
import { getCustomer } from '../services/customers'
import { positiveId } from '../validation/inputs'

export function customerController(db: DatabaseConnection): ApiHandler<CustomerProfile> {
  return (req, res) => {
    res.json(getCustomer(db, positiveId(req.params.id)))
  }
}
