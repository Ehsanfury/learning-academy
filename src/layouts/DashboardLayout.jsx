import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '@components/Sidebar';
import Navbar from '@components/Navbar';
import BottomNav from '@components/BottomNav';

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Sidebar - Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="lg:pr-[280px]">
        {/* Top Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="pt-16 pb-24 lg:pb-8">
          <motion.div
            className="px-4 py-6 lg:px-8 lg:py-8 lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl lg:mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile */}
      <BottomNav />
    </div>
  );
}

export default DashboardLayout;