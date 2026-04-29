import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface NodeSidePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  badge: string;
  badgeColor: string;
  children: React.ReactNode;
}

export function NodeSidePanel({ open, onOpenChange, title, badge, badgeColor, children }: NodeSidePanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[300px] sm:w-[300px] overflow-y-auto p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: badgeColor, color: '#fff' }}>
              {badge}
            </span>
          </div>
          <SheetTitle className="text-left mt-2">{title}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
