import { useRef, useState, useEffect } from "react";
import { faCheck, faTimes, faInfoCircle, faInfo, faC } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from 'react-router-dom';

import './Register.css'
import axios from "../../api/axios";
import Header from "../../components/Header/Header";
// Start with lower case or upercase letter, must follow with any characters or numbers and hypens or underscoreds with a range of [4,24]
const USER_REGEX = /^[a-zA-Z][a-zA-Z0-9-_]{3,23}$/;

// Password must contain one lower case letter, one upper case letter, one digit and one symbol from 8-24 symbols
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

// Email must contain name, and extnesion
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

const REGISTER_URL = '/register';

const Register = () => {
    const navigate = useNavigate();

    const userRef = useRef();
    const errRef = useRef();

    const [user, setUser] = useState('');
    const [validName, setValidName] = useState(false);
    const [userFocus, setUserFocus] = useState(false);

    const [email, setEmail] = useState('');
    const [validEmail, setValidEmail] = useState(false);
    const [emailFocus, setEmailFocus] = useState(false);

    const [matchEmail, setMatchEmail] = useState('');
    const [validEmailMatch, setValidEmailMatch] = useState(false);
    const [matchEmailFocus, setMatchEmailFocus] = useState(false);

    const [pwd, setPwd] = useState('');
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    const [matchPwd, setMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        userRef.current.focus();
    }, [])

    useEffect(() => {
        const result = USER_REGEX.test(user);
        console.log(result);
        console.log(user);
        setValidName(result);
    }, [user])

    useEffect(() => {
        const result = PWD_REGEX.test(pwd);
        console.log(result);
        console.log(pwd)
        setValidPwd(result);
        const match = pwd === matchPwd;
        setValidMatch(match);
    }, [pwd, matchPwd])

    useEffect(() => {
        const result = EMAIL_REGEX.test(email);
        console.log(result);
        console.log(email);
        setValidEmail(result)
        const match = email === matchEmail;
        setValidEmailMatch(match);
    }, [email, matchEmailFocus])

    useEffect(() => {
        setErrMsg('');
    }, [user, pwd, matchPwd, email, matchEmail])

    const handleSubmit = async (e) => {
        e.preventDefault();
        const v1 = USER_REGEX.test(user);
        const v2 = PWD_REGEX.test(pwd);
        const v3 = EMAIL_REGEX.test(email);
        if (!v1 || !v2 || !v3) {
            setErrMsg("Invalid Entry");
            return;
        }
        try {
            const response = await axios.post(REGISTER_URL,
                JSON.stringify({ user, email, pwd }), 
                {
                    headers: { 'Content-Type': 'application/json'},
                    withCredentials: true
                }
            );
            console.log(response.data);
            console.log(response.accessToken);
            console.log(JSON.stringify(response))
            setSuccess(true);
            localStorage.setItem('user', JSON.stringify({
                username: user,
                email: email,
                isLoggedIn: true
            }));
            setTimeout(() => {
                navigate('/');
            })
            // clear input fields
        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 409) {
                setErrMsg('Username Taken')
            } else {
                setErrMsg('Registration Failed');
            }
            errRef.current.focus();
        }
    }

    return (
        <>
        <Header/>
        <div className='register'>
            
        {success ? (
                <section>
                    <h1>Successs!</h1>
                    <p>
                        <a href="#">Sign In</a>
                    </p>
                </section>
        ) : (
        <section>
            <p ref={errRef} className={errMsg ? "errMsg" : 
                "offscreen"} aria-live="assertive">
                {errMsg}
            </p>
            
            <h1 className="registerheader">Register</h1>
            <form onSubmit={handleSubmit}>
            <div className="username">
                <label htmlFor="username">
                    Username:
                    <span className={validName ? "valid" : "hide"}>
                        <FontAwesomeIcon icon={faCheck} />
                    </span>
                    <span  className={validName || !user ? "hide": "invalid"}>
                        <FontAwesomeIcon icon={faTimes} />
                    </span>
                </label>
                
                <input
                    type="text"
                    id="username"
                    ref={userRef}
                    autoComplete = "off"
                    onChange = {(e) => setUser(e.target.value)}
                    required
                    aria-invalid={validName ? "false": "true"}
                    aria-describedby = "uidnote"
                    onFocus = {() => setUserFocus(true)}
                    onBlur = {() => setUserFocus(false)}
                />
                <p id="uidnote" className={userFocus && user && 
                    !validName ? "instructions": "offscreen"}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    4 to 24 characters. <br />
                    Must begin with a letter. <br />
                    Letters, numbers, underscores, hypens allowed.
                </p>
                </div>
                <div className="emailclass">
                <label htmlFor="email">
                    Email:
                    <span className={validEmail ? "valid" : "hide"}>
                        <FontAwesomeIcon icon={faCheck} />
                    </span>
                    <span className={validEmail || !email ? "hide" : "invalid"}>
                        <FontAwesomeIcon icon={faTimes} />
                    </span>
                </label>
                <input
                    type="text"
                    id="email"
                    onChange = {(e) => setEmail(e.target.value)}
                    required
                    aria-invalid={validName ? "false": "true"}
                    aria-describedby = "uidnote"
                    onFocus = {() => setEmailFocus(true)}
                    onBlur={() => setEmailFocus(false)}
                />
                <p id="emailnote" className={emailFocus && !validEmail ? "instructions" : "offscreen"}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    Enter a valid email. 
                </p>
                </div>
                <div className='confirmemailclass'>
                <label htmlFor="confirm_email">
                    Confirm Email:
                    <span className={validEmailMatch ? "valid" : "hide"}>
                        <FontAwesomeIcon icon={faCheck} />
                    </span>
                    <span className={validEmailMatch || !matchEmail ? "hide" : "invalid"}>
                        <FontAwesomeIcon icon={faTimes} />
                    </span>
                </label>
                
                <input 
                    type="text"
                    id="confirm_email"
                    onChange={(e) => setMatchEmail(e.target.value)}
                    required
                    aria-invalid={validEmailMatch ? "false": "true"}
                    aria-describedby="confirmnote"
                    onFocus = {() => setMatchEmailFocus(true)}
                    onBlur={() => setMatchEmailFocus(false)}
                />
                <p id="confirmnote" className={matchEmailFocus && !validEmailMatch ? "instructions" : "offscreen"}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    Emails much match.
                </p>
                </div>
                <div className="password">
                <label htmlFor="password">
                    Password:
                    <span className={validPwd ? "valid" : "hide"}>
                        <FontAwesomeIcon icon={faCheck} />
                    </span>
                    <span  className={validPwd || !pwd ? "hide": "invalid"}>
                        <FontAwesomeIcon icon={faTimes} />
                    </span>
                </label>
                <input
                    type="password"
                    id="password"
                    onChange = {(e) => setPwd(e.target.value)}
                    required
                    aria-invalid={validName ? "false": "true"}
                    aria-describedby = "pwdnote"
                    onFocus = {() => setPwdFocus(true)}
                    onBlur = {() => setPwdFocus(false)}
                />
                <p id="pwdnote" className={pwdFocus && !validPwd ? "instructions" : "offscreen"}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    8 to 24 characters. <br />
                    Must include uppercase and lowercase letters, a number, and a special character. <br />
                    Allowed special characters: <span aria-label="exclamation mark">!</span> <span aria-label="at symbol">@</span> <span aria-label="hashtag">#</span>
                    <span aria-label="dollar sign">$</span> <span aria-label="percent">%</span>
                </p>
                </div>
                <div className='confirmpassword'>
                <label htmlFor="confirm_pwd">
                    Confirm Password:
                    <span className={validMatch ? "valid" : "hide"}>
                        <FontAwesomeIcon icon={faCheck} />
                    </span>
                    <span  className={validMatch || !matchPwd ? "hide": "invalid"}>
                        <FontAwesomeIcon icon={faTimes} />
                    </span>
                </label>
                <input
                    type="password"
                    id="confirm_pwd"
                    onChange = {(e) => setMatchPwd(e.target.value)}
                    required
                    aria-invalid={validMatch ? "false": "true"}
                    aria-describedby = "confirmnote"
                    onFocus = {() => setMatchFocus(true)}
                    onBlur = {() => setMatchFocus(false)}
                />
       
                <p id="confirmnote" className={matchFocus && !validMatch ? "instructions" : "offscreen"}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    Must match the first password input field.
                </p>
                </div>
                <button disabled={!validName || !validPwd || !validMatch ? true: false}>
                    Sign Up
                </button>
                <p>
                    Already Registered? <br />
                    <span className="line">
                        {/*put registed link here*/}
                        Sign In
                    </span>
                </p>
            </form>
        </section>
        )}
        </div>
        </>
    ) 
}

export default Register