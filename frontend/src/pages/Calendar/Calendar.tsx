import { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  CircularProgress, 
  Alert,
  Chip,
  Card,
  CardContent,
  Divider,
  useTheme
} from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import type { EventClickArg, EventInput } from '@fullcalendar/core';
import { 
  FiberManualRecord as DotIcon,
  Favorite as HeartIcon,
  Height as HeightIcon,
  MonitorWeight as WeightIcon,
  DeviceThermostat as BloodPressureIcon
} from '@mui/icons-material';
import { healthRecordsService } from '../../api/services';
import { viLocale } from '../../utils/fullcalendar-locales';

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
  created_at?: string;
}

// Define extended properties for calendar events
interface HealthEventExtendedProps {
  record?: HealthRecord;
  records?: HealthRecord[];
}

// Function to check if a health record has any critical values
const hasCriticalValues = (record: HealthRecord): boolean => {
  return (
    record.heartRate < 60 || 
    record.heartRate > 100 || 
    record.bloodPressureSystolic >= 140 || 
    record.bloodPressureDiastolic >= 90 ||
    record.bloodPressureSystolic <= 90 || 
    record.bloodPressureDiastolic <= 60 ||
    record.bmi < 18.5 || 
    record.bmi >= 30
  );
};

const Calendar = () => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateRecords, setSelectedDateRecords] = useState<HealthRecord[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const theme = useTheme();

  // Fetch health records when component mounts
  useEffect(() => {
    const fetchHealthRecords = async () => {
      try {
        const data = await healthRecordsService.getAllForCurrentUser();
        
        // Process records
        const processedData = data.map((record: HealthRecord) => ({
          ...record,
          // Use created_at if available, otherwise fall back to date
          date: record.created_at || record.date,
          // Calculate BMI if not provided by API
          bmi: record.bmi || record.weight / Math.pow(record.height / 100, 2)
        }));
        
        setRecords(processedData);
        
        // Convert records to calendar events
        const calendarEvents = processedData.map((record: HealthRecord) => {
          const isCritical = hasCriticalValues(record);
          return {
            id: record.id,
            title: 'Bản ghi sức khỏe',
            start: new Date(record.date).toISOString().split('T')[0], // Get YYYY-MM-DD format
            backgroundColor: isCritical ? theme.palette.error.main : theme.palette.success.main,
            borderColor: isCritical ? theme.palette.error.dark : theme.palette.success.dark,
            textColor: '#ffffff',
            extendedProps: {
              record
            } as HealthEventExtendedProps
          };
        });
        
        // Group events by date (combine multiple records on the same day)
        const eventsByDate: Record<string, EventInput[]> = calendarEvents.reduce((acc: Record<string, EventInput[]>, event: EventInput) => {
          const date = event.start as string;
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(event);
          return acc;
        }, {});
        
        // Create final events list with count in title for multiple events
        const finalEvents = Object.entries(eventsByDate).map(([date, dateEvents]) => {
          const hasCritical = dateEvents.some(event => 
            event.backgroundColor === theme.palette.error.main
          );
          
          return {
            start: date,
            title: dateEvents.length > 1 ? `${dateEvents.length} bản ghi` : 'Bản ghi sức khỏe',
            backgroundColor: hasCritical ? theme.palette.error.main : theme.palette.success.main,
            borderColor: hasCritical ? theme.palette.error.dark : theme.palette.success.dark,
            textColor: '#ffffff',
            allDay: true,
            extendedProps: {
              records: dateEvents.map(e => (e.extendedProps as HealthEventExtendedProps).record)
            } as HealthEventExtendedProps
          };
        });
        
        setEvents(finalEvents);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching health records');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHealthRecords();
  }, [theme]);

  // Handle event click
  const handleEventClick = (clickInfo: EventClickArg) => {
    const clickedDate = clickInfo.event.startStr;
    
    if (!clickedDate) return;
    
    setSelectedDate(clickedDate);
    
    // Find all records for the clicked date
    const dateRecords = records.filter(record => {
      const recordDate = new Date(record.date).toISOString().split('T')[0];
      return recordDate === clickedDate;
    });
    
    setSelectedDateRecords(dateRecords);
  };

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

  // Function to get BMI status color
  const getBmiColor = (bmi: number): string => {
    if (bmi < 18.5) return theme.palette.info.main; // Underweight
    if (bmi < 25) return theme.palette.success.main; // Normal
    if (bmi < 30) return theme.palette.warning.main; // Overweight
    return theme.palette.error.main; // Obese
  };

  // Function to format a date for display
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Lịch sức khỏe
        </Typography>
        
        <Typography variant="body1" paragraph>
          Theo dõi các bản ghi sức khỏe của bạn theo lịch. Các điểm màu xanh biểu thị những ngày có chỉ số bình thường, 
          còn màu đỏ biểu thị những ngày có chỉ số cần lưu ý.
        </Typography>
        
        {/* Legend */}
        <Box sx={{ mb: 3, display: 'flex', gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DotIcon sx={{ color: theme.palette.success.main, mr: 1 }} />
            <Typography variant="body2">Bình thường</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DotIcon sx={{ color: theme.palette.error.main, mr: 1 }} />
            <Typography variant="body2">Có chỉ số cần lưu ý</Typography>
          </Box>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        ) : records.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
            Chưa có bản ghi sức khỏe nào. Thêm bản ghi đầu tiên để bắt đầu theo dõi.
          </Alert>
        ) : (
          <Box>
            <Paper elevation={3} sx={{ p: 2 }}>
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                events={events}
                height="auto"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,dayGridWeek'
                }}
                selectable={true}
                eventClick={handleEventClick}
                locales={[viLocale]}
                locale="vi"
                buttonText={{
                  today: 'Hôm nay',
                  month: 'Tháng',
                  week: 'Tuần'
                }}
              />
            </Paper>
            
            {/* Selected date records */}
            {selectedDate && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                  Bản ghi ngày {new Date(selectedDate).toLocaleDateString('vi-VN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Typography>
                
                {selectedDateRecords.length === 0 ? (
                  <Alert severity="info">
                    Không có bản ghi sức khỏe nào cho ngày này.
                  </Alert>
                ) : (
                  <Box
                    display="flex"
                    flexWrap="wrap"
                    gap={3}
                    sx={{ mt: 2 }}
                  >
                    {selectedDateRecords.map((record) => (
                      <Box key={record.id} width={{ xs: '100%', md: '48%' }}>
                        <Card elevation={3}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              {formatDate(record.date)}
                            </Typography>
                            
                            <Divider sx={{ my: 1.5 }} />
                            
                            <Box display="flex" flexWrap="wrap" gap={2}>
                              <Box width="calc(50% - 8px)">
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <HeightIcon sx={{ mr: 1, color: 'primary.main' }} />
                                  <Typography variant="body2">
                                    Chiều cao: {record.height} cm
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <Box width="calc(50% - 8px)">
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <WeightIcon sx={{ mr: 1, color: 'primary.main' }} />
                                  <Typography variant="body2">
                                    Cân nặng: {record.weight} kg
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <Box width="calc(50% - 8px)">
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <HeartIcon sx={{ 
                                    mr: 1, 
                                    color: getHeartRateColor(record.heartRate) 
                                  }} />
                                  <Typography variant="body2">
                                    Nhịp tim: {record.heartRate} bpm
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <Box width="calc(50% - 8px)">
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <BloodPressureIcon sx={{ 
                                    mr: 1, 
                                    color: getBloodPressureColor(
                                      record.bloodPressureSystolic, 
                                      record.bloodPressureDiastolic
                                    ) 
                                  }} />
                                  <Typography variant="body2">
                                    Huyết áp: {record.bloodPressureSystolic}/{record.bloodPressureDiastolic} mmHg
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                            
                            <Box sx={{ mt: 2 }}>
                              <Chip 
                                label={`BMI: ${record.bmi.toFixed(1)}`}
                                size="small"
                                sx={{
                                  backgroundColor: getBmiColor(record.bmi),
                                  color: 'white'
                                }}
                              />
                            </Box>
                            
                            {record.symptoms && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Triệu chứng:</strong> {record.symptoms}
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Calendar; 