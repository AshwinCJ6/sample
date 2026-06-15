document.addEventListener('DOMContentLoaded', () => 
{
    const form = document.getElementById('addUserForm');
    const msg = document.getElementById('message');
    const ag = document.getElementById('age');
    const tableBody = document.getElementById('userTableBody');
    const submitBtn = document.getElementById('submitBtn');
    const users = [];
    let editIndex = -1;
    async function fetchUsers() 
    {
    const response = await fetch('http://localhost:3000/users');
    const users = await response.json();
    renderTable(users);
    }
    for (let i = 18; i <= 34; i++)
    {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        ag.appendChild(option);
    }
    function renderTable(users) 
    {
        tableBody.innerHTML = '';
        users.forEach((user, index) => 
        {
            const row = document.createElement('tr');
            const hobbiesText =user.hobbies.length > 0? user.hobbies.join(', '): 'None';
            row.innerHTML = `<td style="padding:10px;">${user.fullName}</td>
                <td style="padding:10px;">${user.email}</td>
                <td style="padding:10px;">${user.age}</td>
                <td style="padding:10px;">${hobbiesText}</td>
                <td style="padding:10px;">
                    <button class="editBtn" data-index="${index}">
                        Edit
                    </button>
                    <button class="deleteBtn" data-index="${index}">
                        Delete
                    </button>
                </td>
            `;

            tableBody.appendChild(row);
        });
        addButtonEvents(users);
    }
    function addButtonEvents() {
        document.querySelectorAll('.deleteBtn').forEach(button => 
            {
                button.addEventListener('click', () => 
                {
                    const index = button.dataset.index;
                    const confirmDelete =confirm('Are you sure you want to delete this user?');
                    if (confirmDelete) 
                    {
                        users.splice(index, 1);
                        renderTable();
                        msg.textContent ='User deleted successfully';
                        msg.style.color = 'green';
                    }
                });
            });
        document.querySelectorAll('.editBtn').forEach(button => 
            {
                button.addEventListener('click', () => 
                {
                    editIndex = button.dataset.index;
                    const user = users[editIndex];
                    document.getElementById('fullName').value =
                        user.fullName;
                    document.getElementById('email').value =
                        user.email;
                    ag.value = user.age;
                    document.querySelectorAll('input[name="hobbies"]')
                        .forEach(cb => 
                        {
                            cb.checked =
                                user.hobbies.includes(cb.value);
                        });

                    submitBtn.textContent = 'Update';
                });
            });
    }
    form.addEventListener('submit', async e => 
    {
        e.preventDefault();
        const fullName =document.getElementById('fullName').value.trim();
        const email =
            document.getElementById('email').value.trim();
        const age = ag.value;
        const selectedHobbies =Array.from(document.querySelectorAll('input[name="hobbies"]:checked')).map(cb => cb.value);
        if (!fullName || !email || !age)
        {
            msg.textContent ='Please fill all required fields';
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
        if (editIndex !== -1)
        {
            users[editIndex] = userData;
            msg.textContent ='User updated successfully';
            editIndex = -1;
            submitBtn.textContent = 'Register';
        }
       else
       {
            await fetch('http://localhost:3000/users', 
            {
            method: 'POST',
            headers: 
           {
             'Content-Type': 'application/json'
           },
             body: JSON.stringify(userData)
            });
        msg.textContent = 'Successfully added';
        }
        msg.style.color = 'green';
        await fetchUsers();
        form.reset();
        setTimeout(() => 
        {
            msg.textContent = '';
        }, 4000);
    });
});