"use client";

import { useState } from "react";
import Image from "next/image";
import { getCampusFlag, getOriginCampusColor } from "@/lib/campus";
import { TRANSFER_STATUS_LABELS } from "@/types";
import type { UserType, TransferStatusType } from "@/types";

function getStatusClasses(status: TransferStatusType): string {
  switch (status) {
    case "SEEKING_SWAP":
      return "status-seeking-swap";
    case "HOST_NEEDED":
      return "status-host-needed";
    case "VISA_PROCESS":
      return "status-visa-process";
    case "APPROVED":
      return "status-approved";
    default:
      return "";
  }
}

interface StudentCardProps {
  user: UserType;
}

export default function StudentCard({ user }: StudentCardProps) {
  const [showContact, setShowContact] = useState(false);

  return (
    <div className="glass-card group">
      <div className="flex items-start gap-4 mb-4">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.login}
            width={56}
            height={56}
            className="rounded-full border-2 border-white/10 group-hover:border-neon-cyan/30 transition-colors"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold text-white/60">
            {user.login[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{user.login}</h3>
          <p
            className={`text-sm ${getOriginCampusColor(user.originCampus)}`}
          >
            {user.originCampus}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getCampusFlag(user.targetCampus)}</span>
          <span className="text-sm text-white/70">{user.targetCampus}</span>
        </div>
        <span className={getStatusClasses(user.transferStatus)}>
          {TRANSFER_STATUS_LABELS[user.transferStatus]}
        </span>
      </div>

      <div className="border-t border-white/5 pt-3">
        {!showContact ? (
          <button
            onClick={() => setShowContact(true)}
            className="text-xs text-white/40 hover:text-neon-cyan transition-colors"
          >
            Reveal Contact
          </button>
        ) : (
          <div className="text-xs">
            <span className="text-white/40">Slack: </span>
            <span className="text-neon-cyan font-mono">
              {user.slackLogin || "Not available"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
