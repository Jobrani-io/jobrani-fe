import React from "react";
import ProfileSetup from "./profile/ProfileSetup";
import EnhancedWorkflowBuilder from "./profile/EnhancedWorkflowBuilder";
import TargetRoles from "./profile/TargetRoles";
import LocationPreferences from "./profile/LocationPreferences";
import IndustryFocus from "./profile/IndustryFocus";
import { useDesignSettings } from "@/hooks/useDesignSettings";
import { useProfileData } from "@/hooks/useProfileData";

const DesignModule: React.FC = () => {
  const {
    selectedActions,
    useCustomOrder,
    actionOrder,
    mentionJobDirectly,
    updateSelectedActions,
    updateUseCustomOrder,
    updateActionOrder,
    updateMentionJobDirectly,
  } = useDesignSettings();

  const { profileData, updateProfile } = useProfileData();

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-none px-2 py-2 space-y-3">
        {/* Top Section - About You */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <ProfileSetup
            profileData={profileData}
            onProfileUpdate={updateProfile}
          />

          <EnhancedWorkflowBuilder
            profileData={profileData}
            selectedActions={selectedActions}
            useCustomOrder={useCustomOrder}
            actionOrder={actionOrder}
            mentionJobDirectly={mentionJobDirectly}
            onActionsChange={updateSelectedActions}
            onUseCustomOrderChange={updateUseCustomOrder}
            onActionOrderChange={updateActionOrder}
            onMentionJobDirectlyChange={updateMentionJobDirectly}
            onProfileUpdate={updateProfile}
          />
        </div>

        {/* Bottom Section - Career Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <TargetRoles
            profileData={profileData}
            onProfileUpdate={updateProfile}
          />

          <LocationPreferences
            profileData={profileData}
            onProfileUpdate={updateProfile}
          />

          <IndustryFocus
            profileData={profileData}
            onProfileUpdate={updateProfile}
          />
        </div>
      </div>
    </div>
  );
};

export default DesignModule;
