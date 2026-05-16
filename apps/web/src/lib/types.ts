export type DetectionStatus = 'pending' | 'accepted' | 'rejected';

export type Polygon = {
  id: string;
  label: string;
  category: 'room' | 'wall' | 'fixture' | 'equipment';
  status: DetectionStatus;
  confidence: number;
  points: [number, number][];
  area_sqft: number;
  perimeter_ft: number;
  color: string;
};

export type Job = {
  id: string;
  filename: string;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  stage?: string;
  progress?: number;
  created_at: string;
  polygon_count?: number;
};
