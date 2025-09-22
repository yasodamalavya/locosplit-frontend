import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getGroups, getFriends, createFriend, createGroup, addExpense } from './api';
import './App.css';

function AddExpense() {
    const navigate = useNavigate();
    const [friends, setFriends] = useState([]);
    const [groups, setGroups] = useState([]);
    const [formData, setFormData] = useState({
        description: '',
        groupId: '',
        newGroupName: '',
        isNewGroup: false
    });
    const [payments, setPayments] = useState({});
    const [newFriendName, setNewFriendName] = useState('');

    useEffect(() => {
        const fetchFriendsAndGroups = async () => {
            try {
                const [friendsList, groupsList] = await Promise.all([getFriends(), getGroups()]);
                setFriends(friendsList);
                setGroups(groupsList);
                
                const initialPayments = friendsList.reduce((acc, friend) => {
                    acc[friend.id] = 0;
                    return acc;
                }, {});
                setPayments(initialPayments);

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchFriendsAndGroups();
    }, []);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

const handlePaymentChange = (friendId, amount) => {
    // Correctly handles empty strings and numeric values
    setPayments(prevPayments => ({
        ...prevPayments,
        [friendId]: amount === '' ? '' : parseFloat(amount) || 0
    }));
};

    const handleNewFriendChange = (e) => {
        setNewFriendName(e.target.value);
    };

    const handleAddFriend = async (e) => {
        e.preventDefault();
        if (newFriendName.trim() === '') return;

        try {
            const newFriend = await createFriend(newFriendName);
            setFriends(prevFriends => [...prevFriends, newFriend]);
            setPayments(prevPayments => ({ ...prevPayments, [newFriend.id]: 0 }));
            setNewFriendName('');
            alert(`${newFriend.name} added successfully!`);
        } catch (error) {
            console.error('Error adding friend:', error);
            alert('Failed to add friend.');
        }
    };
    
   const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        let finalGroupId = formData.groupId;
        const finalPayments = Object.entries(payments)
            .filter(([id, amount]) => amount > 0)
            .map(([id, amount]) => ({
                friend: { id: parseInt(id) },
                amount: parseFloat(amount)
            }));
        
        // Corrected: memberIds should include all friends, not just the ones who paid
        const memberIds = friends.map(friend => friend.id);

        if (formData.isNewGroup && formData.newGroupName) {
            if (memberIds.length === 0) {
                alert("A new group requires at least one member.");
                return;
            }
            const newGroup = await createGroup(formData.newGroupName, memberIds);
            finalGroupId = newGroup.id;
        }

        const totalPaid = Object.values(payments).reduce((sum, amount) => sum + amount, 0);
        if (totalPaid <= 0) {
            alert("The total expense amount must be greater than zero.");
            return;
        }

        const expensePayload = {
            description: formData.description,
            groupId: parseInt(finalGroupId),
            payments: finalPayments
        };

        await addExpense(expensePayload);
        alert('Expense added successfully!');
        navigate(`/groups/${finalGroupId}`);
    } catch (error) {
        console.error('Error adding expense:', error.response ? error.response.data : error.message);
        alert('Failed to add expense. Check console for details.');
    }
};

    return (
        <div className="main-container">
            <h1>Add New Expense</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Description:</label>
                    <input type="text" name="description" value={formData.description} onChange={handleFormChange} required />
                </div>
                
                <div className="form-section">
                    <h2>Which Group?</h2>
                    <div className="form-group">
                        <select 
                            name="groupId" 
                            value={formData.groupId || ''} 
                            onChange={handleFormChange} 
                            required={!formData.isNewGroup}
                            className="form-control"
                        >
                            <option value="">Select a group</option>
                            {groups.map(group => (
                                <option key={group.id} value={group.id}>{group.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="checkbox-container">
                        <input type="checkbox" name="isNewGroup" checked={formData.isNewGroup} onChange={handleFormChange} />
                        <label>Create new group</label>
                    </div>
                    {formData.isNewGroup && (
                        <div className="form-group">
                            <input 
                                type="text" 
                                name="newGroupName" 
                                value={formData.newGroupName} 
                                onChange={handleFormChange} 
                                placeholder="Enter new group's name" 
                                required 
                                className="form-control"
                            />
                        </div>
                    )}
                </div>

                <div className="form-section">
                    <h2>Who Paid & How Much?</h2>
                    <div className="payment-list">
                        {friends.map(friend => (
                            <div className="payment-input">
    <label>{friend.name} paid:</label>
    <input
        type="number"
        className="form-control"
        value={payments[friend.id]} // <-- REMOVED '|| '''
        onChange={(e) => handlePaymentChange(friend.id, e.target.value)}
    />
</div>
                        ))}
                    </div>
                </div>
                
                <button type="submit" className="button">Add Expense</button>
            </form>
            
            <div className="form-section">
                <h2>Add a New Friend</h2>
                <form onSubmit={handleAddFriend}>
                    <div className="form-group">
                        <input type="text" value={newFriendName} onChange={handleNewFriendChange} placeholder="Enter new friend's name" required className="form-control" />
                    </div>
                    <button type="submit" className="button">Add Friend</button>
                </form>
            </div>

            <Link to="/" className="back-link">Back to Home</Link>
        </div>
    );
}

export default AddExpense;