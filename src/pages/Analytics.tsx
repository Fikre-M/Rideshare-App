// @ts-nocheck
import { useState } from 'react';
import { Box, Typography, Tabs, Tab } from "@mui/material";
import { PageContainer, PageHeader } from '../components/layout';
import DemandPredictor from '../components/ai/DemandPredictor';
import PredictiveAnalytics from '../components/ai/PredictiveAnalytics';
import DynamicPricing from '../components/ai/DynamicPricing';

const Analytics = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        title="AI Analytics Dashboard"
        subtitle="Advanced analytics powered by machine learning"
      />
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab label="Predictive Analytics" />
          <Tab label="Demand Prediction" />
          <Tab label="Dynamic Pricing" />
        </Tabs>
      </Box>

      <Box sx={{ minHeight: '60vh' }}>
        {activeTab === 0 && <PredictiveAnalytics />}
        {activeTab === 1 && <DemandPredictor />}
        {activeTab === 2 && <DynamicPricing />}
      </Box>
    </PageContainer>
  );
};

export default Analytics;
