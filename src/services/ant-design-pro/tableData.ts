import { request } from 'umi';

/** 根据id获取某个数据模型 GET /v1/data-model/{id} */
export async function getModelData(id: number) {
  return request(`/api/v1/model/${id}`, {
    method: 'GET',
    headers: {
      "Content-Type": "application/json"
    },
  });
}

/** 添加一个新的数据模型 POST /v1/data-model */
export async function addModelData(body: any) {
  return request(`/api/v1/data-model`, {
    headers: {
      "Content-Type": "application/json"
    },
    method: 'POST',
    data: {
      fields: body.fields,
      table_name: body.table_name
    }
  });
}

/** 根据id删除某个数据模型 DELETE /v1/data-model/{id} */
export async function delModelData(id: number) {
  return request(`/api/v1/data-model/${id}`, {
    method: 'DELETE',
    headers: {
      "Content-Type": "application/json"
    },
  });
}

/** 修改某个数据模型 PUT /v1/data-model/{id} */
export async function changeModelData(body: any) {
  return request(`/api/v1/data-model/${body.id}`, {
    method: 'PUT',
    headers: {
      "Content-Type": "application/json"
    },
    data: {
      fields: body.fields,
      table_name: body.table_name
    }
  });
}




/** 根据id获取某个指标模型 GET /api/v1/model/{id} */
export async function getIndicatorData(id: number|null) {
  return request(`/api/v1/model/${id}`, {
    method: 'GET',
    headers: {
      "Content-Type": "application/json"
    },
  });
}

