import { TestTube } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGlobalMockData } from "@/hooks/useGlobalMockData";

export const GlobalDevelopmentBar = () => {
  const { useMockData, toggleMockData } = useGlobalMockData();

  return (
    <Card className="border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TestTube className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Tutorial Mode</span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                useMockData
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {useMockData ? "Mock Data" : "Live Data"}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleMockData}
            className="text-xs"
          >
            {useMockData ? "Switch to Live Data" : "Switch to Mock Data"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};