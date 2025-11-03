import { useToggle } from './use-toggle.hook';

/**
 * Hook for managing modal open/close state
 * Built on top of useToggle for consistency
 *
 * @returns Object with isModalOpen, openModal, and closeModal methods
 *
 * @example
 * const { isModalOpen, openModal, closeModal } = useModalState();
 */
export const useModalState = () => {
  const { value: isModalOpen, setTrue: openModal, setFalse: closeModal } = useToggle();

  return {
    isModalOpen,
    openModal,
    closeModal
  };
};
