// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { sendCredsToSW, setCreds } from '../utils/auth';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const encoded = btoa(`${username}:${password}`);
            await axios.get('/auth/check', {
                headers: { Authorization: `Basic ${encoded}` },
            });
            setCreds(username, password);
            sendCredsToSW();
            navigate('/');
        } catch {
            setError('Invalid username or password');
        }
    };

    return (
        <div
            className="relative min-h-screen bg-cover bg-center"
            style={{ backgroundImage: "url('/assets/wallpaper.png')" }}
        >
            {/* dark gradient overlay */}
            <div className="absolute inset-0 bg-black/70"></div>

            <div className="relative flex items-center justify-center min-h-screen px-4">
                <form
                    onSubmit={handleSubmit}
                    className="bg-black/80 backdrop-blur-sm p-10 w-full max-w-md rounded-lg shadow-2xl"
                >
                    {/* dionysus logo */}
                    <img
                        src="/assets/voya.svg"
                        alt="Dionysus"
                        className="h-12 mx-auto mb-8"
                    />

                    <h2 className="text-3xl font-semibold text-white mb-6 text-left">
                        Sign In
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full px-4 py-3 rounded bg-zinc-800 text-white placeholder-zinc-500 
                           focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded bg-zinc-800 text-white placeholder-zinc-500 
                           focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-center text-red-500 text-sm mt-4">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="mt-6 w-full py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 
                       font-medium text-lg rounded transition-colors"
                    >
                        Sign In
                    </button>

                    <p className="mt-6 text-zinc-400 text-center text-sm">
                        New to Voya?{' '}
                        <a href="#" className="text-white hover:underline">
                            Sign up now
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;