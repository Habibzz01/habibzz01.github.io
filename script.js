// Theme Toggle
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check for saved theme preference or default to light
    const currentTheme = localStorage.getItem('theme') || 'light';
    body.setAttribute('data-theme', currentTheme);
    
    // Update theme toggle icon
    if (currentTheme === 'dark') {
        themeToggle.classList.remove('fa-moon');
        themeToggle.classList.add('fa-sun');
    } else if (currentTheme === 'amoled') {
        themeToggle.classList.remove('fa-moon');
        themeToggle.classList.add('fa-sun');
    } else {
        themeToggle.classList.remove('fa-sun');
        themeToggle.classList.add('fa-moon');
    }
    
    // Toggle theme
    themeToggle.addEventListener('click', function() {
        const currentTheme = body.getAttribute('data-theme');
        let newTheme;
        
        if (currentTheme === 'light') {
            newTheme = 'dark';
        } else if (currentTheme === 'dark') {
            newTheme = 'amoled';
        } else {
            newTheme = 'light';
        }
        
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update theme toggle icon
        if (newTheme === 'dark' || newTheme === 'amoled') {
            themeToggle.classList.remove('fa-moon');
            themeToggle.classList.add('fa-sun');
        } else {
            themeToggle.classList.remove('fa-sun');
            themeToggle.classList.add('fa-moon');
        }
    });
});

// Authentication Functions
function handleLogin() {
    const loginForm = document.getElementById('login-form');
    const googleLoginBtn = document.getElementById('google-login');
    const loginError = document.getElementById('login-error');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Show loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            submitBtn.disabled = true;
            
            // Sign in with email and password
            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Get user IP address
                    getUserIP().then(ip => {
                        // Save login info to database
                        const userRef = db.ref('users/' + userCredential.user.uid);
                        userRef.child('loginInfo').push({
                            timestamp: firebase.database.ServerValue.TIMESTAMP,
                            ip: ip
                        });
                    });
                    
                    // Redirect to dashboard
                    window.location.href = 'dashboard.html';
                })
                .catch((error) => {
                    // Handle errors
                    loginError.textContent = error.message;
                    loginError.style.display = 'block';
                    
                    // Reset button
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                });
        });
    }
    
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', function() {
            const provider = new firebase.auth.GoogleAuthProvider();
            
            // Show loading state
            const originalText = googleLoginBtn.innerHTML;
            googleLoginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
            googleLoginBtn.disabled = true;
            
            auth.signInWithPopup(provider)
                .then((result) => {
                    // Get user IP address
                    getUserIP().then(ip => {
                        // Save login info to database
                        const userRef = db.ref('users/' + result.user.uid);
                        userRef.child('loginInfo').push({
                            timestamp: firebase.database.ServerValue.TIMESTAMP,
                            ip: ip
                        });
                        
                        // Check if user exists in database
                        userRef.once('value').then((snapshot) => {
                            if (!snapshot.exists()) {
                                // Create new user record
                                userRef.set({
                                    uid: result.user.uid,
                                    displayName: result.user.displayName,
                                    email: result.user.email,
                                    photoURL: result.user.photoURL,
                                    createdAt: firebase.database.ServerValue.TIMESTAMP
                                });
                            }
                        });
                    });
                    
                    // Redirect to dashboard
                    window.location.href = 'dashboard.html';
                })
                .catch((error) => {
                    // Handle errors
                    loginError.textContent = error.message;
                    loginError.style.display = 'block';
                    
                    // Reset button
                    googleLoginBtn.innerHTML = originalText;
                    googleLoginBtn.disabled = false;
                });
        });
    }
}

