import { PropsWithChildren } from 'react';
import { Modal as RNModal, View } from 'react-native';

interface ModalProps extends PropsWithChildren {
  visible: boolean;
}

export function Modal({ visible, children }: ModalProps) {
  return (
    <RNModal visible={visible} transparent animationType='slide'>
      <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>{children}</View>
    </RNModal>
  );
}
