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
        amount: 0,
        paidBy: '', // Can be an existing friend ID or a new friend's name
        newFriendName: '',
        group: '', // Can be an existing group ID or a new group's name
        newGroupName: '',
        isNewFriend: false,
        isNewGroup: false
    });

    useEffect(() => {
        const fetchFriendsAndGroups = async () => {
            try {
                const [friendsList, groupsList] = await Promise.all([getFriends(), getGroups()]);
                setFriends(friendsList);
                setGroups(groupsList);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchFriendsAndGroups();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let paidById = formData.paidBy;
            let groupId = formData.group;

            // 1. Handle new friend creation
            if (formData.isNewFriend && formData.newFriendName) {
                const newFriend = await createFriend(formData.newFriendName);
                paidById = newFriend.id;
            }

            // 2. Handle new group creation
            if (formData.isNewGroup && formData.newGroupName) {
                // The paidBy person is the initial member
                const newGroup = await createGroup(formData.newGroupName, paidById);
                groupId = newGroup.id;
            }

            // 3. Create the expense
            const expensePayload = {
                description: formData.description,
                amount: parseFloat(formData.amount),
                paidBy: { id: paidById },
                group: { id: groupId }
            };

            await addExpense(expensePayload);
            alert('Expense added successfully!');
            navigate('/');
        } catch (error) {
            console.error('Error adding expense:', error.response ? error.response.data : error.message);
            alert('Failed to add expense. Check console for details.');
        }
    };

    return (
        <div className="container">
            <h1>Add New Expense</h1>
            <form onSubmit={handleSubmit}>
                {/* Description and Amount */}
                <div className="form-group">
                    <label>Description:</label>
                    <input type="text" name="description" value={formData.description} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Amount:</label>
                    <input type="number" name="amount" value={formData.amount} onChange={handleChange} required />
                </div>

                {/* Who Paid Section */}
                <div className="form-group">
                    <label>Who Paid?</label>
                    <div className="checkbox-container">
                        <input type="checkbox" name="isNewFriend" checked={formData.isNewFriend} onChange={handleChange} />
                        <label>Add new friend</label>
                    </div>
                    {formData.isNewFriend ? (
                        <input type="text" name="newFriendName" value={formData.newFriendName} onChange={handleChange} placeholder="Enter new friend's name" required />
                    ) : (
                        <select name="paidBy" value={formData.paidBy || ''} onChange={handleChange} required>
                            <option value="">Select a friend</option>
                            {friends.map(friend => (
                                <option key={friend.id} value={friend.id}>{friend.name}</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Which Group Section */}
                <div className="form-group">
                    <label>Which Group?</label>
                    <div className="checkbox-container">
                        <input type="checkbox" name="isNewGroup" checked={formData.isNewGroup} onChange={handleChange} />
                        <label>Create new group</label>
                    </div>
                    {formData.isNewGroup ? (
                        <input type="text" name="newGroupName" value={formData.newGroupName} onChange={handleChange} placeholder="Enter new group's name" required />
                    ) : (
                        <select name="group" value={formData.group || ''} onChange={handleChange} required>
                            <option value="">Select a group</option>
                            {groups.map(group => (
                                <option key={group.id} value={group.id}>{group.name}</option>
                            ))}
                        </select>
                    )}
                </div>
                
                <button type="submit" className="button">Add Expense</button>
            </form>
            <Link to="/" className="back-link">Back to Home</Link>
        </div>
    );
}

export default AddExpense;