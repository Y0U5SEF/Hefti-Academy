// components/withPageLayout.jsx
import React from 'react';
import { PageTitle, PageContainer } from './PageComponents';

const withPageLayout = (WrappedComponent, pageConfig) => {
  return function WithPageLayout(props) {
    return (
      <PageContainer>
        <PageTitle 
          title={pageConfig.title} 
          subtitle={pageConfig.subtitle} 
        />
        <WrappedComponent {...props} />
      </PageContainer>
    );
  };
};

export default withPageLayout;