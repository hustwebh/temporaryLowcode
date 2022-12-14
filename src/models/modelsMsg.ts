import { getAllModels } from '@/services/ant-design-pro/layout';
import { useEffect, useState } from 'react';

export default function models() {
  const [allModelsMsg, setAllModelsMsg] = useState<any>([]);
  const [refreshSymbol, setRefreshSymbol] = useState<boolean>(false);
  const [modalVisit, setModalVisit] = useState(false);

  //在开局试图获取
  useEffect(() => {
    const getAllModelsMsg = async () => {
      const res = await getAllModels();
      setAllModelsMsg(res);
    };
    getAllModelsMsg();
  }, []);

  return { allModelsMsg, refreshSymbol, setRefreshSymbol,modalVisit, setModalVisit };
}
