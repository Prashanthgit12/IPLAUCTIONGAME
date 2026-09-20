// Format monetary values in INR Crores / Lakhs
export const formatPurse = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0.00';
  }

  const num = Number(amount);
  if (num >= 10000000) {
    // 1 Crore = 10,000,000
    const cr = num / 10000000;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Cr`;
  } else if (num >= 100000) {
    // 1 Lakh = 100,000
    const l = num / 100000;
    return `₹${l % 1 === 0 ? l.toFixed(0) : l.toFixed(2)} L`;
  } else {
    return `₹${num.toLocaleString('en-IN')}`;
  }
};

export const formatCrore = formatPurse;

export const getRoleName = (role) => {
  switch (role) {
    case 'BATTER':
      return 'Batter';
    case 'BOWLER':
      return 'Bowler';
    case 'ALL_ROUNDER':
      return 'All-Rounder';
    case 'WICKET_KEEPER':
      return 'Wicket-Keeper';
    default:
      return role || 'Cricket Player';
  }
};

export const getRoleBadgeClass = (role) => {
  switch (role) {
    case 'BATTER':
      return 'badge-batter';
    case 'BOWLER':
      return 'badge-bowler';
    case 'ALL_ROUNDER':
      return 'badge-allrounder';
    case 'WICKET_KEEPER':
      return 'badge-keeper';
    default:
      return 'badge-batter';
  }
};

export const getStatusBadge = (status) => {
  switch (status) {
    case 'SOLD':
      return { className: 'status-sold', label: 'SOLD' };
    case 'UNSOLD':
      return { className: 'status-unsold', label: 'UNSOLD' };
    case 'IN_AUCTION':
      return { className: 'status-inauction', label: 'ON BLOCK' };
    case 'AVAILABLE':
    default:
      return { className: 'status-available', label: 'AVAILABLE' };
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};
