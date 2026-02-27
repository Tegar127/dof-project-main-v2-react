window.loginApp = function() {
    return {
        email: '',
        password: '',
        error: '',
        loading: false,

        async handleSubmit() {
            this.loading = true;
            this.error = '';

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        email: this.email,
                        password: this.password
                    })
                });

                const result = await response.json();

                if (result.success && result.user) {
                    // Store user data and token in localStorage
                    localStorage.setItem('dof_user', JSON.stringify(result.user));
                    localStorage.setItem('dof_token', result.token);
                    
                    // Redirect based on role
                    if (result.user.role === 'admin') {
                        window.location.href = '/admin';
                    } else {
                        window.location.href = '/dashboard';
                    }
                } else {
                    this.error = result.message || 'Invalid credentials';
                    this.loading = false;
                }
            } catch (err) {
                this.error = 'An unexpected error occurred';
                this.loading = false;
            }
        }
    }
}
