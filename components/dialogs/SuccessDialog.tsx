import React from 'react';
import { CheckCircle } from 'lucide-react-native';
import Dialog from './Dialog';
import Colors from '@/constants/colors';

interface SuccessDialogProps {
  visible: boolean;
  title?: string;
  message: string;
  buttonText?: string;
  buttonAction?: () => void;
  onClose: () => void;
}

const SuccessDialog: React.FC<SuccessDialogProps> = ({
  visible,
  title = 'Success',
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
      icon={<CheckCircle size={32} color={Colors.success} />}
      buttonText={buttonText}
      buttonAction={buttonAction}
      onClose={onClose}
      type="success"
    />
  );
};

export default SuccessDialog;
