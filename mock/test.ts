import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

// let schema = require('./schema.json')

export default {
  "POST /api/v1/mock1": (req: Request, res: Response) => {
    res.status(200).send({
      success: true,
      data: [
        {
          name: "安洛替尼研究",
          id: uuidv4()
        },
        {
          name: "XXX研究",
          id: uuidv4()
        },
        {
          name: "YYY研究",
          id: uuidv4()
        }
      ]
    })
  },
}