function handleRegister() {
    const registerForm = document.getElementById('register-form');
    const googleRegisterBtn = document.getElementById('google-register');
    const registerError = document.getElementById('register-error');
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Validate passwords match
            if (password !== confirmPassword) {
                registerError.textContent = 'Passwords do not match.';
                registerError.style.display = 'block';
                return;
            }
            
            // Show loading state
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
            submitBtn.disabled = true;
            
            // Create user with email and password
            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Update user profile
                    return userCredential.user.updateProfile({
                        displayName: fullname
                    }).then(() => {
                        // Get user IP address
                        return getUserIP().then(ip => {
                            // Save user info to database
                            const userRef = db.ref('users/' + userCredential.user.uid);
                            userRef.set({
                                uid: userCredential.user.uid,
                                displayName: fullname,
                                email: email,
                                createdAt: firebase.database.ServerValue.TIMESTAMP,
                                registrationIP: ip
                            });
                            
                            // Redirect to dashboard
                            window.location.href = 'dashboard.html';
                        });
                    });
                })
                .catch((error) => {
                    // Handle errors
                    registerError.textContent = error.message;
                    registerError.style.display = 'block';
                    
                    // Reset button
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                });
        });
    }
    
    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener('click', function() {
            const provider = new firebase.auth.GoogleAuthProvider();
            
            // Show loading state
            const originalText = googleRegisterBtn.innerHTML;
            googleRegisterBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
            googleRegisterBtn.disabled = true;
            
            auth.signInWithPopup(provider)
                .then((result) => {
                    // Get user IP address
                    getUserIP().then(ip => {
                        // Save user info to database
                        const userRef = db.ref('users/' + result.user.uid);
                        userRef.once('value').then((snapshot) => {
                            if (!snapshot.exists()) {
                                // Create new user record
                                userRef.set({
                                    uid: result.user.uid,
                                    displayName: result.user.displayName,
                                    email: result.user.email,
                                    photoURL: result.user.photoURL,
                                    createdAt: firebase.database.ServerValue.TIMESTAMP,
                                    registrationIP: ip
                                });
                            }
                        });
                    });
                    
                    // Redirect to dashboard
                    window.location.href = 'dashboard.html';
                })
                .catch((error) => {
                    // Handle errors
                    registerError.textContent = error.message;
                    registerError.style.display = 'block';
                    
                    // Reset button
                    googleRegisterBtn.innerHTML = originalText;
                    googleRegisterBtn.disabled = false;
                });
        });
    }
}

function handleForgotPassword() {
    const resetForm = document.getElementById('reset-form');
    const resetError = document.getElementById('reset-error');
    const resetSuccess = document.getElementById('reset-success');
    
    if (resetForm) {
        resetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            
            // Show loading state
            const submitBtn = resetForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            // Send password reset email
            auth.sendPasswordResetEmail(email)
                .then(() => {
                    // Show success message
                    resetSuccess.textContent = 'Password reset email sent. Check your inbox.';
                    resetSuccess.style.display = 'block';
                    resetError.style.display = 'none';
                    
                    // Reset form
                    resetForm.reset();
                    
                    // Reset button
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                })
                .catch((error) => {
                    // Handle errors
                    resetError.textContent = error.message;
                    resetError.style.display = 'block';
                    resetSuccess.style.display = 'none';
                    
                    // Reset button
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                });
        });
    }
}

function handleLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            auth.signOut().then(() => {
                // Redirect to home page
                window.location.href = 'index.html';
            }).catch((error) => {
                console.error('Logout error:', error);
            });
        });
    }
}

