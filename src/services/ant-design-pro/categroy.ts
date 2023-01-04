import { request } from '@umijs/max';

/** 获取所有分类和指标模型结构 POST /api/v1/category/all */
export async function getAllCategories(data: { study_id?: number } | null) {
  return request('/api/v1/category/all', {
    headers: {
      "Content-Type": "application/json"
    },
    method: 'POST',
    data,
  });
}

/** 新添加分类 POST /api/v1/category */
export async function addCategory(data: {
  name: string;
  parent_id?: number;
  study_id:number
} | null) {
  return request('/api/v1/category', {
    headers: {
      "Content-Type": "application/json"
    },
    method: 'POST',
    data,
  });
}

/** 删除分类 DELETE /api/v1/category/{id} */
export async function deleteCategory({ target_id }: { target_id: number }) {
  return request(`/api/v1/category/${target_id}`, {
    headers: {
      "Content-Type": "application/json"
    },
    method: 'DELETE',
  });
}

/** 修改分类 PUT /api/v1/category/{id} */
export async function modifyCategory(target_id: number, data: {
  name: string;
  parent_id: number;
}) {
  return request(`/api/v1/category/${target_id}`, {
    headers: {
      "Content-Type": "application/json"
    },
    method: 'PUT',
    data
  });
}

/** 新添加指标模型 POST /api/v1/model */
export async function addIndicator(data: {
  table_name?:string;//表名（英文名）
  name?: string;//模型名称（中文名）
  study_id: number;
  category_id:number;
} | null) {
  return request('/api/v1/model', {
    headers: {
      "Content-Type": "application/json"
    },
    method: 'POST',
    data,
  });
}

/** 删除指标模型 DELETE /api/v1/model/{id} */
export async function deleteIndicator({ target_id }: { target_id: number }) {
  return request(`/api/v1/model/${target_id}`, {
    headers: {
      "Content-Type": "application/json"
    },
    method: 'DELETE',
  });
}
/** 修改指标模型 PUT /api/v1/model/{id} */
export async function modifyIndicator(target_id: number, data: {
  table_name?:string;//表名（英文名）
  name?: string;//模型名称（中文名）
  study_id?: number;
  category_id?:number;
}) {
  return request(`/api/v1/category/${target_id}`, {
    headers: {
      "Content-Type": "application/json"
    },
    method: 'PUT',
    data
  });
}
