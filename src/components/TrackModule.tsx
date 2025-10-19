import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  CalendarDays,
  TrendingUp,
  Users,
  MessageSquare,
  Reply,
  Mail,
  MailOpen,
  ChevronDown,
  BarChart3,
  Database,
  FileText
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from 'recharts';


// Sample data for the chart
const chartData = [
  { date: 'Jan 15', connections: 45, emails: 32, applications: 8 },
  { date: 'Jan 16', connections: 52, emails: 38, applications: 11 },
  { date: 'Jan 17', connections: 61, emails: 42, applications: 14 },
  { date: 'Jan 18', connections: 48, emails: 35, applications: 9 },
  { date: 'Jan 19', connections: 67, emails: 51, applications: 16 },
  { date: 'Jan 20', connections: 71, emails: 48, applications: 13 },
  { date: 'Jan 21', connections: 59, emails: 44, applications: 12 },
];

// Sample metrics data
const metricsData = [
  {
    id: 'connections-sent',
    title: 'Connections Sent',
    value: 342,
    change: '+12%',
    icon: Users,
    color: 'hsl(217 91% 60%)', // secondary color
    bgColor: 'hsl(217 91% 60% / 0.1)'
  },
  {
    id: 'connections-accepted',
    title: 'Connections Accepted',
    value: 187,
    change: '54.7%',
    icon: TrendingUp,
    color: 'hsl(142 76% 36%)', // green
    bgColor: 'hsl(142 76% 36% / 0.1)'
  },
  {
    id: 'emails-sent',
    title: 'Emails Sent',
    value: 298,
    change: '+8%',
    icon: MessageSquare,
    color: 'hsl(14 90% 55%)', // primary color
    bgColor: 'hsl(14 90% 55% / 0.1)'
  },
  {
    id: 'email-replies',
    title: 'Email Replies',
    value: 124,
    change: '41.6%',
    icon: Reply,
    color: 'hsl(262 90% 50%)', // purple
    bgColor: 'hsl(262 90% 50% / 0.1)'
  },
  {
    id: 'applications-sent',
    title: 'Applications Sent',
    value: 73,
    change: '+22%',
    icon: FileText,
    color: 'hsl(45 93% 58%)', // yellow
    bgColor: 'hsl(45 93% 58% / 0.1)'
  },
  {
    id: 'application-responses',
    title: 'Application Responses',
    value: 28,
    change: '38.4%',
    icon: FileText,
    color: 'hsl(38 92% 50%)', // orange
    bgColor: 'hsl(38 92% 50% / 0.1)'
  }
];

interface TrackModuleProps {
  triggerWaitlistPopup?: () => void;
}

const TrackModule = ({ triggerWaitlistPopup }: TrackModuleProps) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2024, 0, 15),
    to: new Date(2024, 0, 21),
  });

  return (
    <div className="space-y-6">
      
      
      {/* Analytics Content */}
      <div className="space-y-6">
          {/* Filter Controls */}
          <Card className="border shadow-card">
            <CardContent className="p-6">
              <div className="max-w-md">
                {/* Date Range Picker */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Date Range</label>
                  <Popover>
                    <PopoverTrigger asChild>
                       <Button
                         variant="outline"
                         onClick={() => triggerWaitlistPopup?.()}
                         className={cn(
                           "w-full justify-start text-left font-normal",
                           !dateRange && "text-muted-foreground"
                         )}
                       >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} -{" "}
                              {format(dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metricsData.map((metric) => {
              const Icon = metric.icon;
              return (
                <Card key={metric.id} className="border shadow-card hover:shadow-elegant transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-3xl font-bold text-foreground">{metric.value.toLocaleString()}</p>
                          <span 
                            className="text-sm font-medium px-2 py-1 rounded-full"
                            style={{
                              color: metric.color,
                              backgroundColor: metric.bgColor
                            }}
                          >
                            {metric.change}
                          </span>
                        </div>
                      </div>
                      <div 
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: metric.bgColor }}
                      >
                        <Icon 
                          className="h-6 w-6" 
                          style={{ color: metric.color }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Chart Section */}
          <Card className="border shadow-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Performance Trends</CardTitle>
              <p className="text-sm text-muted-foreground">Track your outreach activities over time</p>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="connectionsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="emailsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(14 90% 55%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(14 90% 55%)" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="applicationsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(45 93% 58%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(45 93% 58%)" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: 'var(--shadow-card)'
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="connections"
                      stackId="1"
                      stroke="hsl(217 91% 60%)"
                      fill="url(#connectionsGradient)"
                      fillOpacity={1}
                      strokeWidth={2}
                      name="Connections"
                    />
                    <Area
                      type="monotone"
                      dataKey="emails"
                      stackId="1"
                      stroke="hsl(14 90% 55%)"
                      fill="url(#emailsGradient)"
                      fillOpacity={1}
                      strokeWidth={2}
                      name="Emails"
                    />
                    <Area
                      type="monotone"
                      dataKey="applications"
                      stackId="1"
                      stroke="hsl(45 93% 58%)"
                      fill="url(#applicationsGradient)"
                      fillOpacity={1}
                      strokeWidth={2}
                      name="Applications"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
};

export default TrackModule;