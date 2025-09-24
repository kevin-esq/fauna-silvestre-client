import { createContext, useContext, useState } from 'react';

type APIStatus =
  | 'BOOTING'
  | 'UNAUTHENTICATED'
  | 'AUTHENTICATING'
  | 'AUTHENTICATED'
  | 'ERROR';

type APIStatusContextType = {
  status: APIStatus;
  setStatus: (status: APIStatus) => void;
};

const APIStatusContext = createContext<APIStatusContextType | null>(null);

export const APIStatusProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [status, setStatus] = useState<APIStatus>('BOOTING');

  return (
    <APIStatusContext.Provider value={{ status, setStatus }}>
      {children}
    </APIStatusContext.Provider>
  );
};

export const useApiStatus = () => {
  const context = useContext(APIStatusContext);
  if (!context) {
    throw new Error('useApiStatus must be used within an APIStatusProvider');
  }
  return context;
};
