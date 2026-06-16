document.addEventListener('DOMContentLoaded', () => 
{
    const form = document.getElementById('addUserForm');
    const msg = document.getElementById('message');
    const ag = document.getElementById('age');
    const tableBody = document.getElementById('userTableBody');
    const submitBtn = document.getElementById('submitBtn');
    let users = [];
    let editIndex = -1;
    const API_URL = 'http://localhost:3000/users';
    for (let i = 18; i <= 34; i++)
    {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        ag.appendChild(option);
    }
    async function fetchUsers() 
    {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch users');
            users = await response.json();
            renderTable();
        } catch (error) {
            console.error('Error fetching users:', error);
            msg.textContent = 'Error loading users from server';
            msg.style.color = 'red';
        }
    }
    function renderTable() 
    {
        tableBody.innerHTML = '';
        users.forEach((user, index) => 
        {
            const row = document.createElement('tr');       
            const nameCell = document.createElement('td');
            nameCell.style.padding = '10px';
            nameCell.textContent = user.fullName;
            row.appendChild(nameCell);
            const emailCell = document.createElement('td');
            emailCell.style.padding = '10px';
            emailCell.textContent = user.email;
            row.appendChild(emailCell);
            const ageCell = document.createElement('td');
            ageCell.style.padding = '10px';
            ageCell.textContent = user.age;
            row.appendChild(ageCell);
            const hobbiesCell = document.createElement('td');
            hobbiesCell.style.padding = '10px';
            hobbiesCell.textContent = user.hobbies && user.hobbies.length > 0 ? user.hobbies.join(', ') : 'None';
            row.appendChild(hobbiesCell);
            const actionCell = document.createElement('td');
            actionCell.style.padding = '10px';
            actionCell.innerHTML = `
                <button class="editBtn" data-index="${index}">
                    Edit
                </button>
                <button class="deleteBtn" data-index="${index}">
                    Delete
                </button>
            `;
            row.appendChild(actionCell);
            tableBody.appendChild(row);
        });
        addButtonEvents();
    }
    function addButtonEvents() {
        document.querySelectorAll('.deleteBtn').forEach(button => 
            {
                button.addEventListener('click', async () => 
                {
                    const index = button.dataset.index;
                    const confirmDelete = confirm('Are you sure you want to delete this user?');
                    if (confirmDelete) 
                    {
                        try {
                            const response = await fetch(`${API_URL}/${index}`, {
                                method: 'DELETE'
                            });
                            if (!response.ok) throw new Error('Failed to delete user');
                            msg.textContent = 'User deleted successfully';
                            msg.style.color = 'green';
                            await fetchUsers();
                        } catch (error) {
                            console.error('Error deleting user:', error);
                            msg.textContent = 'Error deleting user';
                            msg.style.color = 'red';
                        }
                    }
                });
            });
        document.querySelectorAll('.editBtn').forEach(button => 
            {
                button.addEventListener('click', () => 
                {
                    editIndex = button.dataset.index;
                    const user = users[editIndex];
                    document.getElementById('fullName').value = user.fullName;
                    document.getElementById('email').value = user.email;
                    ag.value = user.age;
                    document.querySelectorAll('input[name="hobbies"]')
                        .forEach(cb => 
                        {
                            cb.checked = user.hobbies && user.hobbies.includes(cb.value);
                        });
                    submitBtn.textContent = 'Update';
                });
            });
    }
    form.addEventListener('submit', async e => 
    {
        e.preventDefault();
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const age = ag.value;
        const selectedHobbies = Array.from(document.querySelectorAll('input[name="hobbies"]:checked')).map(cb => cb.value);
        if (!fullName || !email || !age)
        {
            msg.textContent = 'Please fill all required fields';
            msg.style.color = 'red';
            return;
        }
        const userData = 
        {
            fullName,
            email,
            age: parseInt(age),
            hobbies: selectedHobbies
        };
        try {
            if (editIndex !== -1)
            {
                const response = await fetch(`${API_URL}/${editIndex}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
                if (!response.ok) throw new Error('Failed to update user');
                msg.textContent = 'User updated successfully';
                editIndex = -1;
                submitBtn.textContent = 'Register';
            }
            else 
            {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
                if (!response.ok) throw new Error('Failed to add user');
                msg.textContent = 'Successfully added';
            }
            msg.style.color = 'green';
            await fetchUsers();
            form.reset();
            setTimeout(() => 
            {
                msg.textContent = '';
            }, 4000);
        } catch (error) {
            console.error('Error saving user:', error);
            msg.textContent = 'Error saving user data';
            msg.style.color = 'red';
        }
    });
    fetchUsers();
});