function handleProfile() {
    const editProfileForm = document.getElementById('edit-profile-form');
    const changePasswordForm = document.getElementById('change-password-form');
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const deleteAccountForm = document.getElementById('delete-account-form');
    const deleteAccountModal = document.getElementById('delete-account-modal');
    const closeModal = document.querySelector('.close');
    
    // Load user profile
    auth.onAuthStateChanged((user) => {
        if (user) {
            // Set profile information
            document.getElementById('profile-fullname').textContent = user.displayName || 'User Name';
            document.getElementById('profile-email').textContent = user.email;
            document.getElementById('user-name').textContent = user.displayName || 'User Name';
            
            // Set joined date
            const userRef = db.ref('users/' + user.uid);
            userRef.once('value').then((snapshot) => {
                const userData = snapshot.val();
                if (userData && userData.createdAt) {
                    const joinedDate = new Date(userData.createdAt);
                    document.getElementById('profile-joined').textContent = joinedDate.toLocaleDateString();
                }
            });
            
            // Set form values
            document.getElementById('edit-fullname').value = user.displayName || '';
            document.getElementById('edit-email').value = user.email || '';
            
            // Set profile avatar
            if (user.photoURL) {
                document.getElementById('profile-avatar').src = user.photoURL;
                document.querySelectorAll('.user-avatar').forEach(avatar => {
                    avatar.src = user.photoURL;
                });
            }
        }
    });
    
    // Edit profile form submission
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fullname = document.getElementById('edit-fullname').value;
            const email = document.getElementById('edit-email').value;
            
            // Show loading state
            const submitBtn = editProfileForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            submitBtn.disabled = true;
            
            // Update user profile
            auth.currentUser.updateProfile({
                displayName: fullname
            }).then(() => {
                // Update email if changed
                if (email !== auth.currentUser.email) {
                    return auth.currentUser.updateEmail(email);
                }
            }).then(() => {
                // Update database
                const userRef = db.ref('users/' + auth.currentUser.uid);
                userRef.update({
                    displayName: fullname,
                    email: email
                }).then(() => {
                    // Update UI
                    document.getElementById('profile-fullname').textContent = fullname;
                    document.getElementById('profile-email').textContent = email;
                    document.getElementById('user-name').textContent = fullname;
                    
                    // Reset button
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    
                    // Show success message
                    const successMsg = document.createElement('div');
                    successMsg.className = 'success-message';
                    successMsg.textContent = 'Profile updated successfully.';
                    editProfileForm.prepend(successMsg);
                    
                    // Remove success message after 3 seconds
                    setTimeout(() => {
                        successMsg.remove();
                    }, 3000);
                });
            }).catch((error) => {
                // Handle errors
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.textContent = error.message;
                editProfileForm.prepend(errorMsg);
                
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                // Remove error message after 5 seconds
                setTimeout(() => {
                    errorMsg.remove();
                }, 5000);
            });
        });
    }
    
    // Change password form submission
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmNewPassword = document.getElementById('confirm-new-password').value;
            const passwordError = document.getElementById('password-error');
            const passwordSuccess = document.getElementById('password-success');
            
            // Validate passwords match
            if (newPassword !== confirmNewPassword) {
                passwordError.textContent = 'New passwords do not match.';
                passwordError.style.display = 'block';
                passwordSuccess.style.display = 'none';
                return;
            }
            
            // Validate password strength
            if (newPassword.length < 6) {
                passwordError.textContent = 'Password must be at least 6 characters.';
                passwordError.style.display = 'block';
                passwordSuccess.style.display = 'none';
                return;
            }
            
            // Show loading state
            const submitBtn = changePasswordForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
            submitBtn.disabled = true;
            
            // Re-authenticate user
            const credential = firebase.auth.EmailAuthProvider.credential(
                auth.currentUser.email,
                currentPassword
            );
            
            auth.currentUser.reauthenticateWithCredential(credential)
                .then(() => {
                    // Update password
                    return auth.currentUser.updatePassword(newPassword);
                })
                .then(() => {
                    // Reset form
                    changePasswordForm.reset();
                    
                    // Show success message
                    passwordSuccess.textContent = 'Password updated successfully.';
                    passwordSuccess.style.display = 'block';
                    passwordError.style.display = 'none';
                    
                    // Reset button
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                })
                .catch((error) => {
                    // Handle errors
                    passwordError.textContent = error.message;
                    passwordError.style.display = 'block';
                    passwordSuccess.style.display = 'none';
                    
                    // Reset button
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                });
        });
    }
    
    // Delete account button
    if (deleteAccountBtn && deleteAccountModal) {
        deleteAccountBtn.addEventListener('click', function() {
            deleteAccountModal.style.display = 'flex';
        });
        
        // Close modal
        closeModal.addEventListener('click', function() {
            deleteAccountModal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === deleteAccountModal) {
                deleteAccountModal.style.display = 'none';
            }
        });
        
        // Delete account form submission
        if (deleteAccountForm) {
            deleteAccountForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const deleteConfirm = document.getElementById('delete-confirm').value;
                const deletePassword = document.getElementById('delete-password').value;
                
                // Validate confirmation text
                if (deleteConfirm !== 'DELETE') {
                    alert('Please type DELETE to confirm account deletion.');
                    return;
                }
                
                // Show loading state
                const submitBtn = deleteAccountForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
                submitBtn.disabled = true;
                
                // Re-authenticate user
                const credential = firebase.auth.EmailAuthProvider.credential(
                    auth.currentUser.email,
                    deletePassword
                );
                
                auth.currentUser.reauthenticateWithCredential(credential)
                    .then(() => {
                        // Delete user data from database
                        const userRef = db.ref('users/' + auth.currentUser.uid);
                        return userRef.remove();
                    })
                    .then(() => {
                        // Delete user account
                        return auth.currentUser.delete();
                    })
                    .then(() => {
                        // Redirect to home page
                        window.location.href = 'index.html';
                    })
                    .catch((error) => {
                        // Handle errors
                        alert('Error deleting account: ' + error.message);
                        
                        // Reset button
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    });
            });
        }
    }
}

