import { Navigate } from 'react-router-dom';
import { getStoredCreds } from '../utils/auth';

const RequireAuth = ({ children }: { children: JSX.Element }) => {
    const creds = getStoredCreds();
    return creds ? children : <Navigate to="/login" replace />;
};

export default RequireAuth;