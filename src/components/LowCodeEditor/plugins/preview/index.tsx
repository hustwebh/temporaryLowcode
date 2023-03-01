import type { PluginProps } from '@alilc/lowcode-types';
import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { Button } from 'antd';

const createFormPluginContent: React.FC<PluginProps> = () => {
  return (
    <Button type="primary" onClick={() => {
      window.open("/Preview/index.html" )
    }}>
      预览
    </Button>
  );
};

const PreviewPlugin = (ctx: IPublicModelPluginContext) => {
  return {
    async init() {
      const { skeleton } = ctx;

      skeleton.add({
        name: 'preview',
        area: 'topArea',
        type: 'Widget',
        props: {
          align: 'right',
        },
        content: createFormPluginContent,
      });
    },
  };
}

PreviewPlugin.pluginName = 'preview';
// PreviewPlugin.meta = {
//   dependencies: ['EditorInitPlugin'],
// };
export default PreviewPlugin