function handleDashboard() {
    const createTrackerBtn = document.getElementById('create-tracker');
    const createTrackerModal = document.getElementById('create-tracker-modal');
    const createTrackerForm = document.getElementById('create-tracker-form');
    const closeModal = document.querySelector('.close');
    const trackersList = document.getElementById('trackers-list');
    const refreshLocationBtn = document.getElementById('refresh-location');
    const openMapBtn = document.getElementById('open-map');
    
    // Load user data
    auth.onAuthStateChanged((user) => {
        if (user) {
            // Set user name
            document.getElementById('user-name').textContent = user.displayName || 'User Name';
            
            // Set user avatar
            if (user.photoURL) {
                document.querySelectorAll('.user-avatar').forEach(avatar => {
                    avatar.src = user.photoURL;
                });
            }
            
            // Load trackers
            loadTrackers(user.uid);
            
            // Get current location
            getCurrentLocation();
        } else {
            // Redirect to login page if not authenticated
            window.location.href = 'login.html';
        }
    });
    
    // Create tracker button
    if (createTrackerBtn && createTrackerModal) {
        createTrackerBtn.addEventListener('click', function() {
            createTrackerModal.style.display = 'flex';
        });
        
        // Close modal
        closeModal.addEventListener('click', function() {
            createTrackerModal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === createTrackerModal) {
                createTrackerModal.style.display = 'none';
            }
        });
        
        // Create tracker form submission
        if (createTrackerForm) {
            createTrackerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const trackerName = document.getElementById('tracker-name').value;
                const trackerDescription = document.getElementById('tracker-description').value;
                const expiryTime = document.getElementById('expiry-time').value;
                const redirectUrl = document.getElementById('redirect-url').value;
                
                // Show loading state
                const submitBtn = createTrackerForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
                submitBtn.disabled = true;
                
                // Generate unique tracker ID
                const trackerId = generateTrackerId();
                
                // Calculate expiry time
                let expiryTimestamp = null;
                if (expiryTime !== '0') {
                    const now = new Date();
                    expiryTimestamp = new Date(now.getTime() + (expiryTime * 60 * 60 * 1000)).getTime();
                }
                
                // Get current location
                getCurrentLocationForTracker().then(location => {
                    // Save tracker to database
                    const trackerRef = db.ref('trackers/' + trackerId);
                    trackerRef.set({
                        uid: auth.currentUser.uid,
                        name: trackerName,
                        description: trackerDescription,
                        createdAt: firebase.database.ServerValue.TIMESTAMP,
                        expiresAt: expiryTimestamp,
                        redirectUrl: redirectUrl,
                        location: location
                    }).then(() => {
                        // Add tracker to user's tracker list
                        const userTrackersRef = db.ref('users/' + auth.currentUser.uid + '/trackers/' + trackerId);
                        userTrackersRef.set({
                            name: trackerName,
                            createdAt: firebase.database.ServerValue.TIMESTAMP,
                            expiresAt: expiryTimestamp
                        }).then(() => {
                            // Reset form
                            createTrackerForm.reset();
                            
                            // Close modal
                            createTrackerModal.style.display = 'none';
                            
                            // Reset button
                            submitBtn.innerHTML = originalText;
                            submitBtn.disabled = false;
                            
                            // Reload trackers
                            loadTrackers(auth.currentUser.uid);
                            
                            // Show success message
                            const successMsg = document.createElement('div');
                            successMsg.className = 'success-message';
                            successMsg.textContent = 'Tracker created successfully!';
                            document.querySelector('.dashboard-content').prepend(successMsg);
                            
                            // Remove success message after 3 seconds
                            setTimeout(() => {
                                successMsg.remove();
                            }, 3000);
                        });
                    }).catch((error) => {
                        // Handle errors
                        alert('Error creating tracker: ' + error.message);
                        
                        // Reset button
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    });
                }).catch((error) => {
                    // Handle location errors
                    alert('Error getting location: ' + error.message);
                    
                    // Reset button
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                });
            });
        }
    }
    
    // Refresh location button
    if (refreshLocationBtn) {
        refreshLocationBtn.addEventListener('click', function() {
            getCurrentLocation();
        });
    }
    
    // Open map button
    if (openMapBtn) {
        openMapBtn.addEventListener('click', function() {
            const latitude = document.getElementById('latitude').textContent;
            const longitude = document.getElementById('longitude').textContent;
            
            if (latitude !== '-' && longitude !== '-') {
                // Open in Google Maps
                const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
                window.open(url, '_blank');
            }
        });
    }
    
    // Function to load trackers
    function loadTrackers(uid) {
        if (!trackersList) return;
        
        const userTrackersRef = db.ref('users/' + uid + '/trackers');
        userTrackersRef.once('value').then((snapshot) => {
            const trackers = snapshot.val();
            
            if (trackers) {
                // Clear trackers list
                trackersList.innerHTML = '';
                
                // Add each tracker to the list
                Object.keys(trackers).forEach(trackerId => {
                    const tracker = trackers[trackerId];
                    
                    // Create tracker item
                    const trackerItem = document.createElement('div');
                    trackerItem.className = 'tracker-item';
                    
                    // Create tracker info
                    const trackerInfo = document.createElement('div');
                    trackerInfo.className = 'tracker-info';
                    
                    const trackerName = document.createElement('h3');
                    trackerName.textContent = tracker.name;
                    
                    const trackerMeta = document.createElement('div');
                    trackerMeta.className = 'tracker-meta';
                    
                    const createdDate = new Date(tracker.createdAt);
                    trackerMeta.innerHTML = `
                        <span>Created: ${createdDate.toLocaleDateString()}</span>
                        ${tracker.expiresAt ? `<span>Expires: ${new Date(tracker.expiresAt).toLocaleDateString()}</span>` : '<span>Never expires</span>'}
                    `;
                    
                    trackerInfo.appendChild(trackerName);
                    trackerInfo.appendChild(trackerMeta);
                    
                    // Create tracker actions
                    const trackerActions = document.createElement('div');
                    trackerActions.className = 'tracker-actions';
                    
                    const copyLinkBtn = document.createElement('button');
                    copyLinkBtn.className = 'btn-icon-sm';
                    copyLinkBtn.innerHTML = '<i class="fas fa-link"></i>';
                    copyLinkBtn.title = 'Copy Link';
                    copyLinkBtn.addEventListener('click', function() {
                        const trackerUrl = `${window.location.origin}/red.html?id=${trackerId}`;
                        navigator.clipboard.writeText(trackerUrl).then(() => {
                            // Show tooltip
                            const originalTitle = copyLinkBtn.title;
                            copyLinkBtn.title = 'Copied!';
                            setTimeout(() => {
                                copyLinkBtn.title = originalTitle;
                            }, 2000);
                        });
                    });
                    
                    const viewBtn = document.createElement('button');
                    viewBtn.className = 'btn-icon-sm';
                    viewBtn.innerHTML = '<i class="fas fa-eye"></i>';
                    viewBtn.title = 'View';
                    viewBtn.addEventListener('click', function() {
                        window.open(`red.html?id=${trackerId}`, '_blank');
                    });
                    
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'btn-icon-sm';
                    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                    deleteBtn.title = 'Delete';
                    deleteBtn.addEventListener('click', function() {
                        if (confirm('Are you sure you want to delete this tracker?')) {
                            // Delete tracker from database
                            const trackerRef = db.ref('trackers/' + trackerId);
                            trackerRef.remove().then(() => {
                                // Remove from user's tracker list
                                const userTrackerRef = db.ref('users/' + uid + '/trackers/' + trackerId);
                                userTrackerRef.remove().then(() => {
                                    // Reload trackers
                                    loadTrackers(uid);
                                });
                            }).catch((error) => {
                                alert('Error deleting tracker: ' + error.message);
                            });
                        }
                    });
                    
                    trackerActions.appendChild(copyLinkBtn);
                    trackerActions.appendChild(viewBtn);
                    trackerActions.appendChild(deleteBtn);
                    
                    // Add to tracker item
                    trackerItem.appendChild(trackerInfo);
                    trackerItem.appendChild(trackerActions);
                    
                    // Add to trackers list
                    trackersList.appendChild(trackerItem);
                });
            } else {
                // Show empty state
                trackersList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-map-marked-alt"></i>
                        <p>You don't have any trackers yet. Create one to get started!</p>
                    </div>
                `;
            }
        }).catch((error) => {
            console.error('Error loading trackers:', error);
        });
    }
    
    // Function to get current location
    function getCurrentLocation() {
        const mapLoading = document.getElementById('map-loading');
        const mapError = document.getElementById('map-error');
        const mapContent = document.getElementById('map-content');
        
        if (!mapLoading || !mapError || !mapContent) return;
        
        // Show loading
        mapLoading.style.display = 'flex';
        mapError.style.display = 'none';
        mapContent.style.display = 'none';
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Success
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    const accuracy = position.coords.accuracy;
                    
                    // Update UI
                    document.getElementById('latitude').textContent = latitude.toFixed(6);
                    document.getElementById('longitude').textContent = longitude.toFixed(6);
                    document.getElementById('accuracy').textContent = accuracy.toFixed(0);
                    document.getElementById('last-updated').textContent = new Date().toLocaleString();
                    
                    // Hide loading, show content
                    mapLoading.style.display = 'none';
                    mapContent.style.display = 'block';
                },
                (error) => {
                    // Error
                    let errorMessage = 'Error getting location: ';
                    
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage += 'Location access denied by user.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage += 'Location information is unavailable.';
                            break;
                        case error.TIMEOUT:
                            errorMessage += 'Location request timed out.';
                            break;
                        default:
                            errorMessage += 'An unknown error occurred.';
                            break;
                    }
                    
                    // Show error
                    mapError.textContent = errorMessage;
                    mapError.style.display = 'block';
                    mapLoading.style.display = 'none';
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            // Geolocation not supported
            mapError.textContent = 'Geolocation is not supported by this browser.';
            mapError.style.display = 'block';
            mapLoading.style.display = 'none';
        }
    }
    
    // Function to get current location for tracker
    function getCurrentLocationForTracker() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        // Success
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            accuracy: position.coords.accuracy,
                            timestamp: firebase.database.ServerValue.TIMESTAMP
                        });
                    },
                    (error) => {
                        // Error
                        reject(error);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    }
                );
            } else {
                // Geolocation not supported
                reject(new Error('Geolocation is not supported by this browser.'));
            }
        });
    }
    
    // Function to generate tracker ID
    function generateTrackerId() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        
        for (let i = 0; i < 10; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        
        return result;
    }
}

function handleRedirect() {
    // Get tracker ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const trackerId = urlParams.get('id');
    
    if (!trackerId) {
        // No tracker ID, redirect to home page
        window.location.href = 'index.html';
        return;
    }
    
    // Get tracker data
    const trackerRef = db.ref('trackers/' + trackerId);
    trackerRef.once('value').then((snapshot) => {
        const tracker = snapshot.val();
        
        if (!tracker) {
            // Tracker not found, redirect to 404 page
            window.location.href = '404.html';
            return;
        }
        
        // Check if tracker has expired
        if (tracker.expiresAt && tracker.expiresAt < Date.now()) {
            // Tracker has expired, redirect to 404 page
            window.location.href = '404.html';
            return;
        }
        
        // Update UI with tracker info
        document.getElementById('tracker-id').textContent = trackerId;
        
        if (tracker.location) {
            document.getElementById('location').textContent = `${tracker.location.latitude}, ${tracker.location.longitude}`;
            document.getElementById('accuracy').textContent = tracker.location.accuracy.toFixed(0);
        }
        
        // Get user IP address
        getUserIP().then(ip => {
            // Save visit to database
            const visitRef = trackerRef.child('visits').push();
            visitRef.set({
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                ip: ip,
                userAgent: navigator.userAgent
            });
        });
        
        // Redirect now button
        const redirectNowBtn = document.getElementById('redirect-now');
        if (redirectNowBtn && tracker.location) {
            redirectNowBtn.addEventListener('click', function() {
                // Open in map app
                const url = `https://www.google.com/maps?q=${tracker.location.latitude},${tracker.location.longitude}`;
                window.open(url, '_blank');
                
                // If redirect URL is specified, redirect after opening map
                if (tracker.redirectUrl) {
                    setTimeout(() => {
                        window.location.href = tracker.redirectUrl;
                    }, 1000);
                }
            });
        }
        
        // Auto redirect after 3 seconds
        setTimeout(() => {
            if (tracker.location) {
                // Open in map app
                const url = `https://www.google.com/maps?q=${tracker.location.latitude},${tracker.location.longitude}`;
                window.open(url, '_blank');
                
                // If redirect URL is specified, redirect after opening map
                if (tracker.redirectUrl) {
                    setTimeout(() => {
                        window.location.href = tracker.redirectUrl;
                    }, 1000);
                }
            }
        }, 3000);
        
        // Cancel redirect button
        const cancelRedirectBtn = document.getElementById('cancel-redirect');
        if (cancelRedirectBtn) {
            cancelRedirectBtn.addEventListener('click', function() {
                // If redirect URL is specified, redirect to it
                if (tracker.redirectUrl) {
                    window.location.href = tracker.redirectUrl;
                } else {
                    // Otherwise, redirect to home page
                    window.location.href = 'index.html';
                }
            });
        }
    }).catch((error) => {
        console.error('Error getting tracker:', error);
        window.location.href = '404.html';
    });
}

