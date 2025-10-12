import React from 'react';
import { AlertTriangle } from 'lucide-react-native';
import Dialog from './Dialog';
import Colors from '@/constants/colors';

interface WarningDialogProps {
  visible: boolean;
  title?: string;
  message: string;
  buttonText?: string;
  buttonAction?: () => void;
  onClose: () => void;
  secondaryButtonText?: string;
  secondaryButtonAction?: () => void;
}

const WarningDialog: React.FC<WarningDialogProps> = ({
  visible,
  title = 'Warning',
  message,
  buttonText = 'OK',
  buttonAction,
  onClose,
  secondaryButtonText,
  secondaryButtonAction,
}) => {
  return (
    <Dialog
      visible={visible}
      title={title}
      message={message}
      icon={<AlertTriangle size={32} color={Colors.warning} />}
      buttonText={buttonText}
      buttonAction={buttonAction}
      onClose={onClose}
      type="warning"
      secondaryButtonText={secondaryButtonText}
      secondaryButtonAction={secondaryButtonAction}
    />
  );
};

export default WarningDialog;
