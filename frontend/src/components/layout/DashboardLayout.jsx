import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import CoinRewardPopup from './CoinRewardPopup';

const DashboardLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="min-h-screen bg-background text-foreground relative flex flex-col md:flex-row overflow-x-hidden">
            {/* Overlay for mobile when sidebar is open */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            
            <div className="flex-1 w-full md:ml-72 min-w-0 flex flex-col transition-all duration-300">
                <Topbar toggleSidebar={toggleSidebar} />
                <main className="px-3 py-4 sm:p-4 md:p-6 lg:p-8 w-full max-w-full overflow-x-hidden">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
            <CoinRewardPopup />
        </div>
    );
};

export default DashboardLayout;
