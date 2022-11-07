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

/** 修改页面结构 PUT /api/v1/page/{id} */
export async function ChangePages(project_id: number,body: any) {
  return request(`/api/v1/page/${project_id}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'PUT',
    data:body,
  });
}
