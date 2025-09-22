import { useState } from 'react';
import axios from 'axios';
import './App.css';

function LoginPage({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8081/api/login', { username, password });
            if (response.status === 200) {
                onLoginSuccess(response.data);
            }
        } catch (error) {
            alert('Login failed. Check your credentials.');
            console.error('Login error:', error);
        }
    };

    return (
        <div className="add-expense-container">
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Username:</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="form-control" />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="form-control" />
                </div>
                <button type="submit" className="button">Login</button>
            </form>
        </div>
    );
}

export default LoginPage;