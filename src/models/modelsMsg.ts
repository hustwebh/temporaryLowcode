import { getAllModels } from '@/services/ant-design-pro/layout';
import { getModelData } from '@/services/ant-design-pro/tableData';
// import { useRequest } from 'ahooks'
import { useEffect, useState } from 'react';

export default function models() {
  const [allModelsMsg, setAllModelsMsg] = useState<any>([]);

  useEffect(() => {
    const getAllModelsMsg = async () => {
      const res = await getAllModels();
      setAllModelsMsg(res);
    };
    getAllModelsMsg();
  }, []);

  return { allModelsMsg };
}
