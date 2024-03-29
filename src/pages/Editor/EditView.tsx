import { useEffect, useState } from 'react';
import { common, plugins } from '@alilc/lowcode-engine';
import './global.less';
const preference = new Map();

preference.set('DataSourcePane', {
  importPlugins: [],
  dataSourceTypes: [
    {
      type: 'fetch',
    },
    {
      type: 'jsonp',
    }
  ]
});

const Workbench = common.skeletonCabin.Workbench;

const EditView: React.FC = () => {
  useEffect(() => {
    plugins.init(preference).then(() => { 
      console.log("plugins.initEND");
      setHasPluginInited(true);
    }).catch(err => console.error(err));
  }, []);

  /** 插件是否已初始化成功，因为必须要等插件初始化后才能渲染 Workbench */
  const [hasPluginInited, setHasPluginInited] = useState(false);

  return (
    <>
      { hasPluginInited && <Workbench />}
    </>
  );
};

export default EditView;
