import React from 'react';
import { DeliverableUploadModal } from '../../common/DeliverableUploadModal';

interface CompanyResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (
    title: string,
    desc: string,
    fileType: string,
    fileSize: string,
    fileUrl?: string,
    fileName?: string,
    externalLink?: string
  ) => void;
}

export const CompanyResourceModal: React.FC<CompanyResourceModalProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  return (
    <DeliverableUploadModal
      isOpen={isOpen}
      onClose={onClose}
      onUpload={onUpload}
      modalTitle="Upload Deliverable or Report"
      themeColor="blue"
      submitButtonText="Upload Deliverable"
    />
  );
};
