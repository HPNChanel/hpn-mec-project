import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Collapse,
  Alert,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  TablePagination,
  Tooltip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../api/services';

// Define interfaces for our data structures
interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

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

const AdminPanel = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [userRecords, setUserRecords] = useState<Record<string, HealthRecord[]>>({});
  const [loadingRecords, setLoadingRecords] = useState<Record<string, boolean>>({});
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Dialog state management
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    confirmAction: () => {}
  });

  // Effect to check if user is admin
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  // Effect to fetch all users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await adminService.getAllUsers();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching users');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Pagination handlers
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Function to toggle user expansion and fetch their health records
  const toggleUserExpansion = async (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      return;
    }

    setExpandedUserId(userId);
    
    // If we already have the user's records, no need to fetch again
    if (userRecords[userId]) return;

    // Fetch user's health records
    setLoadingRecords(prev => ({ ...prev, [userId]: true }));
    
    try {
      const data = await adminService.getUserHealthRecords(userId);
      
      // Process data to ensure we have calculated BMI and formatted date
      const processedData = data.map((record: HealthRecord) => ({
        ...record,
        bmi: record.bmi || record.weight / Math.pow(record.height / 100, 2),
        date: new Date(record.date).toLocaleDateString()
      }));

      setUserRecords(prev => ({
        ...prev,
        [userId]: processedData
      }));
    } catch (err) {
      console.error(`Error fetching records for user ${userId}:`, err);
      setNotification({
        open: true,
        message: `Failed to load health records for this user: ${err instanceof Error ? err.message : 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setLoadingRecords(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Function to navigate to health record detail
  const viewHealthDetail = (recordId: string) => {
    navigate(`/health-detail/${recordId}`);
  };

  // Function to handle deleting a user
  const handleDeleteUser = (user: User) => {
    setConfirmDialog({
      open: true,
      title: 'Xác nhận xóa người dùng',
      message: `Bạn có chắc chắn muốn xóa người dùng ${user.name} (${user.email})? Hành động này không thể hoàn tác.`,
      confirmAction: () => deleteUser(user.id)
    });
  };

  // Function to perform the actual user deletion
  const deleteUser = async (userId: string) => {
    try {
      await adminService.deleteUser(userId);

      // Remove user from state
      setUsers(users.filter(user => user.id !== userId));
      
      // Remove any fetched records for this user
      const updatedRecords = { ...userRecords };
      delete updatedRecords[userId];
      setUserRecords(updatedRecords);
      
      setNotification({
        open: true,
        message: 'Xóa người dùng thành công',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting user:', err);
      setNotification({
        open: true,
        message: `Xóa người dùng thất bại: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`,
        severity: 'error'
      });
    } finally {
      setConfirmDialog(prev => ({ ...prev, open: false }));
    }
  };

  // Function to handle deleting a health record
  const handleDeleteRecord = (record: HealthRecord) => {
    setConfirmDialog({
      open: true,
      title: 'Xác nhận xóa bản ghi',
      message: `Bạn có chắc chắn muốn xóa bản ghi sức khỏe từ ${record.date}? Hành động này không thể hoàn tác.`,
      confirmAction: () => deleteHealthRecord(record.id, record.userId)
    });
  };

  // Function to perform the actual health record deletion
  const deleteHealthRecord = async (recordId: string, userId: string) => {
    try {
      await adminService.deleteHealthRecord(recordId);

      // Update the records in state
      setUserRecords(prev => ({
        ...prev,
        [userId]: prev[userId]?.filter(record => record.id !== recordId) || []
      }));
      
      setNotification({
        open: true,
        message: 'Xóa bản ghi sức khỏe thành công',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting health record:', err);
      setNotification({
        open: true,
        message: `Xóa bản ghi sức khỏe thất bại: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`,
        severity: 'error'
      });
    } finally {
      setConfirmDialog(prev => ({ ...prev, open: false }));
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Paginated users
  const paginatedUsers = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Quản lý người dùng
        </Typography>
        
        <Typography variant="body1" paragraph>
          Quản lý người dùng và hồ sơ sức khỏe của họ. Với tư cách quản trị viên, bạn có thể xem tất cả chi tiết người dùng và xóa bản ghi nếu cần.
        </Typography>

        {error ? (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        ) : loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : users.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
            Không tìm thấy người dùng nào trong hệ thống.
          </Alert>
        ) : (
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer>
              <Table stickyHeader aria-label="users table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: '5%' }}></TableCell>
                    <TableCell sx={{ width: '20%' }}>Tên</TableCell>
                    <TableCell sx={{ width: '25%' }}>Email</TableCell>
                    <TableCell sx={{ width: '15%' }}>Vai trò</TableCell>
                    <TableCell sx={{ width: '20%' }}>Ngày tham gia</TableCell>
                    <TableCell sx={{ width: '15%' }}>Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <React.Fragment key={user.id}>
                      <TableRow 
                        hover
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 },
                          backgroundColor: expandedUserId === user.id ? 'rgba(0, 0, 0, 0.04)' : 'inherit'
                        }}
                      >
                        <TableCell>
                          <IconButton 
                            aria-label="expand row" 
                            size="small" 
                            onClick={() => toggleUserExpansion(user.id)}
                            disabled={loadingRecords[user.id]}
                          >
                            {loadingRecords[user.id] ? (
                              <CircularProgress size={20} />
                            ) : expandedUserId === user.id ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon color="primary" fontSize="small" />
                            {user.name}
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Box sx={{ 
                            px: 1, 
                            py: 0.5, 
                            borderRadius: 1, 
                            display: 'inline-flex',
                            bgcolor: user.role === 'admin' ? 'primary.main' : 'info.main',
                            color: 'white',
                          }}>
                            {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                          </Box>
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>
                          <Tooltip title={user.role === 'admin' ? "Không thể xóa quản trị viên" : "Xóa người dùng"}>
                            <span>
                              <IconButton 
                                color="error" 
                                aria-label="delete" 
                                onClick={() => handleDeleteUser(user)}
                                disabled={user.role === 'admin'}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                      
                      {/* Expanded health records */}
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                          <Collapse in={expandedUserId === user.id} timeout="auto" unmountOnExit>
                            <Box sx={{ m: 2 }}>
                              <Typography variant="h6" gutterBottom component="div">
                                Hồ sơ sức khỏe của {user.name}
                              </Typography>
                              {userRecords[user.id]?.length > 0 ? (
                                <Table size="small" aria-label="health records">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Ngày</TableCell>
                                      <TableCell>Chiều cao (cm)</TableCell>
                                      <TableCell>Cân nặng (kg)</TableCell>
                                      <TableCell>BMI</TableCell>
                                      <TableCell>Nhịp tim (bpm)</TableCell>
                                      <TableCell>Huyết áp (mmHg)</TableCell>
                                      <TableCell>Hành động</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {userRecords[user.id]?.map((record) => (
                                      <TableRow key={record.id}>
                                        <TableCell>{record.date}</TableCell>
                                        <TableCell>{record.height}</TableCell>
                                        <TableCell>{record.weight}</TableCell>
                                        <TableCell>{record.bmi.toFixed(1)}</TableCell>
                                        <TableCell>{record.heartRate}</TableCell>
                                        <TableCell>{`${record.bloodPressureSystolic}/${record.bloodPressureDiastolic}`}</TableCell>
                                        <TableCell>
                                          <Tooltip title="Xem hồ sơ">
                                            <IconButton 
                                              size="small" 
                                              color="primary" 
                                              onClick={() => viewHealthDetail(record.id)}
                                            >
                                              <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                          </Tooltip>
                                          <Tooltip title="Xóa bản ghi">
                                            <IconButton 
                                              size="small" 
                                              color="error" 
                                              onClick={() => handleDeleteRecord(record)}
                                            >
                                              <DeleteIcon fontSize="small" />
                                            </IconButton>
                                          </Tooltip>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  Không tìm thấy hồ sơ sức khỏe nào cho người dùng này.
                                </Typography>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={users.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Số dòng mỗi trang:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
            />
          </Paper>
        )}
      </Box>
      
      {/* Notification Snackbar */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))} 
            color="primary"
          >
            Hủy
          </Button>
          <Button 
            onClick={() => confirmDialog.confirmAction()} 
            color="error" 
            variant="contained"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel; 