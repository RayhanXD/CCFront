import React from 'react';
import { AlertCircle } from 'lucide-react-native';
import Dialog from './Dialog';
import Colors from '@/constants/colors';

interface ErrorDialogProps {
  visible: boolean;
  title?: string;
  message: string;
  buttonText?: string;
  buttonAction?: () => void;
  onClose: () => void;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({
  visible,
  title = 'Error',
  message,
  buttonText = 'OK',
  buttonAction,
  onClose,
}) => {
  return (
    <Dialog
      visible={visible}
      title={title}
      message={message}
      icon={<AlertCircle size={32} color={Colors.error} />}
      buttonText={buttonText}
      buttonAction={buttonAction}
      onClose={onClose}
      type="error"
    />
  );
};

export default ErrorDialog;
