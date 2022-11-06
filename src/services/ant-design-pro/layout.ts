import { request } from 'umi';

/** 获取所有项目模型 POST /api/v1/data-model/all */
export async function getAllModels(options = null) {
  return request('/api/v1/data-model/all ', {
    headers: {
      "Content-Type": "application/json"
    },   
    method: 'POST',
    body:options,
  });
}

/** 获取所有数据模型 GET /api/v1/project/all */
export async function getAllProjects() {
  return request('/api/v1/project/all ', {  
    method: 'GET',
  });
}