document.addEventListener('DOMContentLoaded', function() {
            const cards = document.querySelectorAll('.provider-card');
            const overlay = document.getElementById('providerDetail');
            const closeBtn = document.getElementById('closeDetail');
            const searchInput = document.getElementById('providerSearch');

            // Overlay show/hide
            cards.forEach(card => {
                card.addEventListener('click', function(e) {
                    // Don't open if a button was clicked
                    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
                    
                    const name = this.querySelector('.provider-name').textContent;
                    const cat = this.querySelector('.provider-category').textContent;
                    const email = this.querySelector('.provider-email').textContent;
                    const status = this.querySelector('.card-status').textContent;

                    document.getElementById('detailName').textContent = name;
                    document.getElementById('detailCategory').textContent = cat + ' SERVICES';
                    document.getElementById('detailEmail').textContent = email;
                    document.getElementById('detailStatus').textContent = status;
                    
                    document.querySelector('.detail-badge').style.background = status === 'PENDING' ? 'rgba(241, 196, 15, 0.1)' : 'rgba(255, 140, 0, 0.1)';
                    document.querySelector('.detail-badge').style.color = status === 'PENDING' ? '#f1c40f' : 'var(--orange)';

                    cards.forEach(c => c.classList.remove('active'));
                    this.classList.add('active');
                    overlay.classList.add('open');
                });
            });

            if (closeBtn) closeBtn.addEventListener('click', function() {
                overlay.classList.remove('open');
                cards.forEach(c => c.classList.remove('active'));
            });

            // Search filtering
            if (searchInput) searchInput.addEventListener('input', function() {
                const term = this.value.toLowerCase();
                cards.forEach(card => {
                    const name = card.querySelector('.provider-name').textContent.toLowerCase();
                    const cat = card.querySelector('.provider-category').textContent.toLowerCase();
                    if(card.style.display !== 'none' || card.dataset.removed !== 'true') {
                        if (name.includes(term) || cat.includes(term)) {
                            card.style.display = 'block';
                        } else {
                            card.style.display = 'none';
                        }
                    }
                });
            });

            // Modal Elements for Messaging
            var msgModal    = document.getElementById('messageModal');
            var closeMsg    = document.getElementById('closeMsgModal');
            var cancelMsg   = document.getElementById('cancelMsgBtn');
            var sendMsg     = document.getElementById('sendMsgBtn');
            var targetName  = document.getElementById('msgTargetName');
            var msgSubject  = document.getElementById('msgSubject');
            var msgContent  = document.getElementById('msgContent');

            function openMessageModal(name) {
                targetName.textContent = name;
                msgSubject.value = '';
                msgContent.value = '';
                msgModal.classList.add('open');
            }

            function closeMessageModal() {
                msgModal.classList.remove('open');
            }

            if(closeMsg) closeMsg.addEventListener('click', closeMessageModal);
            if(cancelMsg) cancelMsg.addEventListener('click', closeMessageModal);

            if(sendMsg) {
                sendMsg.addEventListener('click', function() {
                    var subject = msgSubject.value.trim();
                    var content = msgContent.value.trim();

                    if(!subject && !content) {
                        closeMessageModal();
                        return;
                    }

                    // Create notification object compatible with existing system
                    var newNotif = {
                        id: Date.now().toString(),
                        title: subject || 'Message from Admin',
                        message: content || 'You have a new message from Administrator.',
                        audience: 'Service Providers', // Goes to provider dashboard
                        date: new Date().toISOString(),
                        read: false,
                        iconClass: 'far fa-envelope'
                    };

                    var allNotifs = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
                    allNotifs.unshift(newNotif);
                    localStorage.setItem('admin_notifications', JSON.stringify(allNotifs));

                    sendMsg.innerHTML = '<i class="fas fa-check"></i> SENT';
                    sendMsg.style.background = '#2ecc71';
                    sendMsg.style.color = '#fff';

                    setTimeout(function() {
                        closeMessageModal();
                        setTimeout(function() {
                            sendMsg.innerHTML = '<i class="fas fa-paper-plane" style="margin-right: 6px;"></i> SEND NOTIFICATION';
                            sendMsg.style.background = 'var(--orange)';
                            sendMsg.style.color = '#000';
                        }, 300);
                    }, 700);
                });
            }

            // Bind MESSAGE button in Details Overlay
            const overlayMsgBtn = document.querySelector('.btn-msg-prov');
            if(overlayMsgBtn) {
                overlayMsgBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const name = document.getElementById('detailName').textContent;
                    openMessageModal(name);
                });
            }

            // Modal Elements for Action Confirmation (Delete/Approve/Reject)
            var actionModal      = document.getElementById('actionConfirmModal');
            var actionTitle      = document.getElementById('actionTitle');
            var actionTargetName = document.getElementById('actionTargetName');
            var cancelAction     = document.getElementById('cancelActionBtn');
            var confirmAction    = document.getElementById('confirmActionBtn');
            var actionIcon       = document.getElementById('actionIcon');
            var currentActionData = null; // Stores card reference and action type

            function openActionModal(name, cardElement, actionType) {
                currentActionData = { card: cardElement, type: actionType };
                actionTargetName.textContent = name;
                
                // Configure modal text/color based on action
                if(actionType === 'suspend' || actionType === 'reject') {
                    actionTitle.textContent = (actionType === 'suspend') ? "Suspend Provider?" : "Reject Provider?";
                    confirmAction.textContent = "YES, " + actionType.toUpperCase();
                    confirmAction.style.background = "#e74c3c";
                    actionIcon.style.background = "rgba(231,76,60,0.1)";
                    actionIcon.style.color = "#e74c3c";
                    actionIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
                } else if(actionType === 'approve') {
                    actionTitle.textContent = "Approve Provider?";
                    confirmAction.textContent = "YES, APPROVE";
                    confirmAction.style.background = "var(--orange)";
                    actionIcon.style.background = "rgba(255,140,0,0.1)";
                    actionIcon.style.color = "var(--orange)";
                    actionIcon.innerHTML = '<i class="far fa-check-circle"></i>';
                }
                
                actionModal.classList.add('open');
            }

            function closeActionModal() {
                actionModal.classList.remove('open');
                currentActionData = null;
            }

            if(cancelAction) cancelAction.addEventListener('click', closeActionModal);

            if(confirmAction) {
                confirmAction.addEventListener('click', function() {
                    if(currentActionData && currentActionData.card) {
                        const card = currentActionData.card;
                        const type = currentActionData.type;

                        if(type === 'suspend' || type === 'reject') {
                            card.style.display = 'none';
                            card.dataset.removed = "true";
                        } else if(type === 'approve') {
                            // Convert PENDING to APPROVED
                            const badge = card.querySelector('.card-status');
                            if(badge) {
                                badge.textContent = 'APPROVED';
                                badge.classList.remove('pending');
                            }
                            // Replace actions wrapper with Suspend button
                            const actionsGrid = card.querySelector('.card-actions');
                            if(actionsGrid) {
                                actionsGrid.innerHTML = '<button class="btn-suspend">SUSPEND PROVIDER</button>';
                                // Re-bind new suspend button
                                actionsGrid.querySelector('.btn-suspend').addEventListener('click', bindSuspend);
                            }
                        }
                    }
                    
                    // Specific overlay cleanup for suspend event
                    if (currentActionData && currentActionData.type === 'suspend' && overlay.classList.contains('open')) {
                         overlay.classList.remove('open');
                         cards.forEach(c => c.classList.remove('active'));
                    }
                    
                    // Visual feedback loop
                    confirmAction.textContent = "SUCCESS";
                    confirmAction.style.background = "#2ecc71"; // Success green

                    setTimeout(function() {
                        closeActionModal();
                    }, 500);
                });
            }

            // Helper to bind the suspend actions
            function bindSuspend(e) {
                e.stopPropagation();
                var card = e.target.closest('.provider-card');
                var name = card.querySelector('.provider-name').textContent;
                openActionModal(name, card, 'suspend');
            }

            // Bind suspend in regular cases
            const suspendBtns = document.querySelectorAll('.provider-card .btn-suspend');
            suspendBtns.forEach(btn => btn.addEventListener('click', bindSuspend));

            // Bind suspend in detail overlay
            const overlaySuspendBtn = document.querySelector('.btn-suspend');
            if(overlaySuspendBtn) {
                overlaySuspendBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const name = document.getElementById('detailName').textContent;
                    const activeCard = document.querySelector('.provider-card.active');
                    if(activeCard) openActionModal(name, activeCard, 'suspend');
                });
            }

            // Bind Approve / Reject 
            const approveBtns = document.querySelectorAll('.btn-approve');
            approveBtns.forEach(btn => btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var card = e.target.closest('.provider-card');
                var name = card.querySelector('.provider-name').textContent;
                openActionModal(name, card, 'approve');
            }));

            const rejectBtns = document.querySelectorAll('.provider-card .btn-reject');
            rejectBtns.forEach(btn => btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var card = e.target.closest('.provider-card');
                var name = card.querySelector('.provider-name').textContent;
                openActionModal(name, card, 'reject');
            }));

        });