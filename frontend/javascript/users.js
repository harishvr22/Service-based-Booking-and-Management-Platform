document.addEventListener('DOMContentLoaded', function () {
    var cards      = document.querySelectorAll('.resident-card');
    var wrap       = document.getElementById('overlayWrap');
    var closeTab   = document.getElementById('closeTab');
    var searchInput = document.getElementById('residentSearch');

    // Open detail panel when card is clicked
    cards.forEach(function (card) {
        card.addEventListener('click', function () {
            var name    = this.dataset.name;
            var room    = this.dataset.room;
            var block   = this.dataset.block;
            var email   = this.dataset.email;
            var phone   = this.dataset.phone;
            var movein  = this.dataset.movein;
            var bk      = this.dataset.bookings;
            var status  = this.dataset.status;

            // Initials
            var initials = name.split(' ').map(function(w){ return w[0]; }).join('').substring(0,2).toUpperCase();

            document.getElementById('dAvatar').textContent   = initials;
            document.getElementById('dName').textContent     = name;
            document.getElementById('dSub').textContent      = 'Resident \u00b7 Flat ' + room;
            document.getElementById('dRoom').textContent     = room;
            document.getElementById('dBlock').textContent    = block;
            document.getElementById('dEmail').textContent    = email;
            document.getElementById('dPhone').textContent    = phone;
            document.getElementById('dMovein').textContent   = movein;
            document.getElementById('dBookings').textContent = bk;

            var badge  = document.getElementById('dBadge');
            var avatar = document.getElementById('dAvatar');
            badge.textContent = status;

            if (status === 'INACTIVE') {
                badge.style.background  = 'rgba(231,76,60,0.1)';
                badge.style.color       = '#e74c3c';
                avatar.style.background = 'rgba(231,76,60,0.1)';
                avatar.style.border     = '2px solid rgba(231,76,60,0.3)';
                avatar.style.color      = '#e74c3c';
            } else {
                badge.style.background  = 'rgba(255,140,0,0.1)';
                badge.style.color       = 'var(--orange)';
                avatar.style.background = 'rgba(255,140,0,0.15)';
                avatar.style.border     = '2px solid rgba(255,140,0,0.4)';
                avatar.style.color      = 'var(--orange)';
            }

            // Highlight active card
            cards.forEach(function(c){ c.classList.remove('card-active'); });
            this.classList.add('card-active');

            // Open overlay
            wrap.classList.add('open');
        });
    });

    // Close button
    closeTab.addEventListener('click', function () {
        wrap.classList.remove('open');
        cards.forEach(function(c){ c.classList.remove('card-active'); });
    });

    // Modal Elements for Messaging
    var msgModal    = document.getElementById('messageModal');
    var closeMsg    = document.getElementById('closeMsgModal');
    var cancelMsg   = document.getElementById('cancelMsgBtn');
    var sendMsg     = document.getElementById('sendMsgBtn');
    var targetName  = document.getElementById('msgTargetName');
    var msgSubject  = document.getElementById('msgSubject');
    var msgContent  = document.getElementById('msgContent');
    var currentResidentName = '';

    function openMessageModal(name) {
        currentResidentName = name;
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
                // If completely empty, just close (or could show inline error)
                closeMessageModal();
                return;
            }

            // Create notification object compatible with existing system
            var newNotif = {
                id: Date.now().toString(),
                title: subject || 'Message from Admin',
                message: content || 'You have a new message from Administrator.',
                audience: 'Residents Only', // Ensures it goes to resident dashboard
                date: new Date().toISOString(),
                read: false,
                iconClass: 'far fa-envelope'
            };

            // Store in global notifications
            var allNotifs = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
            allNotifs.unshift(newNotif);
            localStorage.setItem('admin_notifications', JSON.stringify(allNotifs));

            // Visual feedback - closing cleanly
            sendMsg.innerHTML = '<i class="fas fa-check"></i> SENT';
            sendMsg.style.background = '#2ecc71';
            sendMsg.style.color = '#fff';

            setTimeout(function() {
                closeMessageModal();
                setTimeout(function() {
                    // Reset button
                    sendMsg.innerHTML = '<i class="fas fa-paper-plane" style="margin-right: 6px;"></i> SEND NOTIFICATION';
                    sendMsg.style.background = 'var(--orange)';
                    sendMsg.style.color = '#000';
                }, 300);
            }, 700);
        });
    }

    // Modal Elements for Removal
    var rmModal      = document.getElementById('removeConfirmModal');
    var rmTargetName = document.getElementById('removeTargetName');
    var cancelRm     = document.getElementById('cancelRemBtn');
    var confirmRm    = document.getElementById('confirmRemBtn');
    var targetCardToRemove = null;

    function openRemoveModal(name, cardElement) {
        targetCardToRemove = cardElement;
        rmTargetName.textContent = name;
        rmModal.classList.add('open');
    }

    function closeRemoveModal() {
        rmModal.classList.remove('open');
        targetCardToRemove = null;
    }

    if(cancelRm) cancelRm.addEventListener('click', closeRemoveModal);

    if(confirmRm) {
        confirmRm.addEventListener('click', function() {
            if(targetCardToRemove) {
                targetCardToRemove.style.display = 'none';
                targetCardToRemove.dataset.removed = "true";
            }
            
            // Cleanly close out detail panel if active card is deleted
            wrap.classList.remove('open');
            cards.forEach(function(c){ c.classList.remove('card-active'); });

            // Visual feedback loop
            confirmRm.textContent = "REMOVED";
            confirmRm.style.background = "#2ecc71"; // Success green

            setTimeout(function() {
                closeRemoveModal();
                setTimeout(function() {
                    confirmRm.textContent = "YES, REMOVE";
                    confirmRm.style.background = "#e74c3c";
                }, 300);
            }, 500);
        });
    }

    // Action Buttons Logic
    var detailMsgBtn = document.querySelector('.d-btn-msg');
    var detailDelBtn = document.querySelector('.d-btn-del');

    if (detailMsgBtn) {
        detailMsgBtn.addEventListener('click', function() {
            var name = document.getElementById('dName').textContent;
            openMessageModal(name);
        });
    }

    if (detailDelBtn) {
        detailDelBtn.addEventListener('click', function() {
            var name = document.getElementById('dName').textContent;
            var activeCard = document.querySelector('.resident-card.card-active');
            openRemoveModal(name, activeCard);
        });
    }

    // Direct card action buttons
    var cardMsgBtns = document.querySelectorAll('.btn-msg');
    var cardRemBtns = document.querySelectorAll('.btn-rem');

    cardMsgBtns.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var card = this.closest('.resident-card');
            var name = card.dataset.name;
            openMessageModal(name);
        });
    });

    cardRemBtns.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var card = this.closest('.resident-card');
            var name = card.dataset.name;
            openRemoveModal(name, card);
        });
    });

    // Search / filter
    searchInput.addEventListener('input', function () {
        var term = this.value.toLowerCase();
        cards.forEach(function (card) {
            var name  = card.dataset.name.toLowerCase();
            var room  = card.dataset.room.toLowerCase();
            var block = card.dataset.block.toLowerCase();
            
            // Only toggle display if it wasn't removed 
            if(card.style.display !== 'none' || card.dataset.removed !== 'true') {
                 card.style.display = (name.includes(term) || room.includes(term) || block.includes(term)) ? '' : 'none';
            }
        });
    });
});
