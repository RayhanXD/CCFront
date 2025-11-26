import React from 'react';
import { InfoIcon as Info } from '@/components/icons';
import Dialog from './Dialog';
import Colors from '@/constants/colors';

interface InfoDialogProps {
  visible: boolean;
  title?: string;
  message: string;
  buttonText?: string;
  buttonAction?: () => void;
  onClose: () => void;
}

const InfoDialog: React.FC<InfoDialogProps> = ({
  visible,
  title = 'Information',
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
      icon={<Info size={32} color={Colors.info} />}
      buttonText={buttonText}
      buttonAction={buttonAction}
      onClose={onClose}
      type="info"
    />
  );
};

export default InfoDialog;
