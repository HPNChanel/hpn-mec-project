import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
  InputAdornment,
  FormHelperText
} from '@mui/material';
import { healthRecordsService } from '../../api/services';

interface FormValues {
  height: string;
  weight: string;
  heartRate: string;
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  symptoms: string;
}

interface FormErrors {
  height?: string;
  weight?: string;
  heartRate?: string;
  bloodPressureSystolic?: string;
  bloodPressureDiastolic?: string;
}

const HealthForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Form values
  const [formValues, setFormValues] = useState<FormValues>({
    height: '',
    weight: '',
    heartRate: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    symptoms: ''
  });
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
    
    // Clear error when user types
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined
      });
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;
    
    // Height validation (in cm, typically 50-250 cm)
    if (!formValues.height) {
      errors.height = 'Height is required';
      isValid = false;
    } else {
      const height = parseFloat(formValues.height);
      if (isNaN(height) || height < 50 || height > 250) {
        errors.height = 'Please enter a valid height (50-250 cm)';
        isValid = false;
      }
    }
    
    // Weight validation (in kg, typically 3-500 kg)
    if (!formValues.weight) {
      errors.weight = 'Weight is required';
      isValid = false;
    } else {
      const weight = parseFloat(formValues.weight);
      if (isNaN(weight) || weight < 3 || weight > 500) {
        errors.weight = 'Please enter a valid weight (3-500 kg)';
        isValid = false;
      }
    }
    
    // Heart rate validation (typically 30-220 bpm)
    if (!formValues.heartRate) {
      errors.heartRate = 'Heart rate is required';
      isValid = false;
    } else {
      const heartRate = parseInt(formValues.heartRate, 10);
      if (isNaN(heartRate) || heartRate < 30 || heartRate > 220) {
        errors.heartRate = 'Please enter a valid heart rate (30-220 bpm)';
        isValid = false;
      }
    }
    
    // Blood pressure validation
    if (!formValues.bloodPressureSystolic) {
      errors.bloodPressureSystolic = 'Systolic pressure is required';
      isValid = false;
    } else {
      const systolic = parseInt(formValues.bloodPressureSystolic, 10);
      if (isNaN(systolic) || systolic < 70 || systolic > 250) {
        errors.bloodPressureSystolic = 'Please enter a valid systolic pressure (70-250 mmHg)';
        isValid = false;
      }
    }
    
    if (!formValues.bloodPressureDiastolic) {
      errors.bloodPressureDiastolic = 'Diastolic pressure is required';
      isValid = false;
    } else {
      const diastolic = parseInt(formValues.bloodPressureDiastolic, 10);
      if (isNaN(diastolic) || diastolic < 40 || diastolic > 150) {
        errors.bloodPressureDiastolic = 'Please enter a valid diastolic pressure (40-150 mmHg)';
        isValid = false;
      }
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await healthRecordsService.create({
        height: parseFloat(formValues.height),
        weight: parseFloat(formValues.weight),
        heartRate: parseInt(formValues.heartRate, 10),
        bloodPressureSystolic: parseInt(formValues.bloodPressureSystolic, 10),
        bloodPressureDiastolic: parseInt(formValues.bloodPressureDiastolic, 10),
        symptoms: formValues.symptoms || undefined
      });
      
      setSuccess(true);
      
      // Clear form after successful submission
      setFormValues({
        height: '',
        weight: '',
        heartRate: '',
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        symptoms: ''
      });
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving your health record');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSuccess(false);
  };
  
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Health Record Form
        </Typography>
        
        <Typography variant="body1" paragraph>
          Please enter your current health measurements. All fields marked with * are required.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                label="Height"
                name="height"
                value={formValues.height}
                onChange={handleChange}
                error={!!formErrors.height}
                helperText={formErrors.height}
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                }}
              />
              {!formErrors.height && (
                <FormHelperText>Enter your height in centimeters</FormHelperText>
              )}
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                label="Weight"
                name="weight"
                value={formValues.weight}
                onChange={handleChange}
                error={!!formErrors.weight}
                helperText={formErrors.weight}
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                }}
              />
              {!formErrors.weight && (
                <FormHelperText>Enter your weight in kilograms</FormHelperText>
              )}
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                label="Heart Rate"
                name="heartRate"
                value={formValues.heartRate}
                onChange={handleChange}
                error={!!formErrors.heartRate}
                helperText={formErrors.heartRate}
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">bpm</InputAdornment>,
                }}
              />
              {!formErrors.heartRate && (
                <FormHelperText>Enter your heart rate in beats per minute</FormHelperText>
              )}
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" gutterBottom>
                Blood Pressure*
              </Typography>
              <Grid container spacing={1}>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    required
                    label="Systolic"
                    name="bloodPressureSystolic"
                    value={formValues.bloodPressureSystolic}
                    onChange={handleChange}
                    error={!!formErrors.bloodPressureSystolic}
                    helperText={formErrors.bloodPressureSystolic}
                    type="number"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">mmHg</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    required
                    label="Diastolic"
                    name="bloodPressureDiastolic"
                    value={formValues.bloodPressureDiastolic}
                    onChange={handleChange}
                    error={!!formErrors.bloodPressureDiastolic}
                    helperText={formErrors.bloodPressureDiastolic}
                    type="number"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">mmHg</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>
              {!formErrors.bloodPressureSystolic && !formErrors.bloodPressureDiastolic && (
                <FormHelperText>Enter your blood pressure (e.g., 120/80 mmHg)</FormHelperText>
              )}
            </Grid>
            
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Symptoms (Optional)"
                name="symptoms"
                value={formValues.symptoms}
                onChange={handleChange}
                placeholder="Describe any symptoms or notes about your health condition"
              />
            </Grid>
            
            <Grid size={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? 'Saving...' : 'Save Health Record'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Health record saved successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default HealthForm; 