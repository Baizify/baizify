"use client";

import { useState, useEffect } from "react";
import { Session } from "next-auth";
import UserDropdown from "./UserDropdown";
import { Spinner } from "@heroui/react";

interface UserDropdownContainerProps {
  session: Session;
}

interface FullUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  isAdmin: boolean;
}

export default function UserDropdownContainer({ session }: UserDropdownContainerProps) {
  const [user, setUser] = useState<FullUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!session.user.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/users/${session.user.id}`);
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [session.user.id]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-3 py-2">
        <Spinner size="sm" />
      </div>
    );
  }

  // Merge session data with fetched user data
  const enhancedSession: Session = {
    ...session,
    user: {
      ...session.user,
      isAdmin: user?.isAdmin || false
    }
  };

  return <UserDropdown session={enhancedSession} />;
}