document.addEventListener('DOMContentLoaded', function () {
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
});
