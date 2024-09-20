import { Badge } from 'antd';
import React from 'react';

export const CustomBadge = ({ children, status, size }) => {
   return (
      <Badge
         dot
         status={status === 'online' ? 'success' : 'default'}
         size='default'
         style={{
            position: 'absolute',
            left: size ? size : '30px',
         }}
      >
         {children}
      </Badge>
   );
};