// Function to get user IP address
function getUserIP() {
    return fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => data.ip)
        .catch(error => {
            console.error('Error getting IP address:', error);
            return 'Unknown';
        });
}

// Initialize page-specific functions
document.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname;
    const pageName = currentPath.split('/').pop() || 'index.html';
    
    switch (pageName) {
        case 'login.html':
            handleLogin();
            break;
        case 'register.html':
            handleRegister();
            break;
        case 'forgot-password.html':
            handleForgotPassword();
            break;
        case 'dashboard.html':
            handleDashboard();
            break;
        case 'profil.html':
            handleProfile();
            break;
        case 'red.html':
            handleRedirect();
            break;
        default:
            // Check if user is logged in for pages that require authentication
            if (pageName === 'dashboard.html' || pageName === 'profil.html') {
                auth.onAuthStateChanged((user) => {
                    if (!user) {
                        window.location.href = 'login.html';
                    }
                });
            }
            break;
    }
    
    // Handle logout for all pages
    handleLogout();
    
    // Handle 404 redirect
    if (pageName !== '404.html') {
        // Check if page exists
        fetch(pageName, { method: 'HEAD' })
            .then(response => {
                if (!response.ok) {
                    window.location.href = '404.html';
                }
            })
            .catch(error => {
                window.location.href = '404.html';
            });
    }
});