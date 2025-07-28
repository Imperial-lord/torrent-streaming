import { useState, useRef, useEffect } from 'react';
import { User } from 'lucide-react';
import { clearCreds, sendCredsToSW } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

const ProfileMenu = () => {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // close when clicking outside
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    const handleLogout = () => {
        clearCreds();
        sendCredsToSW();           // wipe SW auth too
        navigate('/login', { replace: true });
    };

    return (
        <div className="relative" ref={menuRef}>
            <Button onClick={() => setOpen(o => !o)}
                size="icon" variant="ghost" className="text-muted-foreground hover:text-primary">
                <User className="h-5 w-5" />
            </Button>

            {open && (
                <div className="absolute right-0 mt-2 w-40 bg-zinc-800 rounded shadow-lg overflow-hidden z-10">
                    <Button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 hover:bg-zinc-700 text-white"
                    >
                        Logout
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ProfileMenu;