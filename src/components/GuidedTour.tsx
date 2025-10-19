import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, ChevronRight, SkipForward } from "lucide-react";
import { useGuidedTour, type TourStep } from "@/hooks/useGuidedTour";

interface GuidedTourProps {
  onNavigate: (moduleId: string) => void;
  activeModule: string;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({
  onNavigate,
  activeModule,
}) => {
  const {
    isActive,
    currentStep,
    currentStepIndex,
    nextStep,
    skipTour,
    finishTour,
    syncWithActiveModule,
  } = useGuidedTour();
  const [targetPosition, setTargetPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  // Calculate position of target element
  useEffect(() => {
    if (!isActive || !currentStep) return;

    let scrollTimeout: NodeJS.Timeout;

    const updatePosition = () => {
      // Handle multiple possible target IDs separated by |
      const targetIds = currentStep.targetId.split("|");
      let targetElement = null;

      // Try each target ID until we find one that exists and is visible
      for (const targetId of targetIds) {
        const element = document.getElementById(targetId.trim());
        if (element) {
          const rect = element.getBoundingClientRect();
          // Check if element is visible in viewport
          if (rect.width > 0 && rect.height > 0) {
            targetElement = element;
            break;
          }
        }
      }

      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setTargetPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      } else {
        // Enhanced fallback logic - try to find better fallback elements
        const fallbackSelectors = [
          ".generated-messages-table tbody tr:first-child", // First table row
          ".generated-messages-table", // Entire table
          '[data-module="write"]', // Write module container
          "#module-write", // Module container
        ];

        let fallbackElement = null;
        for (const selector of fallbackSelectors) {
          fallbackElement = document.querySelector(selector);
          if (fallbackElement) break;
        }

        if (fallbackElement) {
          const rect = fallbackElement.getBoundingClientRect();
          setTargetPosition({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          });
        } else {
          // Last resort - center of screen
          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;
          setTargetPosition({
            top: centerY - 100,
            left: centerX - 150,
            width: 300,
            height: 200,
          });
        }

        // Retry logic for dynamically loaded content
        const retryDelays = [100, 500, 1000];
        retryDelays.forEach((delay) => {
          setTimeout(() => {
            for (const targetId of targetIds) {
              const retryElement = document.getElementById(targetId.trim());
              if (retryElement) {
                const rect = retryElement.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                  setTargetPosition({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                  });
                  break;
                }
              }
            }
          }, delay);
        });
      }
    };

    // Debounced scroll handler
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updatePosition, 16); // ~60fps updates
    };

    updatePosition();
    // Add a small delay to ensure DOM is ready
    setTimeout(updatePosition, 100);

    // Add DOM mutation observer to handle dynamic content changes
    const observer = new MutationObserver(() => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updatePosition, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["id", "class"],
    });

    // Add event listeners
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(scrollTimeout);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, [isActive, currentStep]);

  // Sync tour step with active module changes
  useEffect(() => {
    if (isActive && activeModule) {
      syncWithActiveModule(activeModule);
    }
  }, [activeModule, isActive, syncWithActiveModule]);

  // Calculate popover position - always bottom right corner
  const getPopoverStyle = () => {
    return {
      position: "fixed" as const,
      bottom: "24px",
      right: "24px",
      zIndex: 9999999,
    };
  };

  const handleNext = () => {
    if (currentStep?.nextAction?.type === "navigate") {
      onNavigate(currentStep.nextAction.target);
    }
    nextStep();
  };

  const handleSkip = () => {
    skipTour();
  };

  const isLastStep = currentStepIndex === 4; // 5 steps total (0-4)

  if (!isActive || !currentStep) {
    return null;
  }

  return (
    <>
      {/* Highlight for target element */}
      {/* <div
        className="fixed border-2 border-primary rounded-lg bg-primary/10 z-50 pointer-events-none transition-all duration-300"
        style={{
          top: `${targetPosition.top - 4}px`,
          left: `${targetPosition.left - 4}px`,
          width: `${targetPosition.width + 8}px`,
          height: `${targetPosition.height + 8}px`,
        }}
      /> */}

      {/* Tour popover */}
      <Card
        className="w-80 shadow-lg border-primary/20"
        style={getPopoverStyle()}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-primary">
              {currentStep.title}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-sm text-foreground mb-4 leading-relaxed">
            {currentStep.content}
          </p>

          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              <SkipForward className="h-4 w-4 mr-1" />
              Skip Tour
            </Button>

            <Button
              onClick={isLastStep ? finishTour : handleNext}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              {isLastStep ? (
                "Finish Tour"
              ) : (
                <>
                  Next: Go to{" "}
                  {currentStep.nextAction?.target === "write"
                    ? "Write"
                    : currentStep.nextAction?.target === "match"
                    ? "Match"
                    : currentStep.nextAction?.target === "design"
                    ? "Design"
                    : currentStep.nextAction?.target === "apply"
                    ? "Apply"
                    : "Next"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Arrow pointing to target */}
      <div
        className="fixed z-50 pointer-events-none"
        style={{
          top:
            currentStep.position === "right"
              ? `${targetPosition.top + targetPosition.height / 2 - 6}px`
              : currentStep.position === "left"
              ? `${targetPosition.top + targetPosition.height / 2 - 6}px`
              : currentStep.position === "bottom"
              ? `${targetPosition.top + targetPosition.height}px`
              : `${targetPosition.top - 12}px`,
          left:
            currentStep.position === "right"
              ? `${targetPosition.left + targetPosition.width}px`
              : currentStep.position === "left"
              ? `${targetPosition.left - 12}px`
              : `${targetPosition.left + targetPosition.width / 2 - 6}px`,
        }}
      >
        <div
          className={`w-0 h-0 border-solid ${
            currentStep.position === "right"
              ? "border-l-0 border-r-8 border-t-6 border-b-6 border-r-primary border-t-transparent border-b-transparent"
              : currentStep.position === "left"
              ? "border-r-0 border-l-8 border-t-6 border-b-6 border-l-primary border-t-transparent border-b-transparent"
              : currentStep.position === "bottom"
              ? "border-b-0 border-t-8 border-l-6 border-r-6 border-t-primary border-l-transparent border-r-transparent"
              : "border-t-0 border-b-8 border-l-6 border-r-6 border-b-primary border-l-transparent border-r-transparent"
          }`}
        />
      </div>
    </>
  );
};
