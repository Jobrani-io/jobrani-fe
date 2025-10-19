
import { Users, TrendingUp, MessageCircle, UserPlus, Clock, Mail, GitBranch, BarChart, Play, Settings, MoreHorizontal, Pause, Bell } from "lucide-react";

const HeroDashboard = () => {
  return (
    <div className="w-full mx-auto p-3 sm:p-4 md:p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-card border border-white/20 relative overflow-hidden">
      {/* App-like Toolbar Header */}
        <div className="flex items-center mb-8 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-medium text-gray-700">Bay Area CEOs - Series B+</h3>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
      
      {/* Workflow Cards */}
      <div className="flex flex-col gap-3 mb-6 lg:items-center">
        
        {/* Connection Request Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 w-full max-w-sm lg:max-w-md">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded font-medium w-fit">Trigger</span>
            <h4 className="font-semibold text-gray-900 text-sm">Send Connection</h4>
          </div>
        </div>
        
        {/* Wait for Response Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 w-full max-w-sm lg:max-w-md">
          <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded font-medium w-fit">Wait</span>
            <h4 className="font-semibold text-gray-900 text-sm">1 Day</h4>
          </div>
        </div>
        
        {/* Branch Labels and Action Cards */}
        <div className="w-full max-w-sm lg:max-w-md">
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
            <div className="flex flex-col gap-2">
              <span className="text-xs text-gray-500 text-center">If no response</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-gray-500 text-center">If accepted</span>
            </div>
          </div>
          
          {/* Action Cards */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {/* Send InMail Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-1.5 sm:p-3 flex items-center gap-1.5 sm:gap-3 min-w-0">
              <div className="w-7 sm:w-10 h-7 sm:h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
              </div>
              <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
                <span className="bg-green-100 text-green-700 text-xs px-1 sm:px-2 py-0.5 rounded font-medium w-fit">Action</span>
                <h4 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                  <span className="sm:hidden">InMail</span>
                  <span className="hidden sm:inline">Send InMail</span>
                </h4>
              </div>
            </div>

            {/* Notify Me Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-1.5 sm:p-3 flex items-center gap-1.5 sm:gap-3 min-w-0">
              <div className="w-7 sm:w-10 h-7 sm:h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
              </div>
              <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
                <span className="bg-purple-100 text-purple-700 text-xs px-1 sm:px-2 py-0.5 rounded font-medium w-fit">Action</span>
                <h4 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                  <span className="sm:hidden">Notify</span>
                  <span className="hidden sm:inline">Notify Me</span>
                </h4>
              </div>
            </div>
          </div>
        </div>
        
      </div>
      
      {/* Bottom Action Bar */}
      <div className="p-2 sm:p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-1 sm:gap-2">
            <button className="px-1.5 sm:px-3 py-1.5 sm:py-2 bg-white border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1 sm:gap-2 min-w-0">
              <Pause className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
              <span className="truncate">Pause</span>
            </button>
            <button className="px-1.5 sm:px-3 py-1.5 sm:py-2 bg-white border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1 sm:gap-2 min-w-0">
              <Settings className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
              <span className="truncate">Edit</span>
            </button>
            <button className="px-1.5 sm:px-3 py-1.5 sm:py-2 bg-white border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1 sm:gap-2 min-w-0">
              <Users className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline md:hidden truncate">View</span>
              <span className="hidden md:inline truncate">View List</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroDashboard;
