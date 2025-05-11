import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  CircularProgress, 
  Alert, 
  Button, 
  Snackbar,
  Tab,
  Tabs,
  Paper
} from '@mui/material';
import { 
  PictureAsPdf as PdfIcon,
  Timeline as TimelineIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { healthRecordsService } from '../../api/services';
import HealthTimeline from '../../components/HealthTimeline';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// Add the autotable type to jsPDF
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: Record<string, unknown>) => jsPDF;
  }
}

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
  bmi: number;  // Calculated field
}

// Chart components using recharts
const BMIChart = ({ data }: { data: HealthRecord[] }) => (
  <ResponsiveContainer width="100%" height={250}>
    <LineChart
      data={data.slice().reverse()} // Reverse to show oldest to newest
      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
      <Tooltip />
      <Line 
        type="monotone" 
        dataKey="bmi" 
        stroke="#8884d8" 
        activeDot={{ r: 8 }} 
        name="BMI"
      />
    </LineChart>
  </ResponsiveContainer>
);

const HeartRateChart = ({ data }: { data: HealthRecord[] }) => (
  <ResponsiveContainer width="100%" height={250}>
    <LineChart
      data={data.slice().reverse()} // Reverse to show oldest to newest
      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
      <Tooltip />
      <Line 
        type="monotone" 
        dataKey="heartRate" 
        stroke="#FF5722" 
        activeDot={{ r: 8 }} 
        name="Heart Rate"
      />
    </LineChart>
  </ResponsiveContainer>
);

const BloodPressureChart = ({ data }: { data: HealthRecord[] }) => (
  <ResponsiveContainer width="100%" height={250}>
    <AreaChart
      data={data.slice().reverse()} // Reverse to show oldest to newest
      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis domain={[60, 'dataMax + 10']} />
      <Tooltip />
      <Area 
        type="monotone" 
        dataKey="bloodPressureSystolic" 
        stroke="#8884d8" 
        fill="#8884d8" 
        fillOpacity={0.3}
        name="Systolic"
      />
      <Area 
        type="monotone" 
        dataKey="bloodPressureDiastolic" 
        stroke="#82ca9d" 
        fill="#82ca9d"
        fillOpacity={0.3}
        name="Diastolic"
      />
    </AreaChart>
  </ResponsiveContainer>
);

// Small chart components for summary cards
const MiniHeartRateChart = ({ data }: { data: HealthRecord[] }) => (
  <ResponsiveContainer width="100%" height={60}>
    <LineChart
      data={data.slice().reverse().slice(0, 7)} // Last 7 records in chronological order
      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
    >
      <Line 
        type="monotone" 
        dataKey="heartRate" 
        stroke="#FF5722" 
        strokeWidth={2}
        dot={false}
      />
    </LineChart>
  </ResponsiveContainer>
);

const MiniBloodPressureChart = ({ data }: { data: HealthRecord[] }) => (
  <ResponsiveContainer width="100%" height={60}>
    <LineChart
      data={data.slice().reverse().slice(0, 7)} // Last 7 records in chronological order
      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
    >
      <Line 
        type="monotone" 
        dataKey="bloodPressureSystolic" 
        stroke="#8884d8" 
        strokeWidth={2}
        dot={false}
      />
      <Line 
        type="monotone" 
        dataKey="bloodPressureDiastolic" 
        stroke="#82ca9d" 
        strokeWidth={2}
        dot={false}
      />
    </LineChart>
  </ResponsiveContainer>
);

