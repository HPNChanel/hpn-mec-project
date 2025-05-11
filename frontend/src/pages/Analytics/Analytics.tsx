import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  useTheme
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { analyticsService } from '../../api/services';

// Type definitions for analytics data
interface AnalyticsSummary {
  recordsPerMonth: {
    month: string;
    count: number;
  }[];
  registrationsPerMonth: {
    month: string;
    count: number;
  }[];
  riskDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
}

const Analytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  
  // Colors for pie chart
  const COLORS = [
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];
  
  // Redirect if user is not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  // Fetch analytics data on component mount
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await analyticsService.getSummary();
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu phân tích');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Phân tích dữ liệu
        </Typography>
        
        <Typography variant="body1" paragraph>
          Xem tổng quan về các chỉ số sức khỏe và hoạt động người dùng trong hệ thống.
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        ) : data ? (
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={3}>
              {/* Records per month line chart */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    height: 350,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Số lượng bản ghi theo tháng
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data.recordsPerMonth}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke={theme.palette.primary.main}
                        activeDot={{ r: 8 }}
                        name="Số bản ghi"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              {/* User registrations bar chart */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    height: 350,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Người dùng đăng ký theo tháng
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.registrationsPerMonth}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="count"
                        fill={theme.palette.secondary.main}
                        name="Số người dùng"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              {/* Health risk distribution pie chart */}
              <Grid size={12}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    height: 400,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Phân bố mức độ rủi ro sức khỏe
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.riskDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {data.riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} người dùng`, 'Số lượng']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
            Không có dữ liệu phân tích nào khả dụng.
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default Analytics; 