"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SECTION_TYPE_LABELS, SECTION_TYPES, type SectionType } from "@/lib/domain/types";

interface AddSectionMenuProps {
  onAdd: (type: SectionType) => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm";
  label?: string;
  className?: string;
}

export function AddSectionMenu({
  onAdd,
  variant = "outline",
  size = "default",
  label = "Add section",
  className,
}: AddSectionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Plus data-icon="inline-start" />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        {SECTION_TYPES.map((type) => (
          <DropdownMenuItem key={type} onSelect={() => onAdd(type)}>
            {SECTION_TYPE_LABELS[type]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
