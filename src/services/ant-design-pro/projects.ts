import { request } from '@umijs/max';

/** 添加一个项目 POST /api/v1/project */
export async function addProject(data: { name?: string; description?: string }) {
  return request('/api/v1/project', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

/** 修改一个项目 PUT /api/v1/project/{id} */
export async function changeProject(id: number, data: { name?: string; description?: string }) {
  return request(`/api/v1/project/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}
