import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getGroups, getFriends, createFriend, createGroup, addExpense, getGroupById } from './api';
import './App.css';

function AddExpense() {
    const navigate = useNavigate();
    const [allFriends, setAllFriends] = useState([]);
    const [groups, setGroups] = useState([]);
    const [groupMembers, setGroupMembers] = useState([]);
    const [formData, setFormData] = useState({
        description: '',
        groupId: '',
        newGroupName: '',
        isNewGroup: false
    });
    const [payments, setPayments] = useState({});
    const [newFriendName, setNewFriendName] = useState('');
    const [isAddingNewFriend, setIsAddingNewFriend] = useState(false);
    const [selectedFriendId, setSelectedFriendId] = useState('');

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [friendsList, groupsList] = await Promise.all([getFriends(), getGroups()]);
                setAllFriends(friendsList);
                setGroups(groupsList);
                setGroupMembers(friendsList);
                
                const initialPayments = friendsList.reduce((acc, friend) => {
                    acc[friend.id] = 0;
                    return acc;
                }, {});
                setPayments(initialPayments);

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchAllData();
    }, []);

    const handleFormChange = async (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        if (name === 'groupId' && value) {
            try {
                const selectedGroup = await getGroupById(value);
                setGroupMembers(selectedGroup.members);
            } catch (error) {
                console.error('Error fetching group members:', error);
                setGroupMembers([]);
            }
        } else if (name === 'isNewGroup' && checked) {
            setGroupMembers([]);
            setPayments({});
        }
    };

    const handlePaymentChange = (friendId, amount) => {
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
        
        let friendToAdd;
        if (isAddingNewFriend) {
            if (newFriendName.trim() === '') return;
            try {
                const newFriend = await createFriend(newFriendName);
                friendToAdd = newFriend;
            } catch (error) {
                console.error('Error creating new friend:', error);
                alert('Failed to create new friend.');
                return;
            }
        } else {
            if (!selectedFriendId) return;
            friendToAdd = allFriends.find(f => f.id === parseInt(selectedFriendId));
        }

        if (friendToAdd) {
            setGroupMembers(prevMembers => [...prevMembers, friendToAdd]);
            setAllFriends(prevAllFriends => prevAllFriends.filter(f => f.id !== friendToAdd.id));
            setPayments(prevPayments => ({...prevPayments, [friendToAdd.id]: 0}));
            setNewFriendName('');
            setSelectedFriendId('');
            setIsAddingNewFriend(false);
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
            
            const allMemberIds = groupMembers.map(friend => friend.id);

            if (formData.isNewGroup && formData.newGroupName) {
                if (allMemberIds.length === 0) {
                    alert("A new group requires at least one member.");
                    return;
                }
                const newGroup = await createGroup(formData.newGroupName, allMemberIds);
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
        <div className="add-expense-container">
            <h1>Add New Expense</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Description:</label>
                    <input type="text" name="description" value={formData.description} onChange={handleFormChange} required className="form-control" />
                </div>
                
                <div className="form-columns">
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
                        {groupMembers.length > 0 ? (
                            <div className="payment-list">
                                {groupMembers.map(friend => (
                                    <div key={friend.id} className="payment-input">
                                        <label>{friend.name} paid:</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={payments[friend.id] || ''}
                                            onChange={(e) => handlePaymentChange(friend.id, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>Add friends to the group below.</p>
                        )}
                    </div>
                </div>
                
                <button type="submit" className="button">Add Expense</button>
            </form>
            
            <div className="form-section">
                <h2>Add a New Friend</h2>
                <form onSubmit={handleAddFriend}>
                    <div className="form-group">
                        <div className="checkbox-container">
                            <input type="checkbox" checked={isAddingNewFriend} onChange={(e) => setIsAddingNewFriend(e.target.checked)} />
                            <label>Add a new friend</label>
                        </div>
                        {isAddingNewFriend ? (
                            <input type="text" value={newFriendName} onChange={handleNewFriendChange} placeholder="Enter new friend's name" required className="form-control" />
                        ) : (
                            <select value={selectedFriendId} onChange={(e) => setSelectedFriendId(e.target.value)} className="form-control" >
                                <option value="">Select an existing friend</option>
                                {allFriends.filter(f => !groupMembers.some(m => m.id === f.id)).map(friend => (
                                    <option key={friend.id} value={friend.id}>{friend.name}</option>
                                ))}
                            </select>
                        )}
                    </div>
                    <button type="submit" className="button">Add Friend</button>
                </form>
            </div>

            <Link to="/" className="back-link">Back to Home</Link>
        </div>
    );
}

export default AddExpense;