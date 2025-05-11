import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  useTheme,
  Snackbar
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Favorite as HeartIcon,
  Height as HeightIcon,
  MonitorWeight as WeightIcon,
  DeviceThermostat as BloodPressureIcon,
  Sick as SickIcon,
  CalendarMonth as DateIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { healthRecordsService } from '../../api/services';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
  bmi: number;
  created_at?: string;
}

const HealthDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<HealthRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHealthRecord = async () => {
      if (!id) {
        setError('ID bản ghi không hợp lệ');
        setLoading(false);
        return;
      }

      try {
        const data = await healthRecordsService.getById(id);
        
        // Calculate BMI if not provided by API
        const processedRecord = {
          ...data,
          bmi: data.bmi || data.weight / Math.pow(data.height / 100, 2)
        };
        
        setRecord(processedRecord);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải bản ghi sức khỏe');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHealthRecord();
  }, [id]);

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

  // Function to format a date string
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    
    // If the date is already formatted, just return it
    if (dateString.includes('/')) return dateString;
    
    // Format an ISO date string
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

  // Get BMI category and description
  const getBmiCategory = (bmi: number): { label: string; color: 'success' | 'info' | 'warning' | 'error' } => {
    if (bmi < 18.5) return { label: 'Thiếu cân', color: 'info' };
    if (bmi < 25) return { label: 'Bình thường', color: 'success' };
    if (bmi < 30) return { label: 'Thừa cân', color: 'warning' };
    return { label: 'Béo phì', color: 'error' };
  };

  // Get heart rate status
  const getHeartRateStatus = (heartRate: number): { label: string; color: 'success' | 'info' | 'error' } => {
    if (heartRate < 60) return { label: 'Nhịp tim thấp', color: 'info' };
    if (heartRate > 100) return { label: 'Nhịp tim cao', color: 'error' };
    return { label: 'Nhịp tim bình thường', color: 'success' };
  };

  // Get blood pressure status
  const getBloodPressureStatus = (systolic: number, diastolic: number): { label: string; color: 'success' | 'info' | 'error' } => {
    if (systolic >= 140 || diastolic >= 90) return { label: 'Huyết áp cao', color: 'error' };
    if (systolic <= 90 || diastolic <= 60) return { label: 'Huyết áp thấp', color: 'info' };
    return { label: 'Huyết áp bình thường', color: 'success' };
  };

  // Navigate back to health history
  const handleBack = () => {
    navigate('/health-history');
  };

  // Export health record to PDF
  const exportToPdf = () => {
    if (!record) return;
    
    try {
      // Create a new PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('Chi tiết bản ghi sức khỏe', 14, 22);
      
      // Add date info
      doc.setFontSize(12);
      doc.text(`Ngày: ${formatDate(record.date)}`, 14, 30);
      doc.text(`Mã bản ghi: ${record.id}`, 14, 36);
      
      // Add horizontal line
      doc.setDrawColor(220, 220, 220);
      doc.line(14, 40, 196, 40);
      
      // Create health metrics section
      doc.setFontSize(14);
      doc.text('Các chỉ số sức khỏe', 14, 50);
      
      // Create table data
      const tableColumn = ["Chỉ số", "Giá trị", "Đánh giá"];
      const tableRows = [
        ["Chiều cao", `${record.height} cm`, ""],
        ["Cân nặng", `${record.weight} kg`, ""],
        ["BMI", record.bmi.toFixed(1), getBmiCategory(record.bmi).label],
        ["Nhịp tim", `${record.heartRate} bpm`, getHeartRateStatus(record.heartRate).label],
        ["Huyết áp", `${record.bloodPressureSystolic}/${record.bloodPressureDiastolic} mmHg`, 
          getBloodPressureStatus(record.bloodPressureSystolic, record.bloodPressureDiastolic).label],
      ];
      
      // Add the table
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 55,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [66, 135, 245] },
        columnStyles: {
          0: { fontStyle: 'bold' },
          2: { halign: 'center' }
        }
      });
      
      // Add symptoms if available
      if (record.symptoms) {
        // Get the Y position where the table ended
        const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 130;
        doc.setFontSize(14);
        doc.text('Triệu chứng', 14, finalY + 10);
        
        doc.setFontSize(10);
        doc.text(record.symptoms, 14, finalY + 20);
      }
      
      // Add footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Trang ${i} / ${pageCount} - Xuất ngày ${new Date().toLocaleDateString('vi-VN')}`,
          doc.internal.pageSize.width / 2, 
          doc.internal.pageSize.height - 10, 
          { align: 'center' }
        );
      }
      
      // Save the PDF
      doc.save(`health_record_${record.id}.pdf`);
      
      // Show success message
      setPdfSuccess(true);
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Button startIcon={<BackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
            Quay lại
          </Button>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  if (!record) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Button startIcon={<BackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
            Quay lại
          </Button>
          <Alert severity="info">Không tìm thấy bản ghi sức khỏe</Alert>
        </Box>
      </Container>
    );
  }

  const bmiCategory = getBmiCategory(record.bmi);
  const heartRateStatus = getHeartRateStatus(record.heartRate);
  const bloodPressureStatus = getBloodPressureStatus(record.bloodPressureSystolic, record.bloodPressureDiastolic);

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button startIcon={<BackIcon />} onClick={handleBack}>
            Quay lại
          </Button>
          
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<PdfIcon />}
            onClick={exportToPdf}
          >
            Xuất PDF
          </Button>
        </Box>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Chi tiết bản ghi sức khỏe
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3, mt: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <DateIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              {formatDate(record.date)}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ width: { xs: '100%', md: '48%' }, flexGrow: 1 }}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  borderColor: getHeartRateColor(record.heartRate),
                  borderWidth: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <HeartIcon sx={{ color: getHeartRateColor(record.heartRate), mr: 1 }} />
                  <Typography variant="subtitle1">Nhịp tim</Typography>
                </Box>
                <Typography variant="h4" sx={{ mb: 1 }}>
                  {record.heartRate} <Typography component="span" variant="body2">bpm</Typography>
                </Typography>
                <Chip 
                  label={heartRateStatus.label} 
                  color={heartRateStatus.color} 
                  size="small" 
                  sx={{ mt: 1 }} 
                />
              </Paper>
            </Box>
            
            <Box sx={{ width: { xs: '100%', md: '48%' }, flexGrow: 1 }}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  borderColor: getBloodPressureColor(record.bloodPressureSystolic, record.bloodPressureDiastolic),
                  borderWidth: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BloodPressureIcon 
                    sx={{ 
                      color: getBloodPressureColor(record.bloodPressureSystolic, record.bloodPressureDiastolic), 
                      mr: 1 
                    }} 
                  />
                  <Typography variant="subtitle1">Huyết áp</Typography>
                </Box>
                <Typography variant="h4" sx={{ mb: 1 }}>
                  {record.bloodPressureSystolic}/{record.bloodPressureDiastolic} <Typography component="span" variant="body2">mmHg</Typography>
                </Typography>
                <Chip 
                  label={bloodPressureStatus.label} 
                  color={bloodPressureStatus.color} 
                  size="small" 
                  sx={{ mt: 1 }} 
                />
              </Paper>
            </Box>
            
            <Box sx={{ width: { xs: '100%', md: '48%' }, flexGrow: 1 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <HeightIcon sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">Chiều cao</Typography>
                </Box>
                <Typography variant="h4" sx={{ mb: 1 }}>
                  {record.height} <Typography component="span" variant="body2">cm</Typography>
                </Typography>
              </Paper>
            </Box>
            
            <Box sx={{ width: { xs: '100%', md: '48%' }, flexGrow: 1 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <WeightIcon sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">Cân nặng</Typography>
                </Box>
                <Typography variant="h4" sx={{ mb: 1 }}>
                  {record.weight} <Typography component="span" variant="body2">kg</Typography>
                </Typography>
              </Paper>
            </Box>
            
            <Box sx={{ width: '100%' }}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  borderColor: theme.palette.primary.main,
                  borderWidth: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" color="primary">Chỉ số BMI</Typography>
                </Box>
                <Typography variant="h4" sx={{ mb: 1 }}>
                  {record.bmi.toFixed(1)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    label={bmiCategory.label} 
                    color={bmiCategory.color} 
                    size="small" 
                  />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {record.bmi < 18.5 && 'BMI dưới 18.5 được coi là thiếu cân.'}
                    {record.bmi >= 18.5 && record.bmi < 25 && 'BMI từ 18.5 đến 24.9 được coi là bình thường.'}
                    {record.bmi >= 25 && record.bmi < 30 && 'BMI từ 25 đến 29.9 được coi là thừa cân.'}
                    {record.bmi >= 30 && 'BMI từ 30 trở lên được coi là béo phì.'}
                  </Typography>
                </Box>
              </Paper>
            </Box>
            
            {record.symptoms && (
              <Box sx={{ width: '100%' }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SickIcon sx={{ mr: 1 }} />
                    <Typography variant="subtitle1">Triệu chứng</Typography>
                  </Box>
                  <Typography variant="body1">
                    {record.symptoms}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* PDF Export Success Snackbar */}
      <Snackbar
        open={pdfSuccess}
        autoHideDuration={3000}
        onClose={() => setPdfSuccess(false)}
        message="Xuất PDF thành công"
      />
    </Container>
  );
};

export default HealthDetail; 