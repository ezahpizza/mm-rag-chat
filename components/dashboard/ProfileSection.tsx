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
      <div className="text-center py-8">
        <p className="text-gray-500">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-razza to-desire border-0 shadow-2xl h-[32%]">
      <CardHeader className="text-center h-full flex flex-col justify-center">
        <CardTitle className="text-2xl font-bold text-pearl">
          Welcome back, {user?.firstName || user?.username || 'User'}!
        </CardTitle>
        <p className="text-skye mt-2">Manage your saved summaries and reports</p>
        <div className="mt-4 flex justify-center">
          {showUserProfile ? (
            <div className="fixed inset-0 z-[99] bg-black/50 flex items-center justify-center p-4">
              <div className=" rounded-lg max-w-4xl max-h-[95vh] overflow-hidden relative">
                <Button
                  size="sm"
                  onClick={() => setShowUserProfile(false)}
                  className="absolute top-4 right-4 z-10 bg-pearl hover:bg-razza"
                >
                  ✕
                </Button>
                <UserProfile routing="hash" />
              </div>
            </div>
          ) : (
            <Button 
              size="sm" 
              className="gap-2 bg-pearl hover:bg-cerulean transition-colors text:obsidian hover:text-pearl"
              onClick={() => setShowUserProfile(true)}
            >
              <FaRegEdit className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}