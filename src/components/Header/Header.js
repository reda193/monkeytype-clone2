import React, { useState, useEffect} from 'react';
import { FaRegUser, FaCrown, FaInfo, FaSignOutAlt } from "react-icons/fa";
import { IoMdSettings } from 'react-icons/io';
import styles from './Header.module.css';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleNavigation = (path) => {
        navigate(path);
        setShowDropdown(false);
    };
    const handleLogoClick = (path) => {
        navigate(path);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
    };
    return (
        <div className={styles.header}>
            <div className={styles.leftheader}>
                <h1
                    onClick={() => handleNavigation('/')}
                    className={styles.logo}
                >
                    KusaTypes
                </h1>
                <IoMdSettings className={styles.icon} />
                <FaCrown className={styles.icon} />
                <FaInfo className={styles.icon} />

            </div>
            <div className={styles.rightheader}>
            {user ? (
                    <>
                        <div 
                            className="user-profile"
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            <FaRegUser className="icon" />
                            <span>{user.username}</span>
                        </div>
                        
                        <div className={`dropdown ${showDropdown ? 'show' : ''}`}>
                            <button onClick={() => handleNavigation('/profile')}>
                                Profile
                            </button>
                            <button onClick={handleLogout} className="sign-out-btn">
                                <FaSignOutAlt /> Sign Out
                            </button>
                        </div>
                    </>
                ) : (
                    <FaRegUser 
                        className="icon"
                        onClick={() => handleNavigation('/register')}
                    />
                )}
            </div>
        </div>

    );
};

export default Header;