// Deadline Manager Component
window.deadlineManager = function (deadline = null) {
    return {
        deadline: deadline,
        timeRemaining: null,
        isOverdue: false,
        updateInterval: null,

        init() {
            this.calculateTimeRemaining();

            // Update every minute
            this.updateInterval = setInterval(() => {
                this.calculateTimeRemaining();
            }, 60000);
        },

        setDeadline(newDeadline) {
            this.deadline = newDeadline;
            this.calculateTimeRemaining();
        },

        destroy() {
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
            }
        },

        calculateTimeRemaining() {
            if (!this.deadline) {
                this.timeRemaining = null;
                this.isOverdue = false;
                return;
            }

            const now = new Date();
            const deadlineDate = new Date(this.deadline);
            const diff = deadlineDate - now;

            if (diff < 0) {
                this.isOverdue = true;
                this.timeRemaining = this.formatOverdue(Math.abs(diff));
            } else {
                this.isOverdue = false;
                this.timeRemaining = this.formatRemaining(diff);
            }
        },

        formatRemaining(ms) {
            const days = Math.floor(ms / (1000 * 60 * 60 * 24));
            const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

            if (days > 0) {
                return `${days} hari ${hours} jam`;
            } else if (hours > 0) {
                return `${hours} jam ${minutes} menit`;
            } else {
                return `${minutes} menit`;
            }
        },

        formatOverdue(ms) {
            const days = Math.floor(ms / (1000 * 60 * 60 * 24));
            const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

            if (days > 0) {
                return `${days} hari yang lalu`;
            } else if (hours > 0) {
                return `${hours} jam yang lalu`;
            } else {
                return `Baru saja`;
            }
        },

        getDeadlineColor() {
            if (!this.deadline) return 'bg-slate-100 text-slate-600';

            if (this.isOverdue) {
                return 'bg-red-100 text-red-700 border-red-200';
            }

            const now = new Date();
            const deadlineDate = new Date(this.deadline);
            const diff = deadlineDate - now;
            const daysRemaining = diff / (1000 * 60 * 60 * 24);

            if (daysRemaining < 1) {
                return 'bg-red-100 text-red-700 border-red-200';
            } else if (daysRemaining < 3) {
                return 'bg-amber-100 text-amber-700 border-amber-200';
            } else {
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            }
        },

        formatDeadlineDate() {
            if (!this.deadline) return '-';

            const date = new Date(this.deadline);
            return date.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }
}
