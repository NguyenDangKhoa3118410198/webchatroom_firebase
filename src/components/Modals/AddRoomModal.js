import { Form, Input, Modal } from 'antd';
import React, { useContext } from 'react';
import { AppContext } from '../Context/AppProvider';
import { addDocument } from '../firebase/services';
import { AuthContext } from '../Context/AuthProvider';

export default function AddRoomModal() {
   const { isAddRoomVisiable, setAddRoomVisiable } = useContext(AppContext);
   const { uid } = useContext(AuthContext);

   const [form] = Form.useForm();

   const handleOk = () => {
      addDocument({ ...form.getFieldValue(), members: [uid] }, 'rooms');

      form.resetFields();
      setAddRoomVisiable(false);
   };

   const handleCancel = () => {
      form.resetFields();
      setAddRoomVisiable(false);
   };
   return (
      <div>
         <Modal
            title='Create room'
            open={isAddRoomVisiable}
            onOk={handleOk}
            onCancel={handleCancel}
         >
            <Form form={form} layout='vertical'>
               <Form.Item label='Room name' name='name'>
                  <Input placeholder='Enter room name' />
               </Form.Item>
               <Form.Item label='Description' name='description'>
                  <Input.TextArea placeholder='Enter description' />
               </Form.Item>
            </Form>
         </Modal>
      </div>
   );
}
