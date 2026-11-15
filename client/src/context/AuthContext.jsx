import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    // 1. Initial Load: Check if session cookie exists
    const checkAuth = async () => {
        try {
            const res = await api.get('/auth/me');
            if (res.success && res.data?.user) {
                setUser(res.data.user);
            } else {
                setUser(null);
                localStorage.removeItem('notifyhub_token');
            }
        } catch (err) {
            setUser(null);
            localStorage.removeItem('notifyhub_token');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    // 2. Login
    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            if (res.data?.token) {
                localStorage.setItem('notifyhub_token', res.data.token);
            }
            setUser(res.data.user);
            toast.success('Welcome back!', `Logged in as ${res.data.user.name}`);
            return res;
        } catch (err) {
            toast.error('Login Failed', err.message);
            throw err;
        }
    };

    // 3. Signup
    const signup = async (name, email, password) => {
        try {
            const res = await api.post('/auth/signup', { name, email, password });
            if (res.data?.token) {
                localStorage.setItem('notifyhub_token', res.data.token);
            }
            setUser(res.data.user);
            toast.success('Account Created!', `Welcome to NotifyHub, ${res.data.user.name}`);
            return res;
        } catch (err) {
            toast.error('Signup Failed', err.message);
            throw err;
        }
    };

    // 4. Logout
    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            // ignore network/cookie clear errors
        } finally {
            localStorage.removeItem('notifyhub_token');
            setUser(null);
            toast.info('Logged Out', 'You have been safely logged out.');
        }
    };

    // 5. Update Profile Name
    const updateProfile = async (name) => {
        try {
            const res = await api.patch('/auth/profile', { name });
            setUser(res.data.user);
            toast.success('Profile Updated', 'Your name has been updated.');
            return res.data.user;
        } catch (err) {
            toast.error('Update Failed', err.message);
            throw err;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                isAdmin: user?.role === 'admin',
                login,
                signup,
                logout,
                updateProfile,
                refreshUser: checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};