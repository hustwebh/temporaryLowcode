import { request } from 'umi';

/** 获取所有分类 POST /api/v1/category/all */
export async function getAllCategories(data:{study_id?:number}|null) {
  return request('/api/v1/test/category/all', {
    headers: {
      "Content-Type": "application/json"
    },   
    method: 'POST',
    data,
  });
}