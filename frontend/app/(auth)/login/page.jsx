'use client'

import React,{useState} from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/axios'

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email || !password) {
            setError('Email and password are required');
            setLoading(false);
            return;
        }

        try {
            const res = await api.post('/api/auth/login', { email, password });
            
            if (res.status === 200) {
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    }
  return (
    <div className='flex min-h-screen items-center justify-center bg-zinc-50 p-4'>
        <div className='w-full max-w-md bg-white p-6 sm:p-8 rounded shadow'>
            <h1 className='text-xl sm:text-2xl font-bold mb-6 text-center'>Login</h1>
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <input 
                    type="email" 
                    placeholder='Email' 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className='border p-2 sm:p-2.5 rounded text-sm sm:text-base'
                />
                <input 
                    type="password" 
                    placeholder='Password' 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className='border p-2 sm:p-2.5 rounded text-sm sm:text-base'
                />
                {error && <p className='text-red-500 text-xs sm:text-sm'>{error}</p>}
                <button 
                    type='submit' 
                    disabled={loading}
                    className='bg-blue-500 text-white p-2.5 sm:p-3 rounded hover:bg-blue-600 text-sm sm:text-base'
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <div className='mt-4 text-center text-xs sm:text-sm'>
                Don&apos;t have an account? <Link href="/register" className='text-blue-500 hover:underline'>Register</Link>
            </div>
        </div>
    </div>
  )
}

export default Login