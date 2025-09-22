import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGroupById, getExpensesForGroup, calculateBalances, getFriends, createFriend, addFriendToGroup } from './api';
import './App.css';

function GroupDetail() {
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [balances, setBalances] = useState({});
    const [friends, setFriends] = useState([]);

    const fetchData = async () => {
        try {
            const groupData = await getGroupById(groupId);
            setGroup(groupData);
            const expensesData = await getExpensesForGroup(groupId);
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

    if (!group) {
        return <div className="main-container">Loading group details...</div>;
    }

    return (
    <div className="main-container">
        <h1>Group: {group.name}</h1>
        <Link to="/" className="back-link">Back to Home</Link>

        <div className="group-section-card">
            <h2>Members</h2>
            <ul>
                {group.members.map(member => (
                    <li key={member.id}>{member.name}</li>
                ))}
            </ul>
        </div>

        <div className="group-section-card">
            <h2>Balances</h2>
            <ul>
                {Object.entries(balances).map(([name, balance]) => (
                    <li key={name}>
                        {name} {balance > 0 ? `is owed ₹${balance.toFixed(2)}` : `owes ₹${Math.abs(balance).toFixed(2)}`}
                    </li>
                ))}
            </ul>
        </div>

        <div className="group-section-card">
            <h2>Expenses</h2>
            {expenses.length > 0 ? (
                <ul>
                    {expenses.map(expense => (
                        <li key={expense.id}>
                            <strong>{expense.description}</strong>
                            <span> - Paid by 
                                {expense.payments.map((payment, index) => (
                                    <span key={payment.id}>
                                        {payment.friend.name} for ₹{payment.amount.toFixed(2)}{index < expense.payments.length - 1 ? ', ' : ''}
                                    </span>
                                ))}
                            </span>
                            <span> - Total: ₹{expense.amount.toFixed(2)}</span>
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