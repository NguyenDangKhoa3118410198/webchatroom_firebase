import React from 'react';
import { Spin } from 'antd';
import styled from 'styled-components';

const LoadingContainer = styled.div`
   display: flex;
   justify-content: center;
   align-items: center;
   height: 100vh;
`;

const Loading = () => (
   <LoadingContainer>
      <Spin size='large' />
   </LoadingContainer>
);

export default Loading;
