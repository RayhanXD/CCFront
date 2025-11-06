import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SuccessDialog, ErrorDialog, InfoDialog, WarningDialog } from '@/components/dialogs';

interface DialogOptions {
  title?: string;
  message: string;
  buttonText?: string;
  onClose?: () => void;
  buttonAction?: () => void;
}

interface WarningDialogOptions extends DialogOptions {
  secondaryButtonText?: string;
  secondaryButtonAction?: () => void;
}

interface DialogContextType {
  showSuccess: (options: DialogOptions) => void;
  showError: (options: DialogOptions) => void;
  showInfo: (options: DialogOptions) => void;
  showWarning: (options: WarningDialogOptions) => void;
  hideSuccess: () => void;
  hideError: () => void;
  hideInfo: () => void;
  hideWarning: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

interface DialogProviderProps {
  children: ReactNode;
}

export const DialogProvider: React.FC<DialogProviderProps> = ({ children }) => {
  const [successDialogState, setSuccessDialogState] = useState({
    visible: false,
    title: 'Success',
    message: '',
    buttonText: 'OK',
    onClose: () => hideSuccess(),
    buttonAction: undefined as (() => void) | undefined,
  });

  const [errorDialogState, setErrorDialogState] = useState({
    visible: false,
    title: 'Error',
    message: '',
    buttonText: 'OK',
    onClose: () => hideError(),
    buttonAction: undefined as (() => void) | undefined,
  });
  
  const [infoDialogState, setInfoDialogState] = useState({
    visible: false,
    title: 'Information',
    message: '',
    buttonText: 'OK',
    onClose: () => hideInfo(),
    buttonAction: undefined as (() => void) | undefined,
  });
  
  const [warningDialogState, setWarningDialogState] = useState({
    visible: false,
    title: 'Warning',
    message: '',
    buttonText: 'OK',
    onClose: () => hideWarning(),
    buttonAction: undefined as (() => void) | undefined,
    secondaryButtonText: undefined as string | undefined,
    secondaryButtonAction: undefined as (() => void) | undefined,
  });

  const showSuccess = ({
    title = 'Success',
    message,
    buttonText = 'OK',
    onClose,
    buttonAction,
  }: DialogOptions) => {
    setSuccessDialogState({
      visible: true,
      title,
      message,
      buttonText,
      onClose: () => {
        if (onClose) onClose();
        hideSuccess();
      },
      buttonAction: buttonAction ? () => {
        if (buttonAction) buttonAction();
        hideSuccess();
      } : undefined,
    });
  };

  const hideSuccess = () => {
    setSuccessDialogState((prev) => ({ ...prev, visible: false }));
  };

  const showError = ({
    title = 'Error',
    message,
    buttonText = 'OK',
    onClose,
    buttonAction,
  }: DialogOptions) => {
    setErrorDialogState({
      visible: true,
      title,
      message,
      buttonText,
      onClose: () => {
        if (onClose) onClose();
        hideError();
      },
      buttonAction: buttonAction ? () => {
        if (buttonAction) buttonAction();
        hideError();
      } : undefined,
    });
  };

  const hideError = () => {
    setErrorDialogState((prev) => ({ ...prev, visible: false }));
  };
  
  const showInfo = ({
    title = 'Information',
    message,
    buttonText = 'OK',
    onClose,
    buttonAction,
  }: DialogOptions) => {
    setInfoDialogState({
      visible: true,
      title,
      message,
      buttonText,
      onClose: () => {
        if (onClose) onClose();
        hideInfo();
      },
      buttonAction: buttonAction ? () => {
        if (buttonAction) buttonAction();
        hideInfo();
      } : undefined,
    });
  };

  const hideInfo = () => {
    setInfoDialogState((prev) => ({ ...prev, visible: false }));
  };
  
  const showWarning = ({
    title = 'Warning',
    message,
    buttonText = 'OK',
    onClose,
    buttonAction,
    secondaryButtonText,
    secondaryButtonAction,
  }: WarningDialogOptions) => {
    setWarningDialogState({
      visible: true,
      title,
      message,
      buttonText,
      onClose: () => {
        if (onClose) onClose();
        hideWarning();
      },
      buttonAction: buttonAction ? () => {
        if (buttonAction) buttonAction();
        hideWarning();
      } : undefined,
      secondaryButtonText,
      secondaryButtonAction: secondaryButtonAction ? () => {
        if (secondaryButtonAction) secondaryButtonAction();
        hideWarning();
      } : undefined,
    });
  };

  const hideWarning = () => {
    setWarningDialogState((prev) => ({ ...prev, visible: false }));
  };

  return (
    <DialogContext.Provider
      value={{
        showSuccess,
        showError,
        showInfo,
        showWarning,
        hideSuccess,
        hideError,
        hideInfo,
        hideWarning,
      }}
    >
      {children}
      <SuccessDialog
        visible={successDialogState.visible}
        title={successDialogState.title}
        message={successDialogState.message}
        buttonText={successDialogState.buttonText}
        onClose={successDialogState.onClose}
        buttonAction={successDialogState.buttonAction}
      />
      <ErrorDialog
        visible={errorDialogState.visible}
        title={errorDialogState.title}
        message={errorDialogState.message}
        buttonText={errorDialogState.buttonText}
        onClose={errorDialogState.onClose}
        buttonAction={errorDialogState.buttonAction}
      />
      <InfoDialog
        visible={infoDialogState.visible}
        title={infoDialogState.title}
        message={infoDialogState.message}
        buttonText={infoDialogState.buttonText}
        onClose={infoDialogState.onClose}
        buttonAction={infoDialogState.buttonAction}
      />
      <WarningDialog
        visible={warningDialogState.visible}
        title={warningDialogState.title}
        message={warningDialogState.message}
        buttonText={warningDialogState.buttonText}
        onClose={warningDialogState.onClose}
        buttonAction={warningDialogState.buttonAction}
        secondaryButtonText={warningDialogState.secondaryButtonText}
        secondaryButtonAction={warningDialogState.secondaryButtonAction}
      />
    </DialogContext.Provider>
  );
};
