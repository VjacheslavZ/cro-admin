import { Box, Button, Typography, Container, Paper } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export function LoginPage() {
  const { t } = useTranslation();

  const handleGoogleLogin = () => {
    // TODO: Integrate with Google OAuth — admin must have role=ADMIN
    console.log('Google login clicked — admin auth');
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            {t('auth.welcome')}
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              fullWidth
            >
              {t('auth.signInWithGoogle')}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
