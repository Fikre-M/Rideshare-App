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
    <PageContainer>
      <PageHeader
        title="AI Analytics Dashboard"
        subtitle="Advanced analytics powered by machine learning"
      />
      
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Predictive Analytics" />
        <Tab label="Demand Prediction" />
        <Tab label="Dynamic Pricing" />
      </Tabs>

      {activeTab === 0 && <PredictiveAnalytics />}
      {activeTab === 1 && <DemandPredictor />}
      {activeTab === 2 && <DynamicPricing />}
    </PageContainer>
  );
};

export default Analytics;
