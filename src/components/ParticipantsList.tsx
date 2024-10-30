import React from 'react';
import { Users } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  isHost?: boolean;
}

interface ParticipantsListProps {
  participants: Participant[];
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({ participants }) => {
  return (
    <div className="bg-gray-800 rounded-lg h-full flex flex-col">
      <div className="p-4 border-b border-gray-700 flex items-center">
        <Users className="w-5 h-5 mr-2" />
        <h3 className="font-semibold">Participants ({participants.length})</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between mb-3 last:mb-0"
          >
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span>{participant.name}</span>
            </div>
            {participant.isHost && (
              <span className="text-xs bg-blue-500 px-2 py-1 rounded">Host</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantsList;