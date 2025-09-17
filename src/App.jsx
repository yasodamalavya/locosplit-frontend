import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getGroups, getFriends, deleteFriend, deleteGroup } from './api'; // <-- Import delete functions
import './App.css';

function App() {
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);

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
    fetchAllData();
  }, []);

  const handleDeleteFriend = async (id) => {
    try {
      if (window.confirm("Are you sure you want to delete this friend? This will fail if they have expenses.")) {
        await deleteFriend(id);
        fetchAllData(); // Re-fetch to update the UI
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
        fetchAllData(); // Re-fetch to update the UI
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Failed to delete group. Check console for details.');
    }
  };

  return (
    <div className="container">
      <h1>My LocalSplit App</h1>
      <Link to="/add-expense" className="button">Add a New Expense</Link>
      
      <div className="section">
        <h2>Your Groups</h2>
        {groups.length > 0 ? (
          <ul>
            {groups.map((group) => (
              <li key={group.id}>
                <Link to={`/groups/${group.id}`}>{group.name}</Link>
                <button onClick={() => handleDeleteGroup(group.id)} className="delete-button">Delete</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No groups created yet.</p>
        )}
      </div>

      <div className="section">
        <h2>Your Friends</h2>
        {friends.length > 0 ? (
          <ul>
            {friends.map((friend) => (
              <li key={friend.id}>
                {friend.name}
                <button onClick={() => handleDeleteFriend(friend.id)} className="delete-button">Delete</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No friends added yet.</p>
        )}
      </div>
    </div>
  );
}

export default App;