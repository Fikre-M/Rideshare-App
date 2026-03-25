import { useState } from 'react';
import { Box, Typography, Tabs, Tab } from "@mui/material";
import SmartMatching from '../components/ai/SmartMatching';
import RouteOptimizer from '../components/ai/RouteOptimizer';

const Dispatch = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        AI Dispatch Center
      </Typography>
      
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Smart Matching" />
        <Tab label="Route Optimization" />
      </Tabs>

      {activeTab === 0 && <SmartMatching />}
      {activeTab === 1 && <RouteOptimizer />}
    </Box>
  );
};

export default Dispatch;
