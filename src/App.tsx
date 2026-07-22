import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import FarmRecords from "@/pages/FarmRecords";
import MilkProduction from "@/pages/MilkProduction";
import Inventory from "@/pages/Inventory";
import Leads from "@/pages/Leads";
import Tasks from "@/pages/Tasks";
import Reports from "@/pages/Reports";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="farm-records" element={<FarmRecords />} />
        <Route path="milk-production" element={<MilkProduction />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="leads" element={<Leads />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}

export default App;
