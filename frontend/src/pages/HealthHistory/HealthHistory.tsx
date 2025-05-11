import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  CircularProgress, 
  Alert,
  Button,
  Paper,
  Chip,
  Divider,
  useTheme,
  TextField,
  FormControl,
  FormControlLabel,
  Checkbox,
  Grid,
  InputAdornment,
  Collapse
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
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
  Favorite as HeartIcon,
  Height as HeightIcon,
  MonitorWeight as WeightIcon,
  DeviceThermostat as BloodPressureIcon,
  Sick as SickIcon,
  MoreHoriz as DetailsIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { healthRecordsService } from '../../api/services';

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
  created_at?: string; // Added for API compatibility
}

interface FilterOptions {
  dateFrom: Date | null;
  dateTo: Date | null;
  symptomSearch: string;
  highBloodPressure: boolean;
  lowBloodPressure: boolean;
  highHeartRate: boolean;
  lowHeartRate: boolean;
  abnormalBmi: boolean;
}

const HealthHistory = () => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    dateFrom: null,
    dateTo: null,
    symptomSearch: '',
    highBloodPressure: false,
    lowBloodPressure: false,
    highHeartRate: false,
    lowHeartRate: false,
    abnormalBmi: false
  });

  // Fetch health records when component mounts
  useEffect(() => {
    const fetchHealthRecords = async () => {
      try {
        const data = await healthRecordsService.getAllForCurrentUser();
        
        // Process and sort records (newest first)
        const processedData = data.map((record: HealthRecord) => ({
          ...record,
          // Use created_at if available, otherwise fall back to date
          date: record.created_at || record.date,
          // Calculate BMI if not provided by API
          bmi: record.bmi || record.weight / Math.pow(record.height / 100, 2)
        })).sort((a: HealthRecord, b: HealthRecord) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setRecords(processedData);
        setFilteredRecords(processedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching health records');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHealthRecords();
  }, []);
  
  // Apply filters when filters change
  useEffect(() => {
    applyFilters();
  }, [filters, records]);
  
  // Toggle filter section
  const toggleFilters = () => {
    setFilterOpen(!filterOpen);
  };
  
  // Handle filter changes
  const handleFilterChange = (name: keyof FilterOptions, value: unknown) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      dateFrom: null,
      dateTo: null,
      symptomSearch: '',
      highBloodPressure: false,
      lowBloodPressure: false,
      highHeartRate: false,
      lowHeartRate: false,
      abnormalBmi: false
    });
  };
  
  // Apply filters to records
  const applyFilters = () => {
    let result = [...records];
    
    // Date range filter
    if (filters.dateFrom) {
      const dateFrom = new Date(filters.dateFrom);
      dateFrom.setHours(0, 0, 0, 0);
      result = result.filter(record => new Date(record.date) >= dateFrom);
    }
    
    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo);
      dateTo.setHours(23, 59, 59, 999);
      result = result.filter(record => new Date(record.date) <= dateTo);
    }
    
    // Symptom search
    if (filters.symptomSearch.trim()) {
      const searchTerm = filters.symptomSearch.toLowerCase();
      result = result.filter(record => 
        record.symptoms?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Blood pressure filters
    if (filters.highBloodPressure) {
      result = result.filter(record => 
        record.bloodPressureSystolic >= 140 || record.bloodPressureDiastolic >= 90
      );
    }
    
    if (filters.lowBloodPressure) {
      result = result.filter(record => 
        record.bloodPressureSystolic <= 90 || record.bloodPressureDiastolic <= 60
      );
    }
    
    // Heart rate filters
    if (filters.highHeartRate) {
      result = result.filter(record => record.heartRate > 100);
    }
    
    if (filters.lowHeartRate) {
      result = result.filter(record => record.heartRate < 60);
    }
    
    // BMI filter
    if (filters.abnormalBmi) {
      result = result.filter(record => 
        record.bmi < 18.5 || record.bmi >= 25
      );
    }
    
    setFilteredRecords(result);
  };

  // Navigate to detail page
  const handleViewDetails = (id: string) => {
    navigate(`/health-detail/${id}`);
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
    } catch {
      return dateString;
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Lịch sử sức khỏe
        </Typography>
        
        <Typography variant="body1" paragraph>
          Xem lại tất cả các bản ghi sức khỏe của bạn theo thứ tự thời gian.
        </Typography>
        
        {/* Filters button */}
        <Button
          variant="outlined"
          color="primary"
          startIcon={filterOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          endIcon={<FilterIcon />}
          onClick={toggleFilters}
          sx={{ mb: 2 }}
        >
          Bộ lọc
        </Button>
        
        {/* Filter section */}
        <Collapse in={filterOpen}>
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Lọc bản ghi</Typography>
                    <Button 
                      size="small" 
                      startIcon={<ClearIcon />} 
                      onClick={clearFilters}
                    >
                      Xóa bộ lọc
                    </Button>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                
                {/* Date range */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                    <DatePicker
                      label="Từ ngày"
                      value={filters.dateFrom}
                      onChange={(newValue: Date | null) => handleFilterChange('dateFrom', newValue)}
                      slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                    <DatePicker
                      label="Đến ngày"
                      value={filters.dateTo}
                      onChange={(newValue: Date | null) => handleFilterChange('dateTo', newValue)}
                      slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                    />
                  </LocalizationProvider>
                </Grid>
                
                {/* Symptom search */}
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Tìm kiếm triệu chứng"
                    variant="outlined"
                    size="small"
                    value={filters.symptomSearch}
                    onChange={(e) => handleFilterChange('symptomSearch', e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                {/* Health metrics filters */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl component="fieldset">
                    <Typography variant="subtitle2" gutterBottom>
                      Huyết áp
                    </Typography>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={filters.highBloodPressure}
                          onChange={(e) => handleFilterChange('highBloodPressure', e.target.checked)}
                          size="small"
                        />
                      }
                      label="Huyết áp cao"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={filters.lowBloodPressure}
                          onChange={(e) => handleFilterChange('lowBloodPressure', e.target.checked)}
                          size="small"
                        />
                      }
                      label="Huyết áp thấp"
                    />
                  </FormControl>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl component="fieldset">
                    <Typography variant="subtitle2" gutterBottom>
                      Nhịp tim
                    </Typography>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={filters.highHeartRate}
                          onChange={(e) => handleFilterChange('highHeartRate', e.target.checked)}
                          size="small"
                        />
                      }
                      label="Nhịp tim cao"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={filters.lowHeartRate}
                          onChange={(e) => handleFilterChange('lowHeartRate', e.target.checked)}
                          size="small"
                        />
                      }
                      label="Nhịp tim thấp"
                    />
                  </FormControl>
                </Grid>
                
                <Grid size={12}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={filters.abnormalBmi}
                        onChange={(e) => handleFilterChange('abnormalBmi', e.target.checked)}
                        size="small"
                      />
                    }
                    label="Chỉ số BMI bất thường"
                  />
                </Grid>
                
                {/* Results count */}
                <Grid size={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Đang hiển thị {filteredRecords.length} trong tổng số {records.length} bản ghi
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Collapse>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        ) : filteredRecords.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
            {records.length === 0 
              ? 'Chưa có bản ghi sức khỏe nào. Thêm bản ghi đầu tiên để bắt đầu theo dõi.'
              : 'Không tìm thấy bản ghi nào phù hợp với bộ lọc. Hãy thử điều chỉnh lại bộ lọc.'}
          </Alert>
        ) : (
          <Timeline position="right" sx={{ p: 0, ml: 0 }}>
            {filteredRecords.map((record, index) => (
              <TimelineItem key={record.id}>
                <TimelineOppositeContent 
                  sx={{ m: 'auto 0' }}
                  align="right"
                  variant="body2"
                  color="text.secondary"
                >
                  {formatDate(record.date)}
                </TimelineOppositeContent>
                
                <TimelineSeparator>
                  <TimelineConnector sx={{ bgcolor: 'primary.light' }} />
                  <TimelineDot 
                    color="primary"
                    variant={index === 0 ? "filled" : "outlined"}
                  >
                    <HeartIcon />
                  </TimelineDot>
                  <TimelineConnector sx={{ bgcolor: 'primary.light' }} />
                </TimelineSeparator>
                
                <TimelineContent sx={{ py: '12px', px: 2 }}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      borderLeft: `4px solid ${theme.palette.primary.main}`,
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 6
                      }
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start' 
                    }}>
                      <Typography variant="h6" component="div">
                        Bản ghi sức khỏe
                      </Typography>
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
                    
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HeartIcon sx={{ color: getHeartRateColor(record.heartRate) }} />
                        <Typography variant="body2">
                          Nhịp tim: <strong>{record.heartRate} bpm</strong>
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BloodPressureIcon sx={{ 
                          color: getBloodPressureColor(record.bloodPressureSystolic, record.bloodPressureDiastolic) 
                        }} />
                        <Typography variant="body2">
                          Huyết áp: <strong>{record.bloodPressureSystolic}/{record.bloodPressureDiastolic} mmHg</strong>
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WeightIcon />
                        <Typography variant="body2">
                          Cân nặng: <strong>{record.weight} kg</strong>
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HeightIcon />
                        <Typography variant="body2">
                          Chiều cao: <strong>{record.height} cm</strong>
                        </Typography>
                      </Box>
                      
                      {record.symptoms && (
                        <>
                          <Divider sx={{ my: 1 }} />
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <SickIcon sx={{ mt: 0.5 }} />
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                Triệu chứng:
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {record.symptoms}
                              </Typography>
                            </Box>
                          </Box>
                        </>
                      )}
                      
                      <Box sx={{ mt: 2, textAlign: 'right' }}>
                        <Button 
                          variant="outlined" 
                          size="small"
                          startIcon={<DetailsIcon />}
                          onClick={() => handleViewDetails(record.id)}
                        >
                          Chi tiết
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        )}
      </Box>
    </Container>
  );
};

export default HealthHistory; 