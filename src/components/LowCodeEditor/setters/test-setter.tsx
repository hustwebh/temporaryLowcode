import React, { useState, useEffect } from 'react'
import { Button, Modal } from 'antd';
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
    console.log("DicValues",dicDesc);
  }

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const onOk = () => {
    setIsModalOpen(false)
  }

  const selectOptions = ({ dict_values, name, field_name }: {
    dict_values: any[], name: string, field_name: string
  }) => {
    const parentNode = project.currentDocument.selection.node.parent
    onOk();
    if (parentNode?.propsData) {
      parentNode.setPropValue("label", name)
      parentNode.setPropValue("name", field_name)
    }
    onChange(dict_values)
  }

  return (
    <div>
      <Button type="primary" onClick={showModal}>
        选择匹配指标
      </Button>
      <Modal title="选择匹配指标" open={isModalOpen} onOk={onOk} onCancel={handleCancel}>
        <Row gutter={16}>
          {dicValues && dicValues.map((item: any) => {
            return (<Col span={12}>
              <Card title={`${item.name}/${item.field_name}`} hoverable onClick={
                // () => {
                //   onOk()
                //   onChange(item)
                // }
                () => selectOptions(item)
              }>
                {item.dict_values.map((_:any) => {
                  return `label:${_.name},value:${_.value}\n`
                })}
              </Card>
            </Col>)
          })}
        </Row>
      </Modal>
    </div>
  )
}