import React, { Component } from 'react'; // import classNames from 'classnames';
import { Switch } from 'antd';
import { project } from "@alilc/lowcode-engine";
import type { IPublicModelNode } from "@alilc/lowcode-types";

class ControlledSetter extends Component<any, any> {
  static displayName = 'ControlledSetter';
  constructor(props: any) {
    super(props);
    this.stateChanged = this.stateChanged.bind(this);
  }

  componentDidMount() {
    const { onChange, value, defaultValue } = this.props;
    if (value == undefined && defaultValue) {
      onChange(defaultValue);
    }
  }

  stateChanged(checked: boolean) {
    const { onChange } = this.props;
    onChange(checked)
    const boxContainer = project.currentDocument?.selection.node?.parent?.parent;//对应box容器

    let otherFormItemIdInBox = boxContainer?.children?.map((item: any) => (item.id)) || [];
    otherFormItemIdInBox.splice(0, 1);//已经获取到除了控制开关容器内其他表单项Node的id数组

    const otherFormItemNodeInBox = otherFormItemIdInBox.map((nodeId) => (project.currentDocument?.nodesMap.get(nodeId)));

    if (!checked) { //当开关处于未选中状态修改对应节点的style属性为display:none
      otherFormItemNodeInBox.forEach((item: IPublicModelNode | undefined) => {
        item?.setPropValue("style",{"display":"none"})
      })
    }else {
      otherFormItemNodeInBox.forEach((item: IPublicModelNode | undefined) => {
        item?.setPropValue("style",{})
      })
    }
  }

  render() {
    return <Switch defaultChecked onChange={this.stateChanged} />;
  }
}

export default ControlledSetter;
