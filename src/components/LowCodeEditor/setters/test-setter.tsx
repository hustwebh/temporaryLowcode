import React, { useState, useEffect } from 'react'
import { Button, Modal } from 'antd';
import { Card, Col, Row } from 'antd';

import { getModelData } from '@/services/ant-design-pro/tableData'

export default function TestSetter(props: any) {
  const { value, onChange } = props
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dicValues, setDicValues] = useState<any>([]);
  useEffect(() => {
    getDicValue()
  }, [])

  const getDicValue = async () => {
    const result = await getModelData(4);//直接获取了单个模型的字典值

    const dicDesc = result.field_list?.map((item: any) => {
      return item.dict_values;
    })
    const selectValues = dicDesc.flat().map((item: any) => {
      return {
        label: item.name,
        value: item.value,
        disabled: false,
      }
    })
    setDicValues([...dicValues,selectValues]);
    // onChange(selectValues);
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

  return (
    <div>
      <Button type="primary" onClick={showModal}>
        选择匹配模型
      </Button>
      <Modal title="选择匹配模型" open={isModalOpen} onOk={onOk} onCancel={handleCancel}>
        <Row gutter={16}>
          {dicValues.map((item,index) => {
            return (<Col span={12}>
              <Card title={`模型${index}`} hoverable onClick={
                ()=>{
                  onOk()
                  onChange(item)
                }
              }>
                {item.map((_)=>{
                  return `label:${_.label},value:${_.value}\n`
                })}
              </Card>
            </Col>)
          })}
        </Row>
      </Modal>
    </div>
  )
}