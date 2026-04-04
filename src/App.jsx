import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Categories } from './pages/Categories';
import { Savings } from './pages/Savings';
import { Charts } from './pages/Charts';
import { Accounts } from './pages/Accounts';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="categories" element={<Categories />} />
        <Route path="savings" element={<Savings />} />
        <Route path="charts" element={<Charts />} />
        <Route path="accounts" element={<Accounts />} />
      </Route>
    </Routes>
  );
}

export default App;
