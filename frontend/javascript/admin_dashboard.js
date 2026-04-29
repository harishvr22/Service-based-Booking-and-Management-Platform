document.addEventListener('DOMContentLoaded', async function () {
    const API_BASE_URL = 'http://127.0.0.1:5000';
    
    // Load dashboard data from API
    async function loadDashboardData() {
        try {
            // Show loading states
            updateStatsDisplay('Loading...');
            
            const response = await fetch(`${API_BASE_URL}/admin/dashboard`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Update stats
            if (data.stats) {
                updateStatsDisplay(data.stats.total_users, data.stats.active_providers, data.stats.active_bookings, data.stats.revenue);
            }
            
            // Update recent bookings table
            if (data.recent_bookings) {
                updateBookingsTable(data.recent_bookings);
            }
            
            // Update action required panel
            if (data.action_required) {
                updateActionPanel(data.action_required);
            }
            
            // Update charts with real data
            if (data.charts) {
                updateCharts(data.charts);
            }
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            
            // Don't show error notification for development, just log it
            if (error.message.includes('Failed to fetch')) {
                console.log('API endpoint not available yet - using default data');
            } else {
                // Show error in a user-friendly way
                updateStatsDisplay('Error', 'Failed to load');
            }
        }
    }
    
    // Update stats display
    function updateStatsDisplay(users, providers, bookings, revenue) {
        const userStat = document.querySelector('#stat-users .ad-stat-val');
        const providerStat = document.querySelector('#stat-providers .ad-stat-val');
        const bookingStat = document.querySelector('#stat-bookings .ad-stat-val');
        const revenueStat = document.querySelector('#stat-revenue .ad-stat-val');
        
        if (userStat) userStat.textContent = users || '0';
        if (providerStat) providerStat.textContent = providers || '0';
        if (bookingStat) bookingStat.textContent = bookings || '0';
        if (revenueStat) revenueStat.textContent = revenue || '$0';
    }
    
    // Update recent bookings table
    function updateBookingsTable(bookings) {
        const tableBody = document.querySelector('.ad-table tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (!bookings || bookings.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#888;padding:20px;">No recent bookings found</td></tr>';
            return;
        }
        
        bookings.forEach(booking => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="font-weight: 500;">${booking.resident || 'N/A'}</td>
                <td style="color: #aaa;">${booking.service || 'N/A'}</td>
                <td><span class="badge-solid badge-${booking.status || 'pending'}">${(booking.status || 'PENDING').toUpperCase()}</span></td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    // Update action required panel
    function updateActionPanel(actions) {
        const panel = document.querySelector('.ad-panel:last-child .ad-action-item');
        if (!panel) return;
        
        if (actions.provider_approvals) {
            panel.innerHTML = `
                <div class="ad-action-icon icon-orange"><i class="fas fa-wrench"></i></div>
                <div class="ad-action-info">
                    <h4>Provider Approvals</h4>
                    <p>${actions.provider_approvals} awaiting review</p>
                </div>
            `;
            panel.onclick = () => window.location.href = 'admin_providers.html';
        }
        
        if (actions.open_complaints) {
            const complaintsPanel = panel.nextElementSibling;
            if (complaintsPanel) {
                complaintsPanel.innerHTML = `
                    <div class="ad-action-icon icon-red"><i class="fas fa-exclamation-triangle"></i></div>
                    <div class="ad-action-info">
                        <h4>Open Complaints</h4>
                        <p>${actions.open_complaints} need attention</p>
                    </div>
                `;
                complaintsPanel.onclick = () => window.location.href = 'admin_complaints.html';
            }
        }
        
        if (actions.pending_bookings) {
            const bookingsPanel = panel.nextElementSibling;
            if (bookingsPanel) {
                bookingsPanel.innerHTML = `
                    <div class="ad-action-icon icon-orange"><i class="far fa-clock"></i></div>
                    <div class="ad-action-info">
                        <h4>Pending Bookings</h4>
                        <p>${actions.pending_bookings} to approve</p>
                    </div>
                `;
                bookingsPanel.onclick = () => window.location.href = 'admin_monitoring.html';
            }
        }
    }
    
    // Update charts with real data
    function updateCharts(chartData) {
        // Update booking trends chart
        if (chartData.booking_trends) {
            const bookingCtx = document.getElementById('bookingTrendsChart');
            if (bookingCtx) {
                new Chart(bookingCtx, {
                    type: 'bar',
                    data: {
                        labels: chartData.booking_trends.labels || ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
                        datasets: [{
                            label: 'Bookings',
                            data: chartData.booking_trends.data || [32, 45, 38, 52, 60, 48],
                            backgroundColor: '#E85A2D',
                            borderRadius: 4,
                            barThickness: 25
                        }]
                    },
                    options: {
                        ...commonOptions,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                enabled: true,
                                backgroundColor: '#333',
                                titleFont: { family: 'Inter' },
                                bodyFont: { family: 'Inter' }
                            }
                        }
                    }
                });
            }
        }
        
        // Update service breakdown chart
        if (chartData.service_breakdown) {
            const serviceCtx = document.getElementById('serviceBreakdownChart');
            if (serviceCtx) {
                new Chart(serviceCtx, {
                    type: 'doughnut',
                    data: {
                        labels: chartData.service_breakdown.labels || ['Plumbing', 'Electrical', 'Cleaning', 'Carpentry'],
                        datasets: [{
                            data: chartData.service_breakdown.data || [35, 25, 22, 18],
                            backgroundColor: [
                                '#E85A2D', // Plumbing - Orange/Red
                                '#3498db', // Electrical - Blue
                                '#2ecc71', // Cleaning - Green
                                '#f1c40f'  // Carpentry - Yellow
                            ],
                            borderWidth: 0,
                            hoverOffset: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '70%',
                        plugins: {
                            legend: {
                                display: true,
                                position: 'right',
                                labels: {
                                    usePointStyle: true,
                                    boxWidth: 8,
                                    font: {
                                        family: 'Inter',
                                        size: 12
                                    },
                                    padding: 20
                                }
                            }
                        }
                    }
                });
            }
        }
        
        // Update revenue trend chart
        if (chartData.revenue_trends) {
            const revenueCtx = document.getElementById('revenueTrendChart');
            if (revenueCtx) {
                // Create gradient
                let gradient = revenueCtx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, 'rgba(232, 90, 45, 0.2)');
                gradient.addColorStop(1, 'rgba(232, 90, 45, 0)');

                new Chart(revenueCtx, {
                    type: 'line',
                    data: {
                        labels: chartData.revenue_trends.labels || ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
                        datasets: [{
                            label: 'Revenue',
                            data: chartData.revenue_trends.data || [25000, 31000, 29000, 40000, 48000, 38000],
                            borderColor: '#E85A2D',
                            backgroundColor: gradient,
                            borderWidth: 2,
                            tension: 0.4, // Smooth curve
                            fill: true,
                            pointRadius: 0,
                            pointHoverRadius: 6
                        }]
                    },
                    options: {
                        ...commonOptions,
                        scales: {
                            y: {
                                ...commonOptions.scales.y,
                                ticks: {
                                    callback: function (value) {
                                        return '₹' + value / 1000 + 'k';
                                    }
                                }
                            },
                            x: {
                                ...commonOptions.scales.x,
                                grid: {
                                    display: true,
                                    borderDash: [5, 5],
                                    color: '#f0f0f0'
                                }
                            }
                        }
                    }
                });
            }
        }
    }
    
    // Shared Chart Options
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#f0f0f0',
                    borderDash: [5, 5]
                },
                ticks: {
                    font: {
                        family: 'Inter',
                        size: 11
                    },
                    color: '#888'
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        family: 'Inter',
                        size: 11
                    },
                    color: '#888'
                }
            }
        }
    };

    // 1. Booking Trends (Bar Chart)
    const bookingCtx = document.getElementById('bookingTrendsChart').getContext('2d');
    new Chart(bookingCtx, {
        type: 'bar',
        data: {
            labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
            datasets: [{
                label: 'Bookings',
                data: [32, 45, 38, 52, 60, 48],
                backgroundColor: '#E85A2D',
                borderRadius: 4,
                barThickness: 25
            }]
        },
        options: {
            ...commonOptions,
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    backgroundColor: '#333',
                    titleFont: { family: 'Inter' },
                    bodyFont: { family: 'Inter' }
                }
            }
        }
    });

    // 2. Service Breakdown (Donut Chart)
    const serviceCtx = document.getElementById('serviceBreakdownChart').getContext('2d');
    const serviceChart = new Chart(serviceCtx, {
        type: 'doughnut',
        data: {
            labels: ['Plumbing', 'Electrical', 'Cleaning', 'Carpentry'],
            datasets: [{
                data: [35, 25, 22, 18],
                backgroundColor: [
                    '#E85A2D', // Plumbing - Orange/Red
                    '#3498db', // Electrical - Blue
                    '#2ecc71', // Cleaning - Green
                    '#f1c40f'  // Carpentry - Yellow
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 8,
                        font: {
                            family: 'Inter',
                            size: 12
                        },
                        padding: 20
                    }
                }
            }
        }
    });

    // 3. Revenue Trend (Line Chart)
    const revenueCtx = document.getElementById('revenueTrendChart').getContext('2d');

    // Create gradient
    let gradient = revenueCtx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(232, 90, 45, 0.2)');
    gradient.addColorStop(1, 'rgba(232, 90, 45, 0)');

    new Chart(revenueCtx, {
        type: 'line',
        data: {
            labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
            datasets: [{
                label: 'Revenue',
                data: [25000, 31000, 29000, 40000, 48000, 38000],
                borderColor: '#E85A2D',
                backgroundColor: gradient,
                borderWidth: 2,
                tension: 0.4, // Smooth curve
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 6
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                y: {
                    ...commonOptions.scales.y,
                    ticks: {
                        callback: function (value) {
                            return '₹' + value / 1000 + 'k';
                        }
                    }
                },
                x: {
                    ...commonOptions.scales.x,
                    grid: {
                        display: true,
                        borderDash: [5, 5],
                        color: '#f0f0f0'
                    }
                }
            }
        }
    });

    // Load dashboard data on initialization
    loadDashboardData();
});
