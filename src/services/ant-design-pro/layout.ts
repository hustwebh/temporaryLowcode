import { request } from '@umijs/max';

/** 获取所有项目模型 POST /api/v1/data-model/all */
export async function getAllModels(options = null) {
  return request('/api/v1/model/all ', {
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


/** 病症研究指标库获取所有研究项目 GET /api/v1/study/all */
export async function getAllDiseaseResearchList() {
  return request('/api/v1/study/all', {  
    method: 'GET',
  });
}

/** 获取所有指标模型 POST /api/v1/model/all */
export async function getAllIndicators(options = null) {
  return request('/api/v1/model/all ', {
    headers: {
      "Content-Type": "application/json"
    },   
    method: 'POST',
    body:options,
  });
}

/** 新添加研究项目 POST /api/v1/study */
export async function addNewResearch(data:any) {
  return request('/api/v1/study', {  
    method: 'POST',
    data,
  });
}

/** 删除研究项目 DELETE /api/v1/study/{id} */
export async function DeleteResearch({study_id}:{study_id:number}) {
  return request(`/api/v1/study/${study_id}`, {  
    method: 'DELETE',
  });
}