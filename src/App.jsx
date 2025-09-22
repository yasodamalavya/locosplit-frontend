import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoginPage from './LoginPage.jsx';
import { getGroups, getFriends, deleteFriend, deleteGroup } from './api';
import './App.css';

function App() {
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [openGroups, setOpenGroups] = useState(true);
  const [openFriends, setOpenFriends] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check local storage for a logged-in user on initial load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchAllData = async () => {
    try {
      const [groupsData, friendsData] = await Promise.all([getGroups(), getFriends()]);
      setGroups(groupsData);
      setFriends(friendsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (user) {
        fetchAllData();
    }
  }, [user]);

  const handleDeleteFriend = async (id) => {
    try {
      if (window.confirm("Are you sure you want to delete this friend? This will fail if they have expenses.")) {
        await deleteFriend(id);
        fetchAllData(); 
      }
    } catch (error) {
      console.error('Error deleting friend:', error);
      alert('Failed to delete friend. They may be part of a group or have expenses.');
    }
  };

  const handleDeleteGroup = async (id) => {
    try {
      if (window.confirm("Are you sure you want to delete this group? All expenses will be lost.")) {
        await deleteGroup(id);
        fetchAllData(); 
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Failed to delete group. Check console for details.');
    }
  };
  
  const handleLoginSuccess = (loggedInUser) => {
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };
  
  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="homepage-container">
      <h1>My LocalSplit App</h1>
      <button onClick={handleLogout} className="button" style={{ position: 'absolute', top: '20px', right: '20px' }}>Logout</button>
      <Link to="/add-expense" className="button">Add a New Expense</Link>
      
      <div className="flex-sections">
        <div className="section-card">
          <div className="dropdown-header" onClick={() => setOpenGroups(!openGroups)}>
            <h2>Your Groups</h2>
          </div>
          <div className={`dropdown-content ${openGroups ? 'open' : ''}`}>
            {groups.length > 0 ? (
              <ul>
                {groups.map((group) => (
                  <li key={group.id} className="dropdown-item">
                    <Link to={`/groups/${group.id}`}>{group.name}</Link>
                    <button onClick={() => handleDeleteGroup(group.id)} className="delete-button">Delete</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No groups created yet.</p>
            )}
          </div>
        </div>

        <div className="section-card">
          <div className="dropdown-header" onClick={() => setOpenFriends(!openFriends)}>
            <h2>Your Friends</h2>
          </div>
          <div className={`dropdown-content ${openFriends ? 'open' : ''}`}>
            {friends.map((friend) => (
              <li key={friend.id} className="dropdown-item">
                <span>{friend.name}</span>
                <button onClick={() => handleDeleteFriend(friend.id)} className="delete-button">Delete</button>
              </li>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;