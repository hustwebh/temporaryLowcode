import { Request, Response } from 'express';

import schema from './schema1.json'

// let schema = require('./schema.json')

export default {
  "GET /test/getSchema": (req: Request, res: Response) => {
    res.status(200).send({
      success: true,
      data: schema
    })
  },
}