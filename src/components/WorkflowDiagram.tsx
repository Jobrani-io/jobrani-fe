import { ArrowRight, UserPlus, Clock, Mail, Bell, CheckCircle, XCircle, Zap } from "lucide-react";

const WorkflowDiagram = () => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-card border border-white/20 relative">
      <div className="relative">
        {/* Start Node */}
        <div className="flex flex-col items-center mb-4">
          <div className="bg-primary/10 text-primary border-2 border-primary px-8 py-4 rounded-lg flex items-center gap-3 animate-fade-in min-w-[200px] justify-center">
            <Zap className="w-5 h-5" />
            <span className="font-medium">Start Campaign</span>
          </div>
        </div>
        
        {/* Arrow down */}
        <div className="flex justify-center mb-4">
          <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
        </div>
        
        {/* Send Connection */}
        <div className="flex flex-col items-center mb-5">
          <div className="bg-blue-50 text-blue-700 border-2 border-blue-200 px-8 py-4 rounded-lg flex items-center gap-3 animate-fade-in min-w-[200px] justify-center">
            <UserPlus className="w-5 h-5" />
            <span className="font-medium">Send Connection</span>
          </div>
        </div>
        
        {/* Simple arrows down to each branch */}
        <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-4">
          <div className="flex justify-center">
            <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
          </div>
          <div className="flex justify-center">
            <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
          </div>
        </div>
        
        {/* Branches */}
        <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-4">
          {/* Accepted Branch */}
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1 mb-4">
              <CheckCircle className="w-4 h-4" />
              Accepted
            </div>
            
            <div className="bg-green-50 text-green-700 border-2 border-green-200 px-4 sm:px-8 py-3 sm:py-4 rounded-lg flex items-center gap-2 sm:gap-3 min-w-[150px] sm:min-w-[200px] justify-center">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <div className="font-medium text-xs sm:text-sm">Notify Me</div>
            </div>
          </div>
          
          {/* Not Accepted Branch */}
          <div className="flex flex-col items-center space-y-3">
            <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1 mb-2">
              <XCircle className="w-4 h-4" />
              Not Accepted
            </div>
            
            <div className="bg-orange-50 text-orange-700 border-2 border-orange-200 px-4 sm:px-8 py-3 sm:py-4 rounded-lg flex items-center gap-2 sm:gap-3 min-w-[150px] sm:min-w-[200px] justify-center">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              <div className="font-medium text-xs sm:text-sm">Wait 1 Day</div>
            </div>
            
            <div className="flex justify-center my-2">
              <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
            </div>
            
            <div className="bg-blue-50 text-blue-700 border-2 border-blue-200 px-4 sm:px-8 py-3 sm:py-4 rounded-lg flex items-center gap-2 sm:gap-3 min-w-[150px] sm:min-w-[200px] justify-center">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              <div className="font-medium text-xs sm:text-sm">Send InMail</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDiagram;
