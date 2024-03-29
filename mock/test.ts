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
  "POST /api/v1/test/category/all": (req: Request, res: Response) => {
    res.status(200).send(
      [
        {
          "id": 1,
          "study_id": 1,
          "parent_id": null,
          "root_id": 1,
          "name": "实验室检查",
          "model_list": [
            {
              "id": 10,
              "table_name": "blood",
              "name": "血常规",
              "study_id": 1,
              "category_id": 1
            },
          ],
          "children": [
            {
              "id": 2,
              "study_id": 1,
              "parent_id": 1,
              "root_id": 1,
              "name": "实验室检查的子分类",
              "level": 2,
              "index": 1,
              "model_list": [
                {
                  "id": 11,
                  "table_name": "test",
                  "name": "测试",
                  "study_id": 1,
                  "category_id": 2
                }
              ]
            },
          ],
        },
        {
          "id":100,
          "study_id": 1,
          "parent_id": null,
          "root_id": 1,
          "name": "实验室检查2",
          "model_list": [
            {
              "id": 101,
              "table_name": "blood2",
              "name": "血常规2",
              "study_id": 1,
              "category_id": 100
            },
          ],
        }
      ]
    )
  },
  // "/api/v1/test/model/22"
}