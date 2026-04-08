import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { motion } from 'framer-motion';
import { 
  Users, 
  BarChart3, 
  CheckSquare, 
  PlusCircle, 
  MessageSquare, 
  Utensils, 
  Package, 
  Settings,
  ArrowRight,
  TrendingUp,
  Calendar,
  ShieldCheck,
  CircleParking
} from 'lucide-react';

export function Dashboard() {
    const { user } = useAuth();

    const adminActions = [
        {
            title: "User Management",
            description: "Manage university accounts, roles, and permissions.",
            link: "/users",
            icon: Users,
            color: "bg-blue-500",
            textColor: "text-blue-600",
            lightBg: "bg-blue-50"
        },
        {
            title: "Event Analytics",
            description: "View engagement metrics, attendance, and growth patterns.",
            link: "/analytics",
            icon: BarChart3,
            color: "bg-indigo-500",
            textColor: "text-indigo-600",
            lightBg: "bg-indigo-50"
        },
        {
            title: "Approval Queue",
            description: "Review and approve pending event and food requests.",
            link: "/approvals",
            icon: CheckSquare,
            color: "bg-emerald-500",
            textColor: "text-emerald-600",
            lightBg: "bg-emerald-50"
        },
        {
            title: "Schedule Event",
            description: "Create new university events and notify students.",
            link: "/events/create",
            icon: PlusCircle,
            color: "bg-amber-500",
            textColor: "text-amber-600",
            lightBg: "bg-amber-50"
        },
        {
            title: "Feedback Hub",
            description: "Analyze student feedback and event sentiment.",
            link: "/admin/feedback",
            icon: MessageSquare,
            color: "bg-rose-500",
            textColor: "text-rose-600",
            lightBg: "bg-rose-50"
        },
        {
            title: "Food Orders",
            description: "Monitor live food court orders and transactions.",
            link: "/admin/food",
            icon: Utensils,
            color: "bg-orange-500",
            textColor: "text-orange-600",
            lightBg: "bg-orange-50"
        },
        {
            title: "Inventory",
            description: "Manage cafeteria stock and environmental scores.",
            link: "/admin/inventory",
            icon: Package,
            color: "bg-cyan-500",
            textColor: "text-cyan-600",
            lightBg: "bg-cyan-50"
        },
        {
            title: "Parking Logs",
            description: "Review zone occupancy and slot reservation trends.",
            link: "/admin/parking",
            icon: CircleParking,
            color: "bg-purple-500",
            textColor: "text-purple-600",
            lightBg: "bg-purple-50"
        },
        {
            title: "System Config",
            description: "Adjust platform settings and security policies.",
            link: "/profile",
            icon: Settings,
            color: "bg-slate-500",
            textColor: "text-slate-600",
            lightBg: "bg-slate-50"
        }
    ];

    const stats = [
        { label: "Active Users", value: "1,284", change: "+12%", icon: Users },
        { label: "Pending Approvals", value: "8", change: "-2", icon: CheckSquare },
        { label: "Event Engagement", value: "89%", change: "+5%", icon: TrendingUp }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Navbar />
            
            <main className="pt-28 px-4 pb-20">
                <div className="max-w-7xl mx-auto">
                    
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-indigo-600 font-bold text-sm uppercase tracking-wider">
                                <ShieldCheck size={16} />
                                <span>Organizer Dashboard</span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 mb-2">
                                Welcome back, {user?.name?.split(' ')[0] || 'Admin'}!
                            </h1>
                            <p className="text-slate-500 font-medium">
                                System Status: <span className="text-emerald-500 font-bold">Optimal</span> • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <Link 
                            to="/events/create" 
                            className="bg-amber-400 text-zinc-950 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-amber-300 transition-all shadow-lg shadow-amber-200 active:scale-95"
                        >
                            <PlusCircle size={20} />
                            Quick Setup Event
                        </Link>
                    </div>

                    {/* Stats Grid */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
                    >
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-slate-50 rounded-2xl text-slate-600 border border-slate-100">
                                        <stat.icon size={24} />
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        {stat.change}
                                    </span>
                                </div>
                                <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wide mb-1">{stat.label}</h3>
                                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                            </div>
                        ))}
                    </motion.div>

                    {/* Main Actions Grid */}
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                            Admin Command Center
                        </h2>
                    </div>

                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {adminActions.map((action, i) => (
                            <motion.div key={i} variants={itemVariants}>
                                <Link 
                                    to={action.link} 
                                    className="group block bg-white border border-slate-200 rounded-[2rem] p-8 h-full hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300 relative overflow-hidden active:scale-[0.98]"
                                >
                                    {/* Decorative background circle */}
                                    <div className={`absolute -right-4 -top-4 w-24 h-24 ${action.lightBg} rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500`}></div>
                                    
                                    <div className="relative z-10">
                                        <div className={`w-14 h-14 ${action.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3 group-hover:rotate-0 transition-transform duration-300`}>
                                            <action.icon size={28} />
                                        </div>
                                        
                                        <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                            {action.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
                                            {action.description}
                                        </p>
                                        
                                        <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                                            Access Module <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Recent Activity Mock (Optional future extension) */}
                    <div className="mt-16 bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-slate-900">Recent System Activity</h2>
                            <button className="text-amber-600 font-bold text-sm hover:text-amber-500 transition-colors">View All Logs</button>
                        </div>
                        <div className="space-y-6">
                            {[
                                { user: "Admin", action: "approved", target: "Tech Symposium 2026", time: "2 hours ago", color: "text-emerald-500" },
                                { user: "Stall 02", action: "updated", target: "Spicy Noodles stock", time: "4 hours ago", color: "text-blue-500" },
                                { user: "System", action: "blocked", target: "Malicious login attempt", time: "6 hours ago", color: "text-rose-500" }
                            ].map((log, i) => (
                                <div key={i} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 -mx-4 px-4 rounded-xl transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 text-xs">
                                            {log.user[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm lg:text-base">
                                                {log.user} <span className="font-medium text-slate-500">{log.action}</span> {log.target}
                                            </p>
                                            <p className="text-slate-400 text-xs mt-0.5">{log.time}</p>
                                        </div>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${log.color === 'text-emerald-500' ? 'bg-emerald-500' : log.color === 'text-blue-500' ? 'bg-blue-500' : 'bg-rose-500'}`}></div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

export default Dashboard;
