"use client";

import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar, Link } from "@heroui/react";
import { Session } from "next-auth";
import { FaUser, FaCog, FaSignOutAlt, FaChevronDown, FaUserShield } from "react-icons/fa";

interface UserDropdownProps {
  session: Session & { user: { isAdmin: boolean } };
}

const UserDropdown = ({ session }: UserDropdownProps) => {
  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200">
          <Avatar 
            src={session.user.image || undefined} 
            name={session.user.name || session.user.email || ''} 
            size="sm"
            className="ring-2 ring-blue-500/20"
          />
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-semibold text-gray-800">
              {session.user.name || 'Player'}
            </span>
            <span className="text-xs text-gray-500">
              {session.user.email}
            </span>
          </div>
          <FaChevronDown className="text-gray-400 text-xs hidden md:block" />
        </div>
      </DropdownTrigger>
      <DropdownMenu 
        aria-label="User Actions"
        className="w-60"
      >
        <DropdownItem 
          key="profile"
          startContent={<FaUser className="text-gray-500" />}
          as={Link}
          href={session.user.id ? `/players/${session.user.id}` : '/profile'}
        >
          <div className="flex flex-col">
            <span>View Profile</span>
            <span className="text-xs text-gray-500">See your statistics and achievements</span>
          </div>
        </DropdownItem>
        <DropdownItem 
          key="settings"
          startContent={<FaCog className="text-gray-500" />}
          as={Link}
          href="/settings"
        >
          <div className="flex flex-col">
            <span>Settings</span>
            <span className="text-xs text-gray-500">Manage your account</span>
          </div>
        </DropdownItem>
        {session.user.isAdmin ? (
          <DropdownItem 
            key="admin"
            startContent={<FaUserShield className="text-blue-500" />}
            as={Link}
            href="/admin/users"
          >
            <div className="flex flex-col">
              <span>Admin Panel</span>
              <span className="text-xs text-gray-500">Manage users and system settings</span>
            </div>
          </DropdownItem>
        ) : null}
        <DropdownItem 
          key="logout"
          className="text-danger"
          color="danger"
          startContent={<FaSignOutAlt className="text-danger" />}
          as={Link}
          href="/auth/signout"
        >
          Sign Out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

export default UserDropdown;