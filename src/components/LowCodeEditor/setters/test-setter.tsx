import React, { useState, useEffect } from 'react'
import { Button, Modal, Radio, Checkbox, Cascader, Space } from 'antd';
import { Card, Col, Row } from 'antd';

import { getIndicatorData } from '@/services/ant-design-pro/tableData';
import { project } from '@alilc/lowcode-engine';

export default function TestSetter(props: any) {
  const { value, onChange } = props
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dicValues, setDicValues] = useState<any>([]);
  useEffect(() => {
    awaitDicValue()
  }, [])

  const awaitDicValue = async () => {
    const result = await getIndicatorData(~~(localStorage.getItem("indicator") || ""));//直接获取了单个模型的字典值
    const dicDesc = result.field_list?.map((item: any) => {
      return {
        name: item.name,
        field_name: item.field_name,
        dict_values: item.dict_values.map((item: any) => ({
          label: item.name,
          value: item.value,
        }))
      };
    })
    setDicValues(dicDesc)
    console.log("DicValues", dicDesc);
    if (!value) {
      onChange([
        { label: "A", value: "A" },
        { label: "B", value: "B" },
        { label: "C", value: "C" }
      ])
    }
  }

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const selectOptions = async ({ dict_values, name, field_name }: {
    dict_values: any[], name: string, field_name: string
  }) => {
    onChange(dict_values)
    const parentNode = project.currentDocument && project.currentDocument.selection.node.parent
    if (parentNode?.propsData) {
      parentNode.setPropValue("label", name)
      parentNode.setPropValue("name", field_name)
    }
    setIsModalOpen(false)
  }

  return (
    <div>
      <Button type="primary" onClick={showModal}>
        选择匹配指标
      </Button>
      <Modal
        title="选择匹配指标"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        style={{ height: 500, overflowY: 'scroll' }}
      >
        <Row gutter={16}>
          {dicValues && dicValues.map((item: any) => (
            <Col style={{ marginBottom: 10, width: '100%' }} onClick={() => selectOptions(item)}>
              <Card hoverable>
                <Space>
                  {`${item.name}:`}
                  <Radio.Group options={item.dict_values} value={null} />
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Modal>
      {/* <Cascader
        style={{ width: '100%' }}
        options={options}
        onChange={onChange}
        multiple
        maxTagCount="responsive"
      /> */}
    </div>
  )
}