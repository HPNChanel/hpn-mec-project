import { 
  Timeline, 
  TimelineItem, 
  TimelineSeparator, 
  TimelineConnector, 
  TimelineContent, 
  TimelineDot, 
  TimelineOppositeContent 
} from '@mui/lab';
import { 
  Typography, 
  Paper, 
  Box, 
  Chip, 
  Divider,
  useTheme
} from '@mui/material';
import {
  Favorite as HeartIcon,
  Height as HeightIcon,
  MonitorWeight as WeightIcon,
  DeviceThermostat as BloodPressureIcon,
  Sick as SickIcon
} from '@mui/icons-material';

// Define health record interface
interface HealthRecord {
  id: string;
  userId: string;
  date: string;
  height: number;
  weight: number;
  heartRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  symptoms?: string;
  bmi: number;
}

interface HealthTimelineProps {
  records: HealthRecord[];
}

const HealthTimeline = ({ records }: HealthTimelineProps) => {
  const theme = useTheme();

  // Function to get color based on heart rate value
  const getHeartRateColor = (value: number): string => {
    if (value < 60) return theme.palette.info.main; // Low heart rate
    if (value > 100) return theme.palette.error.main; // High heart rate
    return theme.palette.success.main; // Normal heart rate
  };

  // Function to get color based on blood pressure values
  const getBloodPressureColor = (systolic: number, diastolic: number): string => {
    if (systolic >= 140 || diastolic >= 90) return theme.palette.error.main; // High BP
    if (systolic <= 90 || diastolic <= 60) return theme.palette.info.main; // Low BP
    return theme.palette.success.main; // Normal BP
  };

  // Function to format a date from the record
  const formatDate = (dateString: string): string => {
    // If the date is already formatted, just return it
    if (dateString.includes('/')) return dateString;
    
    // Try to format an ISO date string
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (_) {
      return dateString;
    }
  };

  if (records.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No health records found.
        </Typography>
      </Box>
    );
  }

  return (
    <Timeline position="alternate">
      {records.map((record, index) => (
        <TimelineItem key={record.id}>
          <TimelineOppositeContent color="text.secondary">
            <Typography variant="body2">
              {formatDate(record.date)}
            </Typography>
          </TimelineOppositeContent>
          
          <TimelineSeparator>
            <TimelineDot 
              color="primary"
              variant={index === 0 ? "filled" : "outlined"}
              sx={{ 
                boxShadow: index === 0 ? 2 : 0
              }}
            >
              <HeartIcon />
            </TimelineDot>
            {index < records.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          
          <TimelineContent>
            <Paper 
              elevation={index === 0 ? 3 : 1}
              sx={{ 
                p: 2, 
                mb: 2,
                borderLeft: index === 0 ? `4px solid ${theme.palette.primary.main}` : 'none',
                bgcolor: index === 0 ? 'background.paper' : 'background.default'
              }}
            >
              <Typography variant="h6" component="div">
                Health Record
              </Typography>
              
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HeartIcon sx={{ color: getHeartRateColor(record.heartRate) }} />
                  <Typography variant="body2">
                    Heart Rate: <strong>{record.heartRate} bpm</strong>
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BloodPressureIcon sx={{ 
                    color: getBloodPressureColor(record.bloodPressureSystolic, record.bloodPressureDiastolic) 
                  }} />
                  <Typography variant="body2">
                    Blood Pressure: <strong>{record.bloodPressureSystolic}/{record.bloodPressureDiastolic} mmHg</strong>
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WeightIcon />
                  <Typography variant="body2">
                    Weight: <strong>{record.weight} kg</strong>
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HeightIcon />
                  <Typography variant="body2">
                    Height: <strong>{record.height} cm</strong>
                  </Typography>
                </Box>
                
                {record.symptoms && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <SickIcon sx={{ mt: 0.5 }} />
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          Symptoms:
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {record.symptoms}
                        </Typography>
                      </Box>
                    </Box>
                  </>
                )}
                
                <Box sx={{ display: 'flex', mt: 1, gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`BMI: ${record.bmi.toFixed(1)}`}
                    size="small"
                    color={
                      record.bmi < 18.5 ? "info" : 
                      record.bmi < 25 ? "success" : 
                      record.bmi < 30 ? "warning" : "error"
                    }
                  />
                </Box>
              </Box>
            </Paper>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

export default HealthTimeline; 