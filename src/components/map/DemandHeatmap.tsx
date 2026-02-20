import React, { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { IconButton, Paper, Tooltip } from '@mui/material';
import { Layers, LayersClear } from '@mui/icons-material';
import { HeatmapPoint } from '../../types/map';

interface DemandHeatmapProps {
  heatmapPoints: HeatmapPoint[];
  visible?: boolean;
}

const DemandHeatmap: React.FC<DemandHeatmapProps> = ({
  heatmapPoints,
  visible = true,
}) => {
  const map = useMap();
  const [heatLayer, setHeatLayer] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    // Create heatmap layer
    if (typeof (L as any).heatLayer === 'function') {
      const points = heatmapPoints.map((point) => [
        point.lat,
        point.lng,
        point.intensity,
      ]);

      const heat = (L as any).heatLayer(points, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        max: 1.0,
        gradient: {
          0.0: 'blue',
          0.3: 'cyan',
          0.5: 'lime',
          0.7: 'yellow',
          1.0: 'red',
        },
      });

      setHeatLayer(heat);

      if (isVisible) {
        heat.addTo(map);
      }

      return () => {
        if (heat) {
          map.removeLayer(heat);
        }
      };
    }
  }, [heatmapPoints, map]);

  useEffect(() => {
    if (heatLayer) {
      if (isVisible) {
        heatLayer.addTo(map);
      } else {
        map.removeLayer(heatLayer);
      }
    }
  }, [isVisible, heatLayer, map]);

  const toggleHeatmap = () => {
    setIsVisible(!isVisible);
  };

  return (
    <Paper
      sx={{
        position: 'absolute',
        top: 80,
        right: 10,
        zIndex: 1000,
      }}
      elevation={3}
    >
      <Tooltip title={isVisible ? 'Hide Demand Heatmap' : 'Show Demand Heatmap'}>
        <IconButton onClick={toggleHeatmap} color={isVisible ? 'primary' : 'default'}>
          {isVisible ? <LayersClear /> : <Layers />}
        </IconButton>
      </Tooltip>
    </Paper>
  );
};

export default DemandHeatmap;
