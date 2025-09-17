import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGroupById, getExpensesByGroupId, calculateBalances, getFriends, createFriend, addFriendToGroup } from './api';
import './App.css';

function GroupDetail() {
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [balances, setBalances] = useState({});
    const [friends, setFriends] = useState([]);
    const [newFriendId, setNewFriendId] = useState('');
    const [newFriendName, setNewFriendName] = useState('');
    const [isAddingNewFriend, setIsAddingNewFriend] = useState(false);

    const fetchData = async () => {
        try {
            const groupData = await getGroupById(groupId);
            setGroup(groupData);
            const expensesData = await getExpensesByGroupId(groupId);
            setExpenses(expensesData);
            const balancesData = await calculateBalances(groupId);
            setBalances(balancesData);
            const allFriends = await getFriends();
            setFriends(allFriends);
        } catch (error) {
            console.error('Error fetching group data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [groupId]);

   const handleAddFriendSubmit = async (e) => {
    e.preventDefault();
    try {
        let friendId = newFriendId;
        if (isAddingNewFriend && newFriendName) {
            const newFriend = await createFriend(newFriendName);
            friendId = newFriend.id;
        }

        if (friendId) {
            await addFriendToGroup(groupId, friendId);
            alert('Friend added to group and shares recalculated!');
            setNewFriendId('');
            setNewFriendName('');
            setIsAddingNewFriend(false);
            
            // <-- ADD THIS LINE
            fetchData(); // Re-fetch data to update the UI
        }
    } catch (error) {
        console.error('Error adding friend to group:', error);
        alert('Failed to add friend. Check console for details.');
    }
};

    if (!group) {
        return <div className="container">Loading group details...</div>;
    }

    return (
        <div className="container">
            <h1>Group: {group.name}</h1>
            <Link to="/" className="back-link">Back to Home</Link>
            
            <div className="section">
                <h2>Members</h2>
                <ul>
                    {group.members.map(member => (
                        <li key={member.id}>{member.name}</li>
                    ))}
                </ul>
                <form onSubmit={handleAddFriendSubmit} className="add-friend-form">
                    <div className="form-group">
                        <label>Add new member:</label>
                        <div className="checkbox-container">
                            <input type="checkbox" checked={isAddingNewFriend} onChange={(e) => setIsAddingNewFriend(e.target.checked)} />
                            <label>Add new friend</label>
                        </div>
                        {isAddingNewFriend ? (
                            <input type="text" value={newFriendName} onChange={(e) => setNewFriendName(e.target.value)} placeholder="Enter new friend's name" required />
                        ) : (
                            <select value={newFriendId} onChange={(e) => setNewFriendId(e.target.value)} required>
                                <option value="">Select an existing friend</option>
                                {friends.filter(f => !group.members.some(m => m.id === f.id)).map(friend => (
                                    <option key={friend.id} value={friend.id}>{friend.name}</option>
                                ))}
                            </select>
                        )}
                    </div>
                    <button type="submit" className="button">Add Friend</button>
                </form>
            </div>
            
            <div className="section">
                <h2>Balances</h2>
                <ul>
                    {Object.entries(balances).map(([name, balance]) => (
                        <li key={name}>
                            {name} {balance > 0 ? `is owed $${balance.toFixed(2)}` : `owes $${Math.abs(balance).toFixed(2)}`}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="section">
                <h2>Expenses</h2>
                {expenses.length > 0 ? (
                    <ul>
                        {expenses.map(expense => (
                            <li key={expense.id}>
                                <strong>{expense.description}</strong> - Paid by {expense.paidBy.name} for ${expense.amount.toFixed(2)}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No expenses for this group yet.</p>
                )}
            </div>
        </div>
    );
}

export default GroupDetail;