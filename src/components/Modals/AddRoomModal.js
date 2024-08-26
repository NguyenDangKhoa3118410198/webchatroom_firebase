import { Form, Input, Modal } from 'antd';
import React, { useContext } from 'react';
import { AppContext } from '../Context/AppProvider';
import { addDocument } from '../firebase/services';
import { AuthContext } from '../Context/AuthProvider';

export default function AddRoomModal() {
   const { isAddRoomVisible, setAddRoomVisible } = useContext(AppContext);
   const { uid } = useContext(AuthContext);

   const [form] = Form.useForm();

   const handleOk = async () => {
      try {
         const values = await form.validateFields();
         values.name =
            values.name.charAt(0).toUpperCase() + values.name.slice(1);
         await addDocument(
            { ...values, members: [uid], latestMessageTime: new Date() },
            'rooms'
         );
         form.resetFields();
         setAddRoomVisible(false);
      } catch (error) {
         console.error('Error during form validation:', error);
      }
   };
   const handleCancel = () => {
      form.resetFields();
      setAddRoomVisible(false);
   };
   return (
      <div>
         <Modal
            title='Create room'
            open={isAddRoomVisible}
            onOk={handleOk}
            onCancel={handleCancel}
         >
            <Form form={form} layout='vertical'>
               <Form.Item
                  label='Room name'
                  name='name'
                  rules={[
                     {
                        required: true,
                        message: 'Please enter room name!',
                     },
                  ]}
               >
                  <Input placeholder='Enter room name' />
               </Form.Item>
               <Form.Item
                  label='Description'
                  name='description'
                  rules={[
                     {
                        required: true,
                        message: 'Please enter description!',
                     },
                  ]}
               >
                  <Input.TextArea placeholder='Enter description' />
               </Form.Item>
            </Form>
         </Modal>
      </div>
   );
}
