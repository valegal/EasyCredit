import React, { useState, ChangeEvent, useEffect } from 'react';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { getStorage, ref, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';

const theme = createTheme();

const styles = {
  inputFileButton: {
    backgroundColor: '#a4e786',
    color: '#131338',
    '&:hover': {
      backgroundColor: '#131338',
      color: '#a4e786',
    },
    display: 'flex',
    alignItems: 'center',
    width: '250px', // Adjust the width as needed
  },
};

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const InputFileUpload = ({ onPdfLoad }: { onPdfLoad: (pdfContent: string) => void }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileUploaded, setFileUploaded] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [uniqueFileName, setUniqueFileName] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];

    if (file) {
      // Verificar si es un archivo PDF
      if (file.type === 'application/pdf') {
        if (file.size <= 2 * 1024 * 1024) {
          // Generar un nombre de archivo único
          const uniqueFileName = `${Date.now()}_${file.name}`;
          setSelectedFile(file);
          setFileUploaded(null); 
          setUniqueFileName(uniqueFileName); 
        } else {
        
          showSnackbar('El tamaño del archivo debe ser menor o igual a 2MB.');
        }
      } else {
        showSnackbar('Solo se permiten archivos PDF.');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uniqueFileName) {
      return;
    }

    try {
      setUploading(true);

      const storage = getStorage();
      const storageRef = ref(storage, uniqueFileName);
      await uploadBytes(storageRef, selectedFile);

      onPdfLoad(`Archivo cargado: ${uniqueFileName}`);
      setFileUploaded(uniqueFileName);

      showSnackbar('Archivo cargado exitosamente', 'success');
    } catch (error) {
      console.error('Error uploading file:', error);
      showSnackbar('Error al cargar el archivo', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = async () => {
    if (fileUploaded) {
      const storage = getStorage();
      const fileRef = ref(storage, fileUploaded);

      try {
        // Verificar si el archivo existe antes de intentar eliminarlo
        await getDownloadURL(fileRef);

        console.log('Intentando eliminar el archivo:', fileUploaded);
        await deleteObject(fileRef);

        // Limpiar el estado
        setSelectedFile(null);
        setFileUploaded(null);
        onPdfLoad('');
        showSnackbar('Archivo eliminado exitosamente', 'success');
      } catch (error) {
        console.error('Error deleting file:', error);
        showSnackbar('Error al eliminar el archivo', 'error');
      }
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'error') => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    if (selectedFile) {
      handleUpload();
    }
  }, [selectedFile]);

  return (
    <ThemeProvider theme={theme}>
      <div>
        <Button
          component="label"
          variant="contained"
          startIcon={<CloudUploadIcon />}
          sx={styles.inputFileButton}
          disabled={uploading}
        >
          {uploading ? 'Cargando...' : 'Cargar cédula (pdf)'}
          <VisuallyHiddenInput type="file" accept=".pdf" onChange={handleFileChange} />
        </Button>
        <p style={{ fontSize: '0.8rem', color: '#6b7280', textAlign: 'center', marginTop: '0.5rem' }}>
  (Este campo es opcional)
</p>
        {fileUploaded && (
          <div>
            ✅ {fileUploaded}
            <Button onClick={handleRemoveFile}>Eliminar Archivo</Button>
          </div>
        )}

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            onClose={handleCloseSnackbar}
            severity={snackbarMessage.includes('exitosamente') ? 'success' : 'warning'}
          >
            {snackbarMessage}
          </MuiAlert>
        </Snackbar>
      </div>
    </ThemeProvider>
  );
};

export default InputFileUpload;
