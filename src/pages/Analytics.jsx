import { useState } from 'react';
import { Box, Typography, Tabs, Tab } from "@mui/material";
import DemandPredictor from '../components/ai/DemandPredictor';
import PredictiveAnalytics from '../components/ai/PredictiveAnalytics';
import DynamicPricing from '../components/ai/DynamicPricing';

const Analytics = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        AI Analytics Dashboard
      </Typography>
      
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Predictive Analytics" />
        <Tab label="Demand Prediction" />
        <Tab label="Dynamic Pricing" />
      </Tabs>

      {activeTab === 0 && <PredictiveAnalytics />}
      {activeTab === 1 && <DemandPredictor />}
      {activeTab === 2 && <DynamicPricing />}
    </Box>
  );
};

export default Analytics;
