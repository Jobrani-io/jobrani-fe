import DesignModule from "./DesignModule";

const BulkSendModule = () => {
  const handleSaveWorkflow = () => {
    // Handle save workflow without waitlist popup
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <DesignModule />
      </div>
    </div>
  );
};

export default BulkSendModule;
