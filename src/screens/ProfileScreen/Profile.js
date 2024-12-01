import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        } else {
            navigate('/register');
        }
    }, [navigate]);

    if (!user) return null;

    return (
        <>
            <Header />
            <div className="profile-container">
                <div className="profile-content">
                    <h1 className="profile-title">Profile</h1>
                    
                    <div className="info-card">
                        <h2 className="info-label">Username</h2>
                        <p className="info-value">{user.username}</p>
                    </div>

                    <div className="info-card">
                        <h2 className="info-label">Email</h2>
                        <p className="info-value">{user.email}</p>
                    </div>

                    <div className="info-card">
                        <h2 className="info-label">Statistics</h2>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <p className="info-label">Tests Completed</p>
                                <p className="info-value">0</p>
                            </div>
                            <div className="stat-item">
                                <p className="info-label">Average WPM</p>
                                <p className="info-value">0</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;