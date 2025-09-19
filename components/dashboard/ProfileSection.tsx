import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/card';
import { useUser } from "@clerk/nextjs";
import { UserProfile } from "@clerk/nextjs";
import { Button } from '@/components/button';
import { FaRegEdit } from "react-icons/fa";

export function ProfileSection() {
 const { user } = useUser();
 const [showUserProfile, setShowUserProfile] = useState(false);

 if (!user) {
    return (
      <div className="text-center py-6 sm:py-8">
        <p className="text-gray-500 text-sm sm:text-base">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-razza to-desire border-0 shadow-2xl h-auto min-h-[200px] sm:min-h-[250px] lg:h-[32%]">
      <CardHeader className="text-center h-full flex flex-col justify-center p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-pearl">
          Welcome back, {user?.firstName || user?.username || 'User'}!
        </CardTitle>
        <p className="text-skye mt-2 text-xs sm:text-sm lg:text-base">Manage your saved summaries and reports</p>
        <div className="mt-3 sm:mt-4 flex justify-center">
          {showUserProfile ? (
            <div className="fixed inset-0 z-[99] bg-black/50 flex items-center justify-center p-2 sm:p-4">
              <div className="rounded-lg max-w-4xl max-h-[95vh] w-full overflow-hidden relative">
                <Button
                  size="sm"
                  onClick={() => setShowUserProfile(false)}
                  className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 bg-pearl hover:bg-razza text-xs sm:text-sm"
                >
                  ✕
                </Button>
                <UserProfile routing="hash" />
              </div>
            </div>
          ) : (
            <Button 
              size="sm" 
              className="gap-1 sm:gap-2 bg-pearl hover:bg-cerulean transition-colors text-obsidian hover:text-pearl text-xs sm:text-sm px-3 sm:px-4"
              onClick={() => setShowUserProfile(true)}
            >
              <FaRegEdit className="h-3 w-3 sm:h-4 sm:w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}