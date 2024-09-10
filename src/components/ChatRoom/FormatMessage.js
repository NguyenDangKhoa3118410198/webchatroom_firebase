import React from 'react';
import { Avatar, Dropdown, Tooltip, Typography } from 'antd';
import { MoreOutlined, UserOutlined } from '@ant-design/icons';
import { formatTime } from '../../utils';

const FormatMessage = ({
   children,
   uniqueKey,
   displayName,
   photoURL,
   createAt,
   menu,
}) => {
   return (
      <div className='message-layout-container' key={uniqueKey}>
         <div className='wrapper-info'>
            <div className='author-info'>
               <Tooltip placement='left' title={displayName ?? 'Anonymous'}>
                  {displayName ? (
                     <Avatar
                        size='default'
                        src={photoURL}
                        className='avatar-custom'
                     >
                        {photoURL ? '' : displayName?.charAt(0)?.toUpperCase()}
                     </Avatar>
                  ) : (
                     <Avatar icon={<UserOutlined />} alt='Error' />
                  )}
               </Tooltip>
            </div>
         </div>
         {children}
         <div className='more-options'>
            <Dropdown overlay={menu} trigger={['click']} placement='top' arrow>
               <MoreOutlined className='more-icon' color='red' />
            </Dropdown>
         </div>
         <div className='message-date'>
            <Typography.Text className='date'>
               {formatTime(createAt?.seconds)}
            </Typography.Text>
         </div>
      </div>
   );
};

export default FormatMessage;
