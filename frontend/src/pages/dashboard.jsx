import React, { useEffect } from 'react';
import { useCurrentUser } from '../auth/hooks/use.current';
const stats = [
  ['Today Revenue', '$2,580', '+12.5%', '↗'],
  ['Due Invoice', '$1,240', '8 invoices', '▣'],
  ['Due Purchase', '$3,860', '5 purchases', '◇'],
  ['Monthly Revenue', '$24,780', '+8.2%', '▥'],
];

export default function Dashboard() {
  const { user, getCurrentUser, isLoading } = useCurrentUser();

  useEffect(() => {
    getCurrentUser().catch(() => {
      // Keep the dashboard usable if the profile request fails.
    });
  }, [getCurrentUser]);

  const currentUserName = user?.name || user?.username || 'there';

  return (
    <>
      <section className="welcome"><div><h1>Welcome back, {isLoading ? '...' : currentUserName}!</h1><p>Here’s what’s happening with your store today.</p></div><button className="primary-button"><span aria-hidden="true">▤</span> Generate report</button></section>
      <section className="stats-grid">
        {stats.map(([label, value, change, icon], index) => <article className={`stat-card stat-card--${index + 1}`} key={label}><div className="stat-icon">{icon}</div><span>{label}</span><strong>{value}</strong><small><b>{change}</b>{index === 0 || index === 3 ? ' from last month' : ' awaiting payment'}</small></article>)}
      </section>
      <section className="dashboard-grid">
        <article className="panel sales-panel"><div className="panel-heading"><div><h2>Sales overview</h2><p>Your sales performance this week</p></div><button>This week⌄</button></div><div className="chart"><div className="chart-lines"><i/><i/><i/><i/></div><svg viewBox="0 0 700 180" preserveAspectRatio="none"><defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5b5ce2" stopOpacity=".25"/><stop offset="1" stopColor="#5b5ce2" stopOpacity="0"/></linearGradient></defs><path className="area" d="M0 145 C80 130 90 75 175 95 S270 145 350 82 S430 45 510 70 S610 35 700 22 V180 H0Z"/><path className="line" d="M0 145 C80 130 90 75 175 95 S270 145 350 82 S430 45 510 70 S610 35 700 22"/></svg><div className="chart-days"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></div></article>
        <article className="panel"><div className="panel-heading"><div><h2>Top products</h2><p>Best sellers this month</p></div><button>•••</button></div>{['Wireless headphones','Leather backpack','Smart watch','Running shoes'].map((item, index) => <div className="product-row" key={item}><span className={`product-image color-${index}`}>{['🎧','🎒','⌚','👟'][index]}</span><div><strong>{item}</strong><small>{[246,198,174,151][index]} sold</small></div><b>${['12,300','9,702','8,526','7,248'][index]}</b></div>)}</article>
      </section>
    </>
  );
}
