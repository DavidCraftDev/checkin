document.addEventListener('DOMContentLoaded', async () => {
    const loading = document.getElementById('loading');
    const content = document.getElementById('content');
    const displayName = document.getElementById('displayName');
    const completedCount = document.getElementById('completedCount');
    const totalNeeds = document.getElementById('totalNeeds');
    const missingList = document.getElementById('missingList');
    const noMissing = document.getElementById('noMissing');
    const completedList = document.getElementById('completedList');
    const otherList = document.getElementById('otherList');
    const logoutBtn = document.getElementById('logoutBtn');

    logoutBtn.addEventListener('click', async () => {
        await fetch('api/logout.php');
        window.location.href = 'login.html';
    });

    try {
        const response = await fetch('api/user.php');
        if (response.status === 401) {
            window.location.href = 'login.html';
            return;
        }

        const data = await response.json();

        // Populate User Info
        displayName.textContent = data.user.displayname;
        completedCount.textContent = data.stats.completedCount;
        totalNeeds.textContent = data.stats.totalNeeds;

        // Missing Study Times
        if (data.stats.missing.length === 0) {
            noMissing.classList.remove('hidden');
        } else {
            data.stats.missing.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                missingList.appendChild(li);
            });
        }

        // Attendances
        data.attendances.forEach(item => {
            const type = item.attendance.type;
            const eventName = item.event.type;
            const date = new Date(item.attendance.created_at).toLocaleDateString('de-DE');

            const li = document.createElement('li');
            li.className = "p-2 bg-white rounded shadow-sm border border-gray-100";
            li.innerHTML = `
                <div class="font-semibold">${type || eventName}</div>
                <div class="text-xs text-gray-500">${date} - ${item.eventUser.displayname}</div>
            `;

            if (type && type !== 'Unterricht') {
                completedList.appendChild(li);
            } else if (!type) {
                otherList.appendChild(li);
            }
        });

        loading.classList.add('hidden');
        content.classList.remove('hidden');

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        loading.textContent = 'Fehler beim Laden der Daten.';
    }
});