// Tab panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`health-tabpanel-${index}`}
      aria-labelledby={`health-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Dashboard = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Fetch health records when component mounts
  useEffect(() => {
    const fetchHealthRecords = async () => {
      try {
        const data = await healthRecordsService.getAllForCurrentUser();
        
        // Sort records by date (newest first) and calculate BMI
        const processedData = data.map((record: HealthRecord) => ({
          ...record,
          // Calculate BMI if not provided by API: weight(kg) / (height(m) * height(m))
          bmi: record.bmi || record.weight / Math.pow(record.height / 100, 2),
          // Format date for display
          date: new Date(record.date).toLocaleDateString()
        })).sort((a: HealthRecord, b: HealthRecord) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setRecords(processedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching health records');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHealthRecords();
  }, []);

  // Simple metrics for quick overview
  const getLatestMetrics = () => {
    if (records.length === 0) return null;
    
    const latest = records[0];
    return {
      bmi: latest.bmi.toFixed(1),
      heartRate: latest.heartRate,
      bloodPressure: `${latest.bloodPressureSystolic}/${latest.bloodPressureDiastolic}`,
      date: latest.date
    };
  };

  // Functions to determine health status colors
  const getBmiStatusColor = (bmi: number): string => {
    if (bmi < 18.5) return '#2196F3'; // Underweight - blue
    if (bmi >= 18.5 && bmi < 25) return '#4CAF50'; // Normal - green
    if (bmi >= 25 && bmi < 30) return '#FF9800'; // Overweight - orange
    return '#F44336'; // Obese - red
  };

  const getHeartRateStatusColor = (heartRate: number): string => {
    if (heartRate < 60) return '#2196F3'; // Low - blue
    if (heartRate >= 60 && heartRate <= 100) return '#4CAF50'; // Normal - green
    return '#F44336'; // High - red
  };

  const getBloodPressureStatusColor = (systolic: number, diastolic: number): string => {
    if (systolic >= 140 || diastolic >= 90) return '#F44336'; // High - red
    if (systolic <= 90 || diastolic <= 60) return '#2196F3'; // Low - blue
    return '#4CAF50'; // Normal - green
  };

  // Export health records to PDF
  const exportToPdf = () => {
    try {
      // Create a new PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('Health Records Report', 14, 22);
      
      // Add user info
      doc.setFontSize(12);
      doc.text(`Patient: ${user?.name || 'Unknown'}`, 14, 30);
      doc.text(`Date: ${new Date().toLocaleDateString('vi-VN')}`, 14, 36);
      
      // Create table data
      const tableColumn = ["Date", "Height (cm)", "Weight (kg)", "BMI", "Heart Rate (bpm)", "Blood Pressure (mmHg)", "Symptoms"];
      const tableRows = records.map(record => [
        record.date,
        record.height.toString(),
        record.weight.toString(),
        record.bmi.toFixed(1),
        record.heartRate.toString(),
        `${record.bloodPressureSystolic}/${record.bloodPressureDiastolic}`,
        record.symptoms || "-"
      ]);
      
      // Add the table
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [66, 135, 245] }
      });
      
      // Save the PDF
      doc.save(`health_records_${user?.name || 'report'}_${new Date().getTime()}.pdf`);
      
      // Show success message
      setPdfSuccess(true);
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  };

  const latestMetrics = getLatestMetrics();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">
            Welcome, {user?.name || 'User'}
          </Typography>
          
          {records.length > 0 && (
            <Button 
              variant="outlined" 
              startIcon={<PdfIcon />}
              onClick={exportToPdf}
            >
              Xuất PDF
            </Button>
          )}
        </Box>
        
        <Typography variant="body1" sx={{ mb: 4 }}>
          Your health dashboard shows your recent records and trends.
        </Typography>
        
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
            No health records found. Add your first health record to start tracking.
          </Alert>
        ) : (
          <>
            {/* Enhanced Latest Metrics Summary */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
              <Box sx={{ width: { xs: '100%', sm: '46%', md: '22%' }, flexGrow: 1 }}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center', 
                    borderLeft: latestMetrics ? `4px solid ${getBmiStatusColor(parseFloat(latestMetrics.bmi))}` : 'none',
                    transition: 'all 0.3s ease',
                    height: '100%'
                  }}
                  elevation={3}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    BMI
                  </Typography>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      color: latestMetrics ? getBmiStatusColor(parseFloat(latestMetrics.bmi)) : 'inherit',
                      fontWeight: 'bold'
                    }}
                  >
                    {latestMetrics?.bmi}
                  </Typography>
                  
                  <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                    {parseFloat(latestMetrics?.bmi || '0') < 18.5 ? 'Underweight' : 
                     parseFloat(latestMetrics?.bmi || '0') < 25 ? 'Normal' :
                     parseFloat(latestMetrics?.bmi || '0') < 30 ? 'Overweight' : 'Obese'}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary">
                    Last updated: {latestMetrics?.date}
                  </Typography>
                </Paper>
              </Box>
              
              <Box sx={{ width: { xs: '100%', sm: '46%', md: '22%' }, flexGrow: 1 }}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center', 
                    borderLeft: latestMetrics ? `4px solid ${getHeartRateStatusColor(latestMetrics.heartRate)}` : 'none',
                    transition: 'all 0.3s ease',
                    height: '100%'
                  }}
                  elevation={3}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Heart Rate
                  </Typography>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      color: latestMetrics ? getHeartRateStatusColor(latestMetrics.heartRate) : 'inherit',
                      fontWeight: 'bold'
                    }}
                  >
                    {latestMetrics?.heartRate} bpm
                  </Typography>
                  
                  {records.length > 1 && (
                    <Box sx={{ mt: 1, mb: 1 }}>
                      <MiniHeartRateChart data={records} />
                    </Box>
                  )}
                  
                  <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                    {latestMetrics && latestMetrics.heartRate < 60 ? 'Low' : 
                     latestMetrics && latestMetrics.heartRate > 100 ? 'High' : 'Normal'}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary">
                    Last updated: {latestMetrics?.date}
                  </Typography>
                </Paper>
              </Box>
              
              <Box sx={{ width: { xs: '100%', sm: '46%', md: '22%' }, flexGrow: 1 }}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center', 
                    borderLeft: latestMetrics ? 
                      `4px solid ${getBloodPressureStatusColor(
                        parseInt(latestMetrics.bloodPressure.split('/')[0] || '0'), 
                        parseInt(latestMetrics.bloodPressure.split('/')[1] || '0')
                      )}` : 'none',
                    transition: 'all 0.3s ease',
                    height: '100%'
                  }}
                  elevation={3}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Blood Pressure
                  </Typography>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      color: latestMetrics ? 
                        getBloodPressureStatusColor(
                          parseInt(latestMetrics.bloodPressure.split('/')[0] || '0'), 
                          parseInt(latestMetrics.bloodPressure.split('/')[1] || '0')
                        ) : 'inherit',
                      fontWeight: 'bold'
                    }}
                  >
                    {latestMetrics?.bloodPressure} mmHg
                  </Typography>
                  
                  {records.length > 1 && (
                    <Box sx={{ mt: 1, mb: 1 }}>
                      <MiniBloodPressureChart data={records} />
                    </Box>
                  )}
                  
                  <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                    {latestMetrics && 
                     (parseInt(latestMetrics.bloodPressure.split('/')[0] || '0') >= 140 || 
                      parseInt(latestMetrics.bloodPressure.split('/')[1] || '0') >= 90) ? 'High' : 
                     (parseInt(latestMetrics?.bloodPressure.split('/')[0] || '0') <= 90 || 
                      parseInt(latestMetrics?.bloodPressure.split('/')[1] || '0') <= 60) ? 'Low' : 'Normal'}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary">
                    Last updated: {latestMetrics?.date}
                  </Typography>
                </Paper>
              </Box>
              
              <Box sx={{ width: { xs: '100%', sm: '46%', md: '22%' }, flexGrow: 1 }}>
                <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }} elevation={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Weight
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">{records[0]?.weight} kg</Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                    {records.length > 1 && records[0]?.weight > records[1]?.weight 
                      ? `+${(records[0]?.weight - records[1]?.weight).toFixed(1)} kg since last record` 
                      : records.length > 1 && records[0]?.weight < records[1]?.weight
                      ? `-${(records[1]?.weight - records[0]?.weight).toFixed(1)} kg since last record`
                      : 'No change since last record'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Last updated: {latestMetrics?.date}
                  </Typography>
                </Paper>
              </Box>
            </Box>
            
            {/* Tabs for Charts and Timeline */}
            <Paper sx={{ mb: 4 }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                variant="fullWidth"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab icon={<DashboardIcon />} label="Dashboard" />
                <Tab icon={<TimelineIcon />} label="Timeline" />
              </Tabs>
              
              {/* Dashboard Tab Content */}
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {/* BMI Trend Chart */}
                  <Box sx={{ width: { xs: '100%', md: '48%' }, flexGrow: 1 }}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        BMI Trend
                      </Typography>
                      <BMIChart data={records} />
                    </Paper>
                  </Box>
                  
                  {/* Heart Rate Chart */}
                  <Box sx={{ width: { xs: '100%', md: '48%' }, flexGrow: 1 }}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Heart Rate Trend
                      </Typography>
                      <HeartRateChart data={records} />
                    </Paper>
                  </Box>
                  
                  {/* Blood Pressure Chart */}
                  <Box sx={{ width: '100%' }}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Blood Pressure
                      </Typography>
                      <BloodPressureChart data={records} />
                    </Paper>
                  </Box>
                </Box>
              </TabPanel>
              
              {/* Timeline Tab Content */}
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ pt: 1, pb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Health Records Timeline
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Chronological view of your health measurements and records.
                  </Typography>
                  <HealthTimeline records={records} />
                </Box>
              </TabPanel>
            </Paper>
          </>
        )}
      </Box>

      {/* PDF Export Success Snackbar */}
      <Snackbar
        open={pdfSuccess}
        autoHideDuration={3000}
        onClose={() => setPdfSuccess(false)}
        message="PDF generated successfully"
      />
    </Container>
  );
};

export default Dashboard; 