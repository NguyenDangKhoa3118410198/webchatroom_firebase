import { Avatar, Form, Modal, Select, Spin } from 'antd';
import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../Context/AppProvider';
import { debounce } from 'lodash';
import { db } from '../firebase/config';
import {
   collection,
   query,
   where,
   orderBy,
   limit,
   getDocs,
} from 'firebase/firestore';
import { doc, updateDoc } from 'firebase/firestore';

function DebounceSelect({ fetchOptions, debounceTimeout = 300, ...props }) {
   const [fetching, setFetching] = useState(false);
   const [options, setOptions] = useState([]);

   const debounceFetcher = useMemo(() => {
      const loadOptions = (value) => {
         setOptions([]);
         setFetching(true);

         fetchOptions(value).then((newOptions) => {
            setOptions(newOptions);
            setFetching(false);
         });
      };
      return debounce(loadOptions, debounceTimeout);
   }, [debounceTimeout, fetchOptions]);

   return (
      <Select
         // labelInValue
         filterOption={false}
         onSearch={debounceFetcher}
         notFoundContent={fetching ? <Spin size='small' /> : null}
         {...props}
      >
         {/* [{label, value, photoURL}] */}
         {options.map((option) => (
            <Select.Option
               key={option.value}
               value={option.value}
               title={option.label}
            >
               <Avatar size='small' src={option.photoURL}>
                  {option.photoURL
                     ? ''
                     : option.label?.charAt(0)?.toUpperCase()}
               </Avatar>
               {` ${option.label}`}
            </Select.Option>
         ))}
      </Select>
   );
}

async function fetchUserList(search) {
   const querySnapshot = await getDocs(
      query(
         collection(db, 'users'),
         where('keywords', 'array-contains', search),
         orderBy('displayName'),
         limit(20)
      )
   );

   const userList = querySnapshot.docs.map((doc) => ({
      label: doc.data().displayName,
      value: doc.data().uid,
      photoURL: doc.data().photoURL,
   }));

   return userList;
}

export default function InviteMemberModal() {
   const {
      isInviteMemberVisiable,
      setIsInviteMemberVisiable,
      selectedRoomId,
      selectedRoom,
   } = useContext(AppContext);

   const [value, setValue] = useState([]);
   const [form] = Form.useForm();

   const handleOk = async () => {
      const roomRef = doc(db, 'rooms', selectedRoomId);

      try {
         await updateDoc(roomRef, {
            members: [...selectedRoom.members, ...value],
         });
         console.log('Room members updated successfully.');
      } catch (error) {
         console.error('Error updating room members:', error);
      }
   };

   const handleCancel = () => {
      form.resetFields();
      setIsInviteMemberVisiable(false);
   };
   return (
      <div>
         <Modal
            title='Invite member'
            open={isInviteMemberVisiable}
            onOk={handleOk}
            onCancel={handleCancel}
         >
            <Form form={form} layout='vertical'>
               <DebounceSelect
                  mode='multiple'
                  label='Name members'
                  value={value}
                  placeholder='Enter name members'
                  fetchOptions={fetchUserList}
                  onChange={(newValue) => setValue(newValue)}
                  style={{ width: '100%' }}
               />
            </Form>
         </Modal>
      </div>
   );
}
