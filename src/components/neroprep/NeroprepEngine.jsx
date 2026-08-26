import React from 'react';
import useInterviewStore from '../../store/interviewStore';
import InterviewRoom from './InterviewRoom';
import SelectionModule from './SelectionModule';
import ConfigurationModule from './ConfigurationModule';
import DeviceCheckModule from './DeviceCheckModule';
import CompletedModule from './CompletedModule';
import CodingRoom from './CodingRoom';

// This is the entry point for the Adaptive Mock Interview Module
function NeroprepEngine({ userEmail = 'guest', setActiveTab }) {
  const pipelineState = useInterviewStore((state) => state.pipelineState);
  const config = useInterviewStore((state) => state.config);
  const trackId = config?.trackId;

  switch (pipelineState) {
    case 'selection':
      return <SelectionModule setActiveTab={setActiveTab} />;
    case 'config':
      return <ConfigurationModule setActiveTab={setActiveTab} />;
    case 'device_check':
      return <DeviceCheckModule setActiveTab={setActiveTab} />;
    case 'live':
      if (trackId === 'dsa' || trackId === 'coding') {
        return (
          <CodingRoom
            config={config}
            onEndSession={(report) => {
              useInterviewStore.getState().endInterview(report);
            }}
          />
        );
      }
      return <InterviewRoom setActiveTab={setActiveTab} />;
    case 'completed':
      return <CompletedModule userEmail={userEmail} setActiveTab={setActiveTab} />;
    default:
      return <SelectionModule setActiveTab={setActiveTab} />;
  }
}

export default NeroprepEngine;
