import { request } from '@umijs/max';

/** 获取项目所有界面 POST /api/v1/page/all */
export async function getAllPages(data: { project_id?: number }) {
  return request('/api/v1/page/all', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    data,
  });